$ws = New-Object -ComObject WScript.Shell
$desktop = [System.Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Code Quest.lnk"
$targetScript = "e:\CODE QUEST\Launch-CodeQuest-App.vbs"

$shortcut = $ws.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetScript
$shortcut.WorkingDirectory = "e:\CODE QUEST"
$shortcut.Description = "CODE QUEST - AI Coding Arena & Placement Prep"
$shortcut.Save()

Write-Output "SUCCESS: Code Quest Desktop Shortcut installed at: $shortcutPath"
