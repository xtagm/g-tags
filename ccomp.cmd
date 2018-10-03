@echo off
cd js
call C:\Utilw\closurecompiler.bat tc.js
call C:\Utilw\closurecompiler.bat tr.js
call C:\Utilw\closurecompiler.bat tm.js
call C:\Utilw\closurecompiler.bat tv.js
call C:\Utilw\closurecompiler.bat cc.js
call C:\Utilw\closurecompiler.bat background.js
cd wap
call C:\Utilw\closurecompiler.bat bp.js
call C:\Utilw\closurecompiler.bat tp.js
call C:\Utilw\closurecompiler.bat ts.js
call C:\Utilw\closurecompiler.bat cp.js
rem cd..
rem cd..
rem echo Copy HTML & CSS to G-Tags
rem copy .\tags.html ..\g-tags
rem copy .\css\tags.css ..\g-tags\css
rem echo Copy Sources to G-Tags
rem copy .\js\*.js ..\g-tags\js
rem echo Copy compiled sources to G-Tags
rem copy .\js\ccomp\*.js ..\g-tags\js\ccomp
