@echo off
if "%1"=="" goto :eof
@echo Compile %~1.....
setlocal enabledelayedexpansion enableextensions
set inputfile=%1
call :dir_output outputdir !inputfile!
if not exist "%outputdir%\*.*" md "%outputdir%"
set outputfile=%outputdir%\%~nx1
java -jar %2 --js %inputfile% --js_output_file "%outputfile%" 
@echo Done.
goto :eof
:dir_output <resultVar> <pathVar>
(
    set "%~1=%~dp2ccomp
    exit /b
)
:eof
endlocal