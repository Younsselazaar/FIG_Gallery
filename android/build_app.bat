@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.14.7-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo Using Java: %JAVA_HOME%
java -version
call gradlew.bat --stop
rmdir /s /q "%USERPROFILE%\.gradle\caches\transforms-3" 2>nul
call gradlew.bat app:installDebug -x lint --no-daemon
