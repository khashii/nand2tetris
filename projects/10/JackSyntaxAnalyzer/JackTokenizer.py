import io
import re


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
        self.token = None

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

    def tokenType(self) -> "KEYWORD" or "SYMBOL" or "IDENTIFIER" \
                           or "INT_CONST" or "STRING_CONST":
        """
            現トークンの種類を返す
        """
        keywords = ["class", "constructor", "function", "method", "field",
                    "static", "var", "int", "char", "boolean", "void", "true",
                    "false", "null", "this", "let", "do", "if", "else",
                    "while", "return"]
        symbols = ["{", "}", "(", ")", "[", "]", ".", ",", ";", "+", "-", "*",
                   "/", "&", "|", "<", ">", "=", "~"]
        if self.token in keywords:
            return "KEYWORD"
        elif self.token in symbols:
            return "SYMBOL"
        elif self.token.isnumeric() and \
                0 <= int(self.token) and int(self.token) <= 32767:
            return "INT_CONST"
        elif re.match(r"^\".*\"$", self.token) and \
                "\n" not in self.token:
            return "STRING_CONST"
        elif not self.token[0].isnumeric() and \
            all(list(map(
                        lambda t: t.isalpha() or t.isnumeric() or t == "_",
                        self.token
                        ))):
            return "IDENTIFIER"
        else:
            print(f"トークンの種類が分かりませんでした: {self.token}")

    def keyWord(self) -> "CLASS" or "METHOD" or "FUNCTION" or "CONSTRUCTOR" \
                         or "INT" or "BOOLEAN" or "CHAR" or "VOID" or "VAR" \
                         or "STATIC" or "FIELD" or "LET" or "DO" or "IF" \
                         or "ELSE" or "WHILE" or "RETURN" or "TRUE" \
                         or "FALSE" or "NULL" or "THIS":
        """
            現トークンのキーワードを返す。
            このルーチンは、tokenType()がKEYWORDの場合のみ呼び出すことができる。
        """
        return self.token.upper()

    def symbol(self) -> str:
        """
            現トークンの文字を返す。
            このルーチンは、tokenType()がSYMBOLの場合のみ呼び出すことができる。
        """
        if self.token == "<":
            return "&lt;"
        elif self.token == ">":
            return "&gt;"
        elif self.token == "&":
            return "&amp;"
        else:
            return self.token

    def identifier(self) -> str:
        """
            現トークンの識別子(identifier)を返す。
            このルーチンは、tokenType()がIDENTIFERの場合のみ呼び出すことができる。
        """
        return self.token

    def intVal(self) -> int:
        """
            現トークンの整数の値を返す。
            このルーチンは、tokenType()がINT_CONSTの場合のみ呼び出すことができる。
        """
        return int(self.token)

    def stringVal(self) -> str:
        """
            現トークンの文字列を返す。
            このルーチンは、tokenType()がSTRING_CONSTの場合のみ呼び出すことができる。
        """
        return re.sub("\"", "", self.token)

    def tokenize(self) -> None:
        file = self.file
        symbols = ["{", "}", "(", ")", "[", "]", ".", ",", ";", "+", "-", "*",
                   "/", "&", "|", "<", ">", "=", "~"]
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

        arr = ["<tokens>"]
        while self.hasMoreTokens():
            self.advance()
            token_type = self.tokenType()
            if token_type == "KEYWORD":
                arr.append(f"<keyword> {self.keyWord().lower()} </keyword>")
            elif token_type == "SYMBOL":
                arr.append(f"<symbol> {self.symbol()} </symbol>")
            elif token_type == "IDENTIFIER":
                arr.append(f"<identifier> {self.identifier()} </identifier>")
            elif token_type == "INT_CONST":
                arr.append(
                    f"<integerConstant> {self.intVal()} </integerConstant>"
                )
            elif token_type == "STRING_CONST":
                arr.append(
                    f"<stringConstant> {self.stringVal()} </stringConstant>"
                )
        arr.append("</tokens>")
        with open(f"./{self.filename}T.xml", "w") as output:
            output.write("\n".join(arr))
