#!/bin/bash
cd ..
cd ..
cd "ControlAssessments.Console.Utilities/bin/"

if [ -d "Debug" ]; then
  cd "Debug/"
else
  cd "Release/"
fi

cd "net6.0/"

./ControlAssessments.ConsoleUtilities.exe BuildT4