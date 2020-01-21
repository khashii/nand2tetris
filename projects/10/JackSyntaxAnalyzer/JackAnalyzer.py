from pathlib import Path
import sys
from CompilationEngine import CompilationEngine

if __name__ == "__main__":
    path = Path(sys.argv[1])
    if path.is_dir():
        for jack in list(path.glob("*.jack")):
            with jack.open() as f:
                c = CompilationEngine(f)
                c.parse()
    elif path.is_file():
        with open(path) as f:
            c = CompilationEngine(f)
            c.parse()
    else:
        print("jackファイルかjackファイルの存在するフォルダを指定して下さい")
