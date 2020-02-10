

class VMWriter():
    """
    VMコマンドの構文に従い、VMコマンドをファイルへ書き出す
    """
    def __init__(self):
        """
        新しいファイルを作り、それに書き込む準備をする
        """

    def writePush(self, segment: str, index: int) -> None:
        """
        pushコマンドを書く
        """
        f"push {segment} {index}"

    def writePop(self, segment: str, index: int) -> None:
        """
        popコマンドを書く
        """
        f"pop {segment} {index}"

    def writeArithmetic(self, command: str) -> None:
        """
        算術コマンドを書く
        """
        f"{command}"

    def writeLabel(self, label: str) -> None:
        """
        labelコマンドを書く
        """
        f"label {label}"

    def writeGoto(self, label: str) -> None:
        """
        gotoコマンドを書く
        """
        f"goto {label}"

    def writeIf(self, label: str) -> None:
        """
        if-gotoコマンドを書く
        """
        f"if-goto {label}"

    def writeCall(self, name: str, nArgs: int) -> None:
        """
        callコマンドを書く
        nArgs 引数の数
        """
        f"call {name} {nArgs}"

    def writeFunction(self, name: str, nLocals: int) -> None:
        """
        functionコマンドを書く
        nLocals ローカル変数の数
        """
        f"function {name} {nLocals}"

    def writeReturn(self) -> None:
        """
        returnコマンドを書く
        """
        "return"

    def close(self) -> None:
        """
        出力ファイルを閉じる
        """
