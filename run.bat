@echo off
chcp 65001 > nul
echo =================================================================
echo   [3D시뮬레이션을 이용한 사물 구현화] (Realize3D Studio)
echo   로컬 웹 서버를 실행합니다...
echo   브라우저가 자동으로 열립니다. (주소: http://localhost:8080)
echo =================================================================
start http://localhost:8080
python server.py
pause
