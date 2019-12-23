from pathlib import Path
import sys
import JackTokenizer

if __name__ == "__main__":
    path = Path(sys.argv[1])
    if path.is_dir():
        for jack in list(path.glob("*.jack")):
            with jack.open() as f:
                tokenizer = JackTokenizer.JackTokenizer(f)
                tokenizer.tokenize()
    elif path.is_file():
        with open(path) as f:
            tokenizer = JackTokenizer.JackTokenizer(f)
            tokenizer.tokenize()
    else:
        print("jackファイルかjackファイルの存在するフォルダを指定して下さい")
