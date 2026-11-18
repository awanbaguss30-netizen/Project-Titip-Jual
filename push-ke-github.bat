@echo off
title Push Project titipjualsecond ke GitHub
echo ========================================================
echo   MENGHUBUNGKAN DAN PUSH KE GITHUB
echo   Repo: https://github.com/awanbaguss30-netizen/Project-Titip-Jual.git
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Memeriksa status Git...
git status
echo.

echo 2. Melakukan push ke branch main...
echo (Jika muncul jendela browser atau permintaan login, silakan login ke akun GitHub Anda)
echo.
git push -u origin main

echo.
echo ========================================================
echo Selesai! Tekan tombol apa saja untuk menutup jendela ini.
echo ========================================================
pause >nul
