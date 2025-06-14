@echo off
if exist devclose goto init
echo Dev already initiated...
goto end
:init
echo -- Copy parent folder in dev -------------------
if exist .\js\tc.js copy .\js\tc.js .\js\ccomp\tc.js
if exist .\js\tr.js copy .\js\tr.js .\js\ccomp\tr.js
if exist .\js\tm.js copy .\js\tm.js .\js\ccomp\tm.js
if exist .\js\tv.js copy .\js\tv.js .\js\ccomp\tv.js
if exist .\js\cc.js copy .\js\cc.js .\js\ccomp\cc.js
if exist .\js\wap\tp.js copy .\js\wap\tp.js .\js\wap\ccomp\tp.js
if exist .\js\wap\ts.js copy .\js\wap\ts.js .\js\wap\ccomp\ts.js
if exist .\js\wap\cp.js copy .\js\wap\cp.js .\js\wap\ccomp\cp.js
ren devclose devinit
:end
pause
