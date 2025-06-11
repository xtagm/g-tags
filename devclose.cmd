@echo off
if exist devinit goto close
echo Dev not initiated, cannot close...
goto endpause
:close
echo -- Copy development in parent folder -------------------
copy .\js\ccomp\tc.js .\js\tc.js
copy .\js\ccomp\tr.js .\js\tr.js
copy .\js\ccomp\tm.js .\js\tm.js
copy .\js\ccomp\tv.js .\js\tv.js
copy .\js\ccomp\cc.js .\js\cc.js
copy .\js\wap\ccomp\tp.js .\js\wap\tp.js
copy .\js\wap\ccomp\ts.js .\js\wap\ts.js
copy .\js\wap\ccomp\cp.js .\js\wap\cp.js
ren devinit devclose
call ccomp.cmd
goto end
:endpause
pause
:end
