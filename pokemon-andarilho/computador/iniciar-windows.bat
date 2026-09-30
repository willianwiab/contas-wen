@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando pela primeira vez, espera um pouquinho...
  call npm install
)
call npm start
