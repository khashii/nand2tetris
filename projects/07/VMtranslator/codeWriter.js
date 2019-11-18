const fs = require("fs");

const _FILE_NAME = Symbol();
const _FILE_PATH = Symbol();
const _RESULT = Symbol();

module.exports = class CodeWriter {

  constructor() {
    this[_RESULT] = "";
    this.eqCnt = 0;
    this.gtCnt = 0;
    this.ltCnt = 0;
  }

  /**
   * CodeWriteモジュールに新しいVMファイルの変換が
   * 開始したことを知らせる
   * @param {string} filePath
   */
  setFileName(filePath) {
    this[_FILE_NAME] = filePath.split("/").pop().replace(/.vm/, "");
    this[_FILE_PATH] = filePath;
  }

  /**
   * 与えられた算術コマンドをアセンブリコードに変換し、
   * それを書き込む
   * @param {string} command
   */
  writeArithmetic(command) {
    this[_RESULT] += `// ${command}\n`;
    switch (command) {
      case "add":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          M=D+M
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "sub":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          M=M-D
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "neg":
        this[_RESULT] += `@SP
                          A=M-1
                          M=-M
                         `.replace(/ /g, "");
        break;

      case "eq":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          D=M-D
                          @EQ${++this.eqCnt}
                          D;JEQ
                          @SP
                          A=M
                          M=0
                          @SKIP_EQ${this.eqCnt}
                          0;JMP
                          (EQ${this.eqCnt})
                          @SP
                          A=M
                          M=-1
                          (SKIP_EQ${this.eqCnt})
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "gt":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          D=M-D
                          @GT${++this.gtCnt}
                          D;JGT
                          @SP
                          A=M
                          M=0
                          @SKIP_GT${this.gtCnt}
                          0;JMP
                          (GT${this.gtCnt})
                          @SP
                          A=M
                          M=-1
                          (SKIP_GT${this.gtCnt})
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "lt":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          D=M-D
                          @LT${++this.ltCnt}
                          D;JLT
                          @SP
                          A=M
                          M=0
                          @SKIP_LT${this.ltCnt}
                          0;JMP
                          (LT${this.ltCnt})
                          @SP
                          A=M
                          M=-1
                          (SKIP_LT${this.ltCnt})
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "and":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          M=D&M
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "or":
        this[_RESULT] += `@SP
                          AM=M-1
                          D=M
                          @SP
                          AM=M-1
                          M=D|M
                          @SP
                          M=M+1
                         `.replace(/ /g, "");
        break;

      case "not":
        this[_RESULT] += `@SP
                          A=M-1
                          M=!M
                         `.replace(/ /g, "");
        break;

      default:
        console.error(`illegal command: ${command}`);
        throw new Error(`illegal command: ${command}`);
    }
  };

  /**
   * C_PUSHまたはC_POPコマンドをアセンブリコードに変換し、
   * それを書き込む
   * @param {"C_PUSH" | "C_POP"} command
   * @param {"argument" | "local" | "static" | "constant" | "this" | "that" | "pointer" | "temp"} segment
   * @param {number} index >= 0
   */
  writePushPop(command, segment, index) {
    this[_RESULT] += `// ${command} ${segment} ${index}\n`;
    if (command === "C_PUSH") {
      switch (segment) {
        case "constant":
          this[_RESULT] += `@${index}
                            D=A
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "local":
          this[_RESULT] += `@${index}
                            D=A
                            @LCL
                            A=M+D
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "argument":
          this[_RESULT] += `@${index}
                            D=A
                            @ARG
                            A=M+D
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "this":
          this[_RESULT] += `@${index}
                            D=A
                            @THIS
                            A=M+D
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "that":
          this[_RESULT] += `@${index}
                            D=A
                            @THAT
                            A=M+D
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "pointer":
          this[_RESULT] += `@${3+index}
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "temp":
          this[_RESULT] += `@${5+index}
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        case "static":
          this[_RESULT] += `@${this[_FILE_NAME]}.${index}
                            D=M
                            @SP
                            A=M
                            M=D
                            @SP
                            M=M+1
                           `.replace(/ /g, "");
          break;
        default:
          break;
      }
    } else if (command === "C_POP") {
      switch (segment) {
        case "constant":
          break;
        case "local":
          this[_RESULT] += `@${index}
                            D=A
                            @LCL
                            D=M+D
                            @R13
                            M=D
                            @SP
                            AM=M-1
                            D=M
                            @R13
                            A=M
                            M=D
                           `.replace(/ /g, "");
          break;
        case "argument":
          this[_RESULT] += `@${index}
                            D=A
                            @ARG
                            D=M+D
                            @R13
                            M=D
                            @SP
                            AM=M-1
                            D=M
                            @R13
                            A=M
                            M=D
                           `.replace(/ /g, "");
          break;
        case "this":
          this[_RESULT] += `@${index}
                            D=A
                            @THIS
                            D=M+D
                            @R13
                            M=D
                            @SP
                            AM=M-1
                            D=M
                            @R13
                            A=M
                            M=D
                           `.replace(/ /g, "");
          break;
        case "that":
          this[_RESULT] += `@${index}
                            D=A
                            @THAT
                            D=M+D
                            @R13
                            M=D
                            @SP
                            AM=M-1
                            D=M
                            @R13
                            A=M
                            M=D
                           `.replace(/ /g, "");
          break;
        case "pointer":
          this[_RESULT] += `@SP
                            AM=M-1
                            D=M
                            @${3+index}
                            M=D
                           `.replace(/ /g, "");
          break;
        case "temp":
          this[_RESULT] += `@SP
                            AM=M-1
                            D=M
                            @${5+index}
                            M=D
                           `.replace(/ /g, "");
          break;
        case "static":
          this[_RESULT] += `@SP
                            AM=M-1
                            D=M
                            @${this[_FILE_NAME]}.${index}
                            M=D
                           `.replace(/ /g, "");
          break;
        default:
          break;
      }
    }

  }

  close() {
    // 雑
    fs.writeFileSync(this[_FILE_PATH].replace(/.vm/, ".asm"), this[_RESULT]);
  }

}
