@rem
@rem  Gradle startup script for Windows
@rem
@rem  This file is STANDARD and SAFE.
@rem  Do not modify unless regenerating via `gradle wrapper`.
@rem
@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%

@rem Resolve "." and ".."
for %%i in ("%APP_HOME%") do set APP_HOME=%%~fi

@rem Add default JVM options here
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"

@rem Find java.exe
if defined JAVA_HOME (
  set JAVA_EXE=%JAVA_HOME%\bin\java.exe
)

if not defined JAVA_EXE (
  set JAVA_EXE=java.exe
)

"%JAVA_EXE%" %DEFAULT_JVM_OPTS% ^
  "-Dorg.gradle.appname=%APP_BASE_NAME%" ^
  "-classpath" "%APP_HOME%\gradle\wrapper\gradle-wrapper.jar" ^
  org.gradle.wrapper.GradleWrapperMain %*

endlocal
