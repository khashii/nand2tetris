

class SymbolTable():
    def __init__(self):
        """
        空のシンボルテーブルを生成する
        """
        self.tbl_for_class = {}
        self.tbl_for_class["static"] = {}
        self.tbl_for_class["field"] = {}

    def startSubroutine(self) -> None:
        """
        新しいサブルーチンのスコープを開始する
        (つまり、サブルーチンのシンボルテーブルをリセットする)
        """
        self.tbl_for_subr = {}
        self.tbl_for_subr["argument"] = {}
        self.tbl_for_subr["var"] = {}

    def define(self, name: str, type: str,
               kind: "static" or "field" or "argument" or "var") -> None:
        """
        引数の名前、型、属性で指定された新しい識別子を定義し、それに実行インデックスを
        割り当てる。staticとfield属性の識別子はクラスのスコープを持ち、argとvar属性の識別子は
        サブルーチンのスコープを持つ
        """
        if kind in ("argument", "var"):
            self.tbl_for_subr[kind][name] = {
                "idx": len(self.tbl_for_subr[kind]),
                "type": type,
            }
        elif kind in ("static", "field"):
            self.tbl_for_class[kind][name] = {
                "idx": len(self.tbl_for_class[kind]),
                "type": type,
            }

    def varCount(
        self, kind: "static" or "field" or "argument" or "var"
    ) -> int:
        """
        引数で与えられた属性について、それが現在のスコープで定義されている数を返す
        """
        if kind in ("argument", "var"):
            return len(self.tbl_for_subr[kind])
        elif kind in ("static", "field"):
            return len(self.tbl_for_class[kind])

    def kindOf(
        self,
        name: str
    ) -> "static" or "field" or "argument" or "var" or "NONE":
        """
        引数で与えられた名前の識別子を現在のスコープで探し、その属性を返す。
        その識別子が現在のスコープで見つからなければ、NONEを返す
        """
        if hasattr(self, "tbl_for_subr"):
            if name in self.tbl_for_subr["argument"]:
                return "argument"
            elif name in self.tbl_for_subr["var"]:
                return "var"
        if name in self.tbl_for_class["static"]:
            return "static"
        elif name in self.tbl_for_class["field"]:
            return "field"
        else:
            return "NONE"

    def typeOf(self, name: str) -> str:
        """
        引数で与えられた名前の識別子を現在のスコープで探し、その型を返す
        """
        if hasattr(self, "tbl_for_subr"):
            if name in self.tbl_for_subr["argument"]:
                return self.tbl_for_subr["argument"][name]["type"]
            elif name in self.tbl_for_subr["var"]:
                return self.tbl_for_subr["var"][name]["type"]
        if name in self.tbl_for_class["static"]:
            return self.tbl_for_class["static"][name]["type"]
        elif name in self.tbl_for_class["field"]:
            return self.tbl_for_class["field"][name]["type"]
        else:
            raise ValueError(f"typeが見つかりません: {name}")

    def indexOf(self, name: str) -> int:
        """
        引数で与えられた名前の識別子を現在のスコープで探し、そのインデックスを返す
        """
        if hasattr(self, "tbl_for_subr"):
            if name in self.tbl_for_subr["argument"]:
                return self.tbl_for_subr["argument"][name]["idx"]
            elif name in self.tbl_for_subr["var"]:
                return self.tbl_for_subr["var"][name]["idx"]
        if name in self.tbl_for_class["static"]:
            return self.tbl_for_class["static"][name]["idx"]
        elif name in self.tbl_for_class["field"]:
            return self.tbl_for_class["field"][name]["idx"]
        else:
            raise ValueError(f"idxが見つかりません: {name}")
