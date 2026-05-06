@echo off
title CampusMart Starter
echo Starting CampusMart Server...

cd /d "%~dp0server"
start http://localhost:5000
npm start
pause
