@echo off
SET input_folder=./dist/
rem SET input_folder=%1
rem IF "%1"=="" (
rem 	ECHO Unknown folder. Usage: %0 INPUT_PATH [OUTPUT_PATH]
rem 	echo.
rem 	pause
rem 	exit
rem )
CD %input_folder%
rem Text only:
rem for /d %%a in (*) do (ECHO 7z.exe a -tzip "%%~na.zip" "%%a\*")
for /d %%a in (*) do (7z.exe a -tzip "%%~na.zip" "%%a\*")

pause