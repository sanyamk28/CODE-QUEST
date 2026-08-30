from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.api.v1.deps import get_current_user, get_current_admin
from app.models.models import User, Profile, Subtopic, Submission, LoginHistory
from app.schemas.schemas import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserResponse, OnboardingRequest, ProfileResponse, GoogleLoginRequest, StudentAdminResponse, StudentProgressResponse
import httpx
import secrets

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

def log_login_event(db: Session, user_id, auth_provider: str, request: Request):
    ip_address = request.client.host if request.client else "unknown"
    device_info = request.headers.get("user-agent", "Unknown Device")
    log = LoginHistory(
        user_id=user_id,
        auth_provider=auth_provider,
        ip_address=ip_address,
        device_info=device_info
    )
    db.add(log)
    db.commit()

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Log standard login event
    log_login_event(db, user.id, "local", request)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    id_token = payload.id_token
    email = None
    name = "Google User"
    
    # 1. Verify token (Mock vs. Live)
    if id_token.startswith("mock-google-token-"):
        # For mock/offline/testing
        email = id_token.replace("mock-google-token-", "")
        # Format name from email (e.g. alex.chen@gmail.com -> Alex Chen)
        email_prefix = email.split("@")[0]
        name = " ".join([word.capitalize() for word in email_prefix.split(".")])
    else:
        # Live Google verification using Google tokeninfo API
        try:
            response = httpx.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": id_token},
                timeout=5.0
            )
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid Google token"
                )
            token_info = response.json()
            # Verify issuer
            if token_info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token issuer"
                )
            email = token_info.get("email")
            name = token_info.get("name", "Google User")
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not reach Google verification server"
            )
            
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token did not contain an email address"
        )
        
    # 2. Check if user exists
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # 3. Auto-register user
        random_password = secrets.token_hex(16)
        user = User(
            email=email,
            hashed_password=get_password_hash(random_password),
            is_active=True,
            is_admin=False,
            auth_provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # 4. Create default profile for the user
        profile = Profile(
            user_id=user.id,
            name=name,
            xp=10,
            streak=1,
            readiness_score=10.0
        )
        db.add(profile)
        db.commit()
        db.refresh(user)
        
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    # 5. Generate and return JWT tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Log login tracking details
    log_login_event(db, user.id, "google", request)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_in: TokenRefresh):
    payload = decode_token(refresh_in.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token"
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token payload"
        )
        
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/onboard", response_model=ProfileResponse)
def onboard_user(
    onboard_in: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if user profile already exists
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # Base readiness score calculated from onboarding details
    # E.g., Starting readiness is a weighted average of starting domain levels
    base_readiness = (onboard_in.dsa_level + onboard_in.sql_level + onboard_in.aptitude_level) / 3.0
    # Add bonus score for setting daily targets
    if onboard_in.daily_study_goal > 2:
        base_readiness += 5.0
    base_readiness = min(max(base_readiness, 5.0), 99.0) # Clamp
    
    if profile:
        # Update existing profile
        profile.name = onboard_in.name
        profile.college = onboard_in.college
        profile.degree = onboard_in.degree
        profile.graduation_year = onboard_in.graduation_year
        profile.target_role = onboard_in.target_role
        profile.experience_level = onboard_in.experience_level
        profile.target_companies = onboard_in.target_companies
        profile.prep_duration = onboard_in.prep_duration
        profile.daily_study_goal = onboard_in.daily_study_goal
        profile.skills = onboard_in.skills
        profile.dsa_level = onboard_in.dsa_level
        profile.sql_level = onboard_in.sql_level
        profile.aptitude_level = onboard_in.aptitude_level
        profile.readiness_score = base_readiness
    else:
        # Create new profile
        profile = Profile(
            user_id=current_user.id,
            name=onboard_in.name,
            college=onboard_in.college,
            degree=onboard_in.degree,
            graduation_year=onboard_in.graduation_year,
            target_role=onboard_in.target_role,
            experience_level=onboard_in.experience_level,
            target_companies=onboard_in.target_companies,
            prep_duration=onboard_in.prep_duration,
            daily_study_goal=onboard_in.daily_study_goal,
            skills=onboard_in.skills,
            dsa_level=onboard_in.dsa_level,
            sql_level=onboard_in.sql_level,
            aptitude_level=onboard_in.aptitude_level,
            readiness_score=base_readiness,
            xp=10, # Initial signup XP
            streak=1
        )
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    
    return profile

@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please complete onboarding."
        )
    return profile

from typing import List

@router.get("/students", response_model=List[StudentAdminResponse])
def get_students(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    students = db.query(User).filter(User.is_admin == False).all()
    res = []
    for student in students:
        profile = student.profile
        res.append({
            "id": str(student.id),
            "email": student.email,
            "auth_provider": student.auth_provider if student.auth_provider else "local",
            "created_at": student.created_at,
            "name": profile.name if profile else "Student",
            "college": profile.college if profile else None,
            "degree": profile.degree if profile else None,
            "target_role": profile.target_role if profile else None,
            "xp": profile.xp if profile else 0,
            "readiness_score": profile.readiness_score if profile else 0.0,
        })
    return res

@router.get("/students/{student_id}/progress", response_model=StudentProgressResponse)
def get_student_progress(
    student_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    import uuid
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    student = db.query(User).filter(User.id == student_uuid).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    profile = student.profile
    submissions = db.query(Submission).filter(Submission.user_id == student_uuid).order_by(Submission.created_at.desc()).all()
    logins = db.query(LoginHistory).filter(LoginHistory.user_id == student_uuid).order_by(LoginHistory.login_time.desc()).all()
    
    submission_details = []
    for sub in submissions:
        submission_details.append({
            "id": sub.id,
            "question_title": sub.question.title if sub.question else "Unknown Problem",
            "type": sub.question.type if sub.question else "coding",
            "score": sub.score,
            "is_correct": sub.is_correct,
            "created_at": sub.created_at
        })
        
    login_details = []
    for l in logins:
        login_details.append({
            "id": l.id,
            "login_time": l.login_time,
            "ip_address": l.ip_address,
            "auth_provider": l.auth_provider,
            "device_info": l.device_info
        })
        
    return {
        "id": str(student.id),
        "email": student.email,
        "name": profile.name if profile else "Student",
        "college": profile.college if profile else None,
        "degree": profile.degree if profile else None,
        "target_role": profile.target_role if profile else None,
        "xp": profile.xp if profile else 0,
        "readiness_score": profile.readiness_score if profile else 0.0,
        "is_active": student.is_active,
        "dsa_level": profile.dsa_level if profile else 0.0,
        "sql_level": profile.sql_level if profile else 0.0,
        "cs_fundamentals_level": profile.cs_fundamentals_level if profile else 0.0,
        "aptitude_level": profile.aptitude_level if profile else 0.0,
        "submissions": submission_details,
        "logins": login_details
    }

@router.post("/students/{student_id}/toggle-active")
def toggle_student_active(
    student_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    import uuid
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    student = db.query(User).filter(User.id == student_uuid).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student.is_active = not student.is_active
    db.commit()
    return {"message": "Success", "is_active": student.is_active}

@router.delete("/students/{student_id}")
def delete_student(
    student_id: str,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    import uuid
    try:
        student_uuid = uuid.UUID(student_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    student = db.query(User).filter(User.id == student_uuid).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    db.delete(student)
    db.commit()
    return {"message": "Student successfully deleted"}
