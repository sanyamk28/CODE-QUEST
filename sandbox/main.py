import os
import sys
import time
import subprocess
import tempfile
import shutil
import pwd
from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel

app = FastAPI(title="PlacementForge Code Execution Sandbox")

# Load configuration
SANDBOX_SECRET_TOKEN = os.getenv("SANDBOX_SECRET_TOKEN", "devsandboxsecrettoken")

class CodeExecutionRequest(BaseModel):
    code: str
    language: str
    input_data: Optional[str] = ""
    timeout: Optional[float] = 5.0

class CodeExecutionResponse(BaseModel):
    status: str  # SUCCESS, COMPILE_ERROR, RUNTIME_ERROR, TIMEOUT, SYSTEM_ERROR
    stdout: str
    stderr: str
    exit_code: Optional[int] = None
    execution_time: float

# Resolve sandbox_user UID and GID
try:
    user_info = pwd.getpwnam("sandbox_user")
    SANDBOX_UID = user_info.pw_uid
    SANDBOX_GID = user_info.pw_gid
except KeyError:
    # Fallback to current process user if running locally/development outside Docker
    SANDBOX_UID = os.getuid() if hasattr(os, "getuid") else 0
    SANDBOX_GID = os.getgid() if hasattr(os, "getgid") else 0

def demote_process():
    """Sets the uid/gid of the subprocess to the sandbox user for security."""
    if hasattr(os, "setgid") and hasattr(os, "setuid"):
        try:
            os.setgid(SANDBOX_GID)
            os.setuid(SANDBOX_UID)
        except PermissionError:
            pass # Fail silently if not running as root (e.g. dev local)

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    token = authorization.replace("Bearer ", "")
    if token != SANDBOX_SECRET_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid authorization token")
    return token

@app.post("/execute", response_model=CodeExecutionResponse, dependencies=[Depends(verify_token)])
def execute_code(request: CodeExecutionRequest):
    lang = request.language.lower()
    temp_dir = tempfile.mkdtemp(prefix="exec_")
    
    # Change temporary directory ownership so the demoted user can access it
    if hasattr(os, "chown"):
        try:
            os.chown(temp_dir, SANDBOX_UID, SANDBOX_GID)
        except PermissionError:
            pass

    response_status = "SUCCESS"
    stdout_content = ""
    stderr_content = ""
    exit_code = 0
    start_time = time.time()
    
    try:
        if lang == "python":
            source_file = os.path.join(temp_dir, "solution.py")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(request.code)
            
            run_cmd = ["python3", "solution.py"]
            
        elif lang in ["cpp", "c++"]:
            source_file = os.path.join(temp_dir, "solution.cpp")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(request.code)
            
            # Compile C++ code
            compile_cmd = ["g++", "-O3", "solution.cpp", "-o", "solution.out"]
            compile_proc = subprocess.run(
                compile_cmd,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10.0
            )
            
            if compile_proc.returncode != 0:
                return CodeExecutionResponse(
                    status="COMPILE_ERROR",
                    stdout="",
                    stderr=compile_proc.stderr,
                    exit_code=compile_proc.returncode,
                    execution_time=time.time() - start_time
                )
            
            run_cmd = ["./solution.out"]
            
        elif lang == "java":
            # In Java, the class name must match the filename. We assume class is "Solution"
            source_file = os.path.join(temp_dir, "Solution.java")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(request.code)
            
            # Compile Java code
            compile_cmd = ["javac", "Solution.java"]
            compile_proc = subprocess.run(
                compile_cmd,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10.0
            )
            
            if compile_proc.returncode != 0:
                return CodeExecutionResponse(
                    status="COMPILE_ERROR",
                    stdout="",
                    stderr=compile_proc.stderr,
                    exit_code=compile_proc.returncode,
                    execution_time=time.time() - start_time
                )
            
            run_cmd = ["java", "Solution"]
            
        elif lang in ["javascript", "js"]:
            source_file = os.path.join(temp_dir, "solution.js")
            with open(source_file, "w", encoding="utf-8") as f:
                f.write(request.code)
            
            run_cmd = ["node", "solution.js"]
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported language: {lang}")

        # Execute code under demoted sandbox user
        start_exec = time.time()
        proc = subprocess.Popen(
            run_cmd,
            cwd=temp_dir,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            preexec_fn=demote_process
        )
        
        try:
            stdout_content, stderr_content = proc.communicate(
                input=request.input_data,
                timeout=request.timeout
            )
            exit_code = proc.returncode
            if exit_code != 0:
                response_status = "RUNTIME_ERROR"
        except subprocess.TimeoutExpired:
            proc.kill()
            stdout_content, stderr_content = proc.communicate()
            response_status = "TIMEOUT"
            stderr_content = f"Execution timed out after {request.timeout} seconds.\n" + stderr_content
            
        execution_time = time.time() - start_exec
        
    except Exception as e:
        response_status = "SYSTEM_ERROR"
        stderr_content = str(e)
        execution_time = time.time() - start_time
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
        
    return CodeExecutionResponse(
        status=response_status,
        stdout=stdout_content,
        stderr=stderr_content,
        exit_code=exit_code,
        execution_time=execution_time
    )
