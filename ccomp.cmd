@echo off
@echo off
if exist devclose goto compress
echo Dev ongoing, run devclose.cmd first...
goto end
:compress
cd js
echo -- Compile sources -------------------
call ..\compiler.bat tc.js ..\compiler.jar
call ..\compiler.bat tr.js ..\compiler.jar
call ..\compiler.bat tm.js ..\compiler.jar
call ..\compiler.bat tv.js ..\compiler.jar
call ..\compiler.bat cc.js ..\compiler.jar
cd wap
call ..\..\compiler.bat tp.js ..\..\compiler.jar
call ..\..\compiler.bat ts.js ..\..\compiler.jar
call ..\..\compiler.bat cp.js ..\..\compiler.jar
:end
pause
