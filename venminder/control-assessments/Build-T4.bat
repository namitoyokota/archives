cd..
cd..

if exist ControlAssessments.Console.Utilities\bin\Debug\net6.0\ (
  cd ControlAssessments.Console.Utilities\bin\Debug\net6.0\
) else (
  cd ControlAssessments.Console.Utilities\bin\Release\net6.0\
)

ControlAssessments.ConsoleUtilities.exe BuildT4

:: return to batch file directory
cd "%~dp0" 