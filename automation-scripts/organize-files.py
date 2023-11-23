import os
from pathlib import Path

SUBDIR = {
    "DOCUMENTS": [".pdf",".docx",".txt"],
    "CODE": [".json", ".xml", ".ts", ".js", ".md", ".ps1", ".csv"],
    "AUDIO": [".m4a",".m4b",".mp3"],
    "IMAGES": [".jpg",".jpeg",".png", ".svg", ".heic"],
    "EXECTUABLE": [".exe", ".pfx", ".zip"],
}

def pickDir(value):
    for category, ekstensi in SUBDIR.items():
        for suffix in ekstensi:
            if suffix == value:
                return category

def organizeDir():
    for item in os.scandir():
        if item.is_dir():
            continue

        filePath = Path(item)
        fileType = filePath.suffix.lower()
        directory = pickDir(fileType)

        if directory == None:
            continue

        directoryPath = Path(directory)
        if directoryPath.is_dir() != True:
                directoryPath.mkdir()
        filePath.rename(directoryPath.joinpath(filePath))

organizeDir()