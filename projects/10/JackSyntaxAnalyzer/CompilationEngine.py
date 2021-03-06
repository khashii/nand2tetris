import io
from JackTokenizer import JackTokenizer
import re


class CompilationEngine():
    """
    JackTokenizerから入力を受け取り、
    構文解析された構造を出力ファイル/ストリームへ出力する。
    """

    def __init__(self, file: io.TextIOWrapper):
        """
        与えられた入力と出力に対して新しいコンパイルエンジンを生成する。
        次に呼ぶルーチンはcompileClass()でなければならない
        """
        self.tokenizer: JackTokenizer = JackTokenizer(file)
        self.result: list = []
        self.output: str = re.sub(r".jack$", "", file.name)
        self.statement_terms = ("let", "if", "while", "do", "return")

    def compileClass(self) -> None:
        """
        クラスをコンパイルする
        """
        tokenizer: JackTokenizer = self.tokenizer
        tokenizer.tokenize()
        self.result.append("<class>")
        # 'class'
        self.append_elm()
        # className
        self.append_elm()
        # '{'
        self.append_elm()
        # classVarDec*
        while tokenizer.look_ahead() in ("static", "field"):
            self.compileClassVarDec()
        # subroutine*
        while tokenizer.look_ahead() in ("constructor", "function", "method"):
            self.compileSubroutine()
        # '}'
        self.append_elm()
        self.result.append("</class>")

        with open(f"./{self.output}.xml", "w") as output:
            output.write("\n".join(self.result))

    def create_xml_elm(self) -> str:
        """
        現トークンを
        <tag> elm </tag>にして返す
        """
        return f"{self.tokenizer.cov2_xml_elm()}"

    def append_elm(self) -> None:
        self.tokenizer.advance()
        self.result.append(self.create_xml_elm())

    def compileClassVarDec(self) -> None:
        """
        スタティック宣言またはフィールド宣言をコンパイルする
        """
        if self.tokenizer.look_ahead() in ("static", "field"):
            self.result.append("<classVarDec>")
            # varType
            self.append_elm()
            # type
            self.append_elm()
            # varList
            # 雑 HACK
            self.compileVarList()
            # ;
            self.append_elm()
            self.result.append("</classVarDec>")

    def compileVarList(self):
        # 雑 HACK
        self.append_elm()
        while self.tokenizer.look_ahead() != ";":
            self.append_elm()

    def compileSubroutine(self) -> None:
        """
        メソッド、ファンクション、コンストラクタをコンパイルする
        """
        self.result.append("<subroutineDec>")
        # subroutineKind
        self.append_elm()
        # returnType
        self.append_elm()
        # subroutineName
        self.append_elm()
        # '('
        self.append_elm()
        # parameterList
        self.compileParameterList()
        # ')'
        self.append_elm()
        # subroutineBody
        self.compileSubroutineBody()
        self.result.append("</subroutineDec>")

    def compileSubroutineBody(self) -> None:
        self.result.append("<subroutineBody>")
        # {
        self.append_elm()
        # varDec*
        while self.tokenizer.look_ahead() not in self.statement_terms:
            self.compileVarDec()
        # statements
        self.compileStatements()
        # }
        self.append_elm()
        self.result.append("</subroutineBody>")

    def compileParameterList(self) -> None:
        """
        パラメータのリスト(空の可能性もある)をコンパイルする。
        カッコ"()"は含まない
        """
        self.result.append("<parameterList>")
        while self.tokenizer.look_ahead() != ")":
            self.append_elm()
        self.result.append("</parameterList>")

    def compileVarDec(self) -> None:
        """
        var宣言をコンパイルする
        """
        self.result.append("<varDec>")
        # 'var'
        self.append_elm()
        # type
        self.append_elm()
        # varList
        self.compileVarList()
        # ';'
        self.append_elm()
        self.result.append("</varDec>")

    def compileStatements(self) -> None:
        """
        一連の文をコンパイルする。
        波カッコ"{}"は含まない
        """
        self.result.append("<statements>")
        while self.tokenizer.look_ahead() in self.statement_terms:
            if self.tokenizer.look_ahead() == "let":
                self.compileLet()
            elif self.tokenizer.look_ahead() == "if":
                self.compileIf()
            elif self.tokenizer.look_ahead() == "while":
                self.compileWhile()
            elif self.tokenizer.look_ahead() == "do":
                self.compileDo()
            elif self.tokenizer.look_ahead() == "return":
                self.compileReturn()
        self.result.append("</statements>")

    def compileDo(self) -> None:
        """
        do文をコンパイルする
        """
        self.result.append("<doStatement>")
        # 'do'
        self.append_elm()
        # subroutineCall
        self.compileSubroutineCall()
        # ';'
        self.append_elm()
        self.result.append("</doStatement>")

    def compileSubroutineCall(self) -> None:
        # qualifier
        # '.'
        # subroutineName
        self.append_elm()
        if self.tokenizer.look_ahead() == ".":
            self.append_elm()
            self.append_elm()
        # '('
        self.append_elm()
        # expressionList
        self.compileExpressionList()
        # ')'
        self.append_elm()

    def compileLet(self) -> None:
        """
        let文をコンパイルする
        """
        self.result.append("<letStatement>")
        # 'let'
        self.append_elm()
        # varName
        self.append_elm()
        # arrayIndeing?
        if self.tokenizer.look_ahead() == "[":
            self.compileArrayIndexing()
        # '='
        self.append_elm()
        # expression
        self.compileExpression()
        # ';'
        self.append_elm()
        self.result.append("</letStatement>")

    def compileArrayIndexing(self) -> None:
        # '['
        self.append_elm()
        # expression
        self.compileExpression()
        # ']'
        self.append_elm()

    def compileWhile(self) -> None:
        """
        while文をコンパイルする
        """
        self.result.append("<whileStatement>")
        # 'while'
        self.append_elm()
        # '('
        self.append_elm()
        # expression
        self.compileExpression()
        # ')'
        self.append_elm()
        # '{'
        self.append_elm()
        # statements
        self.compileStatements()
        # '}'
        self.append_elm()
        self.result.append("</whileStatement>")

    def compileReturn(self) -> None:
        """
        return文をコンパイルする
        """
        self.result.append("<returnStatement>")
        # 'return'
        self.append_elm()
        # expression?
        if self.tokenizer.look_ahead() != ";":
            self.compileExpression()
        # ';'
        self.append_elm()
        self.result.append("</returnStatement>")

    def compileIf(self) -> None:
        """
        if文をコンパイルする。
        else文を伴う可能性がある
        """
        self.result.append("<ifStatement>")
        # 'if'
        self.append_elm()
        # '('
        self.append_elm()
        # expression
        self.compileExpression()
        # ')'
        self.append_elm()
        # '{'
        self.append_elm()
        # statements
        self.compileStatements()
        # '}'
        self.append_elm()
        # elseClause?
        if self.tokenizer.look_ahead() == "else":
            # 'else'
            self.append_elm()
            # '{'
            self.append_elm()
            # statements
            self.compileStatements()
            # '}'
            self.append_elm()
        self.result.append("</ifStatement>")

    def compileExpression(self) -> None:
        """
        式をコンパイルする
        """
        self.result.append("<expression>")
        # term
        self.compileTerm()
        # (op term)*
        while self.tokenizer.look_ahead() in (
            "+", "-", "*", "/", "&", "|", "<", ">", "="
        ):
            self.append_elm()
            self.compileTerm()
        self.result.append("</expression>")

    def compileTerm(self) -> None:
        """
        termをコンパイルする。このルーチンは、やや複雑であり、構文解析のルールには複数の選択肢が
        存在し、現トークンだけからは決定できない場合がある。
        具体的に言うと、もし現トークンが識別子であれば、このルーチンは、それが変数、配列宣言、
        サブルーチン呼び出しのいずれかを識別しなければならない。そのためには、ひとつ先のトークンを
        読み込み
        そのトークンが"["か"("か"."のどれに該当するのかを調べれば、現トークンの種類を決定することができる。
        他のトークンの場合は現トークンに含まないので、先読みを行う必要はない
        """
        self.result.append("<term>")
        self.tokenizer.advance()
        if self.tokenizer.tokenType() == "identifier":
            if self.tokenizer.look_ahead() == "[":
                # varName
                self.result.append(self.create_xml_elm())
                # '['
                self.append_elm()
                # expression
                self.compileExpression()
                # ']'
                self.append_elm()
            elif self.tokenizer.look_ahead() in ("(", "."):
                self.tokenizer.go_back()
                self.compileSubroutineCall()
            else:
                self.result.append(self.create_xml_elm())
        elif self.tokenizer.token in ("-", "~"):
            self.result.append(self.create_xml_elm())
            self.compileTerm()
        elif self.tokenizer.token == "(":
            # '('
            self.result.append(self.create_xml_elm())
            # expression
            self.compileExpression()
            # ')'
            self.append_elm()
        else:
            self.result.append(self.create_xml_elm())
        self.result.append("</term>")

    def compileExpressionList(self) -> None:
        """
        コンマで分離された式のリスト(空の可能性もある)をコンパイルする
        """
        self.result.append("<expressionList>")
        while self.tokenizer.look_ahead() != ")":
            if self.tokenizer.look_ahead() == ",":
                self.append_elm()
            self.compileExpression()
        self.result.append("</expressionList>")
