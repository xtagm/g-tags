@echo off
if exist devclose goto init
echo Dev already initiated...
goto fin
:init
copy .\js\tc.js .\js\ccomp\tc.js
copy .\js\tr.js .\js\ccomp\tr.js
copy .\js\tm.js .\js\ccomp\tm.js
copy .\js\tv.js .\js\ccomp\tv.js
copy .\js\cc.js .\js\ccomp\cc.js
copy .\js\wap\tp.js .\js\wap\ccomp\tp.js
copy .\js\wap\ts.js .\js\wap\ccomp\ts.js
copy .\js\wap\cp.js .\js\wap\ccomp\cp.js
ren devclose devinit
:fin
pause
