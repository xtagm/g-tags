@echo off
@echo off
if exist devclose goto compress
echo Dev ongoing, run devclose.cmd first...
goto end
:compress
cd js
echo -- Compile sources -------------------
call D:\Utils\closurecompiler.bat tc.js
call D:\Utils\closurecompiler.bat tr.js
call D:\Utils\closurecompiler.bat tm.js
call D:\Utils\closurecompiler.bat tv.js
call D:\Utils\closurecompiler.bat cc.js
cd wap
call D:\Utils\closurecompiler.bat tp.js
call D:\Utils\closurecompiler.bat ts.js
call D:\Utils\closurecompiler.bat cp.js
:end
pause
