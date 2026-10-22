@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo        Installing CODE QUEST to your Laptop Desktop
echo ==========================================================
echo.

set "TARGET_PATH=%~dp0Launch-CodeQuest-App.vbs"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Code Quest.lnk"
set "ICON_PATH=%~dp0frontend\public\icon-512.svg"

:: PowerShell command to create desktop shortcut
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; ^
   $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); ^
   $s.TargetPath = '%TARGET_PATH%'; ^
   $s.WorkingDirectory = '%~dp0'; ^
   $s.Description = 'CODE QUEST — AI Coding Arena & Placement Prep'; ^
   $s.Save()"

echo.
echo [OK] Code Quest desktop app installed successfully!
echo [OK] Shortcut created on your Desktop:
echo      "%SHORTCUT_PATH%"
echo.
echo You can now double-click "Code Quest" on your desktop anytime!
echo.
pause
