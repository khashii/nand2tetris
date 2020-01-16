import io
import re


SYMBOLS = ["{", "}", "(", ")", "[", "]", ".", ",", ";", "+", "-", "*",
           "/", "&", "|", "<", ">", "=", "~"]
MAX_INT = 32767


class JackTokenizer():
    """
        入力ストリームからすべてのコメントと空白文字を取り除き、
        Jack文法に従いJack言語のトークンへ分割する。
    """

    def __init__(self, file: io.TextIOWrapper):
        """
            入力ファイル/ストリームを開き、トークン化を行う準備をする
        """
        self.filename = re.sub(r".jack$", "", file.name)
        self.file = file.read()
        self.tokens = []
        self.token: str = None
        self.tokenize()

    def hasMoreTokens(self) -> bool:
        """
            入力にまだトークンは存在するか？
        """
        return len(self.tokens) > 0

    def advance(self) -> None:
        """
            入力から次のトークンを取得し、それを現在のトークン(現トークン)とする。
            このルーチンは、hasMoreTokens()がtrueの場合のみ呼び出すことができる。
            また、最初は現トークンは設定されていない。
        """
        self.token = self.tokens.pop(0)

    def go_back(self) -> None:
        self.tokens.insert(0, self.token)

    def look_ahead(self) -> str:
        """
        先読みをする
        """
        return self.tokens[0]

    def tokenType(self) -> "keyword" or "symbol" or "identifier" \
                           or "integerrConstant" or "stringConstant":
        """
            現トークンの種類を返す
        """
        keywords = ["class", "constructor", "function", "method", "field",
                    "static", "var", "int", "char", "boolean", "void", "true",
                    "false", "null", "this", "let", "do", "if", "else",
                    "while", "return"]
        symbols = SYMBOLS
        if self.token in keywords:
            return "keyword"
        elif self.token in symbols:
            return "symbol"
        elif self.token.isnumeric() and \
                0 <= int(self.token) and int(self.token) <= MAX_INT:
            return "integerConstant"
        elif re.match(r"^\".*\"$", self.token) and \
                "\n" not in self.token:
            return "stringConstant"
        elif not self.token[0].isnumeric() and \
            all(list(map(
                        lambda t: t.isalpha() or t.isnumeric() or t == "_",
                        self.token
                        ))):
            return "identifier"
        else:
            print(f"トークンの種類が分かりませんでした: {self.token}")

    def keyWord(self) -> "class" or "method" or "function" or "constructor" \
                         or "int" or "boolean" or "char" or "void" or "var" \
                         or "static" or "field" or "let" or "do" or "if" \
                         or "else" or "while" or "return" or "true" \
                         or "false" or "null" or "this":
        """
            現トークンのキーワードを返す。
            このルーチンは、tokenType()がkeywordの場合のみ呼び出すことができる。
        """
        return self.token

    def symbol(self) -> str:
        """
            現トークンの文字を返す。
            このルーチンは、tokenType()がsymbolの場合のみ呼び出すことができる。
        """
        return self.do_escape(self.token)

    def do_escape(self, s: str) -> str:
        if s == "<":
            return "&lt;"
        elif s == ">":
            return "&gt;"
        elif s == "&":
            return "&amp;"
        else:
            return s

    def identifier(self) -> str:
        """
            現トークンの識別子(identifier)を返す。
            このルーチンは、tokenType()がidentifierの場合のみ呼び出すことができる。
        """
        return self.token

    def intVal(self) -> int:
        """
            現トークンの整数の値を返す。
            このルーチンは、tokenType()がintegerConstantの場合のみ呼び出すことができる。
        """
        return int(self.token)

    def stringVal(self) -> str:
        """
            現トークンの文字列を返す。
            このルーチンは、tokenType()がstringConstantの場合のみ呼び出すことができる。
        """
        return re.sub("\"", "", self.token)

    def cov2_xml_elm(self) -> str:
        token_type = self.tokenType()
        elm = ""
        if token_type == "keyword":
            elm = self.keyWord()
        elif token_type == "symbol":
            elm = self.symbol()
        elif token_type == "identifier":
            elm = self.identifier()
        elif token_type == "integerConstant":
            elm = self.intVal()
        elif token_type == "stringConstant":
            elm = self.stringVal()
        else:
            print(f"トークンのタイプが不明: {self.token}")
        return f"<{token_type}> {elm} </{token_type}>"

    def tokenize(self) -> None:
        file = self.file
        symbols = SYMBOLS
        tmp_str = ""
        i = 0
        while i < len(file):
            # 文字列判定
            if file[i] == '"':
                tmp_str = '"'
                i += 1
                while file[i] != '"':
                    tmp_str += file[i]
                    i += 1
                tmp_str += '"'
                self.tokens.append(tmp_str)
                tmp_str = ""
            # //コメント判定
            elif file[i] == "/" and file[i+1] == "/":
                while file[i] != "\n":
                    i += 1
            # /* */コメント判定
            elif file[i] == "/" and file[i+1] == "*":
                i += 2
                while not (file[i] == "*" and file[i+1] == "/"):
                    i += 1
                i += 1
            # シンボル判定
            elif file[i] in symbols:
                self.tokens.append(file[i])
            # 空白文字判定
            elif re.match(r"\s", file[i]):
                pass
            else:
                while ((file[i] not in symbols) and
                       (not re.match(r"\s", file[i]))):
                    tmp_str += file[i]
                    i += 1
                self.tokens.append(tmp_str)
                tmp_str = ""
                i -= 1
            i += 1
