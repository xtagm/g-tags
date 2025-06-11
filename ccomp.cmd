@echo off
cd js
call D:\Utils\closurecompiler.bat tc.js
call D:\Utils\closurecompiler.bat tr.js
call D:\Utils\closurecompiler.bat tm.js
call D:\Utils\closurecompiler.bat tv.js
call D:\Utils\closurecompiler.bat cc.js
rem call D:\Utils\closurecompiler.bat background.js
cd wap
rem call D:\Utils\closurecompiler.bat bp.js
call D:\Utils\closurecompiler.bat tp.js
call D:\Utils\closurecompiler.bat ts.js
call D:\Utils\closurecompiler.bat cp.js
rem cd..
rem cd..
rem echo Copy HTML & CSS to G-Tags
rem copy .\tags.html ..\g-tags
rem copy .\css\tags.css ..\g-tags\css
rem echo Copy Sources to G-Tags
rem copy .\js\*.js ..\g-tags\js
rem echo Copy compiled sources to G-Tags
rem copy .\js\ccomp\*.js ..\g-tags\js\ccomp

pause
