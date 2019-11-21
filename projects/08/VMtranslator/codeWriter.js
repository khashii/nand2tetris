const fs = require("fs");

const _FILE_NAME = Symbol();
const _FILE_PATH = Symbol();
const _RESULT = Symbol();
const _EQ_CNT = Symbol();
const _GT_CNT = Symbol();
const _LT_CNT = Symbol();
const _RT_CNT = Symbol();

module.exports = class CodeWriter {

  constructor() {
    this[_RESULT] = "";
    this[_EQ_CNT] = 0;
    this[_GT_CNT] = 0;
    this[_LT_CNT] = 0;
    this[_RT_CNT] = 0;
  }

  /**
   * CodeWriteモジュールに新しいVMファイルの変換が
   * 開始したことを知らせる
   * @param {string} filePath
   */
  setFileName(filePath) {
    this[_FILE_PATH] = filePath;
    this[_FILE_NAME] = filePath.split("/").pop().replace(/.vm/, "");
  }

  /**
   * VMの初期化(ブートストラップ)
   * 出力ファイルの先頭に配置する
   */
  writeInit() {
    this[_RESULT] += `@256
                      D=A
                      @SP
                      M=D
                     `.replace(/ /g, "");
    this.writeCall("Sys.init", 0);
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
                          @EQ${++this[_EQ_CNT]}
                          D;JEQ
                          @SP
                          A=M
                          M=0
                          @SKIP_EQ${this[_EQ_CNT]}
                          0;JMP
                          (EQ${this[_EQ_CNT]})
                          @SP
                          A=M
                          M=-1
                          (SKIP_EQ${this[_EQ_CNT]})
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
                          @GT${++this[_GT_CNT]}
                          D;JGT
                          @SP
                          A=M
                          M=0
                          @SKIP_GT${this[_GT_CNT]}
                          0;JMP
                          (GT${this[_GT_CNT]})
                          @SP
                          A=M
                          M=-1
                          (SKIP_GT${this[_GT_CNT]})
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
                          @LT${++this[_LT_CNT]}
                          D;JLT
                          @SP
                          A=M
                          M=0
                          @SKIP_LT${this[_LT_CNT]}
                          0;JMP
                          (LT${this[_LT_CNT]})
                          @SP
                          A=M
                          M=-1
                          (SKIP_LT${this[_LT_CNT]})
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

  /**
   * labelコマンドを行うアセンブリコードを書く
   * @param {string} label
   */
  writeLabel(label) {
    this[_RESULT] += `(${label})
                     `.replace(/ /g, "");
  }

  /**
   * gotoコマンドを行うアセンブリコードを書く
   * @param {string} label
   */
  writeGoto(label) {
    this[_RESULT] += `@${label}
                      0;JMP
                     `.replace(/ /g, "");
  }

  /**
   * if-gotoコマンドを行うアセンブリコードを書く
   * @param {string} label
   */
  writeIf(label) {
    this[_RESULT] += `@SP
                      AM=M-1
                      D=M
                      @${label}
                      D;JNE
                     `.replace(/ /g, "");
  }

  /**
   * callコマンドを行うアセンブリコードを書く
   * @param {string} functionName
   * @param {number} numArgs 整数
   */
  writeCall(functionName, numArgs) {
    const return_address = `RET_ADDRESS_${++this[_RT_CNT]}`;
    this[_RESULT] += `// push_return-address
                      @${return_address}
                      D=A
                      @SP
                      A=M
                      M=D
                      @SP
                      M=M+1
                      // push_LCL
                      @LCL
                      D=M
                      @SP
                      A=M
                      M=D
                      @SP
                      M=M+1
                      // push_ARG
                      @ARG
                      D=M
                      @SP
                      A=M
                      M=D
                      @SP
                      M=M+1
                      // push_THIS
                      @THIS
                      D=M
                      @SP
                      A=M
                      M=D
                      @SP
                      M=M+1
                      // push_THAT
                      @THAT
                      D=M
                      @SP
                      A=M
                      M=D
                      @SP
                      M=M+1
                      // ARG = SP-n-5
                      @SP
                      D=M
                      @5
                      D=D-A
                      @${numArgs}
                      D=D-A
                      @ARG
                      M=D
                      // LCL = SP
                      @SP
                      D=M
                      @LCL
                      M=D
                      // goto_f
                      @${functionName}
                      0;JMP
                      // (return-address)
                      (${return_address})
                     `.replace(/ /g, "");
  }

  /**
   * returnコマンドを行うアセンブリコードを書く
   */
  writeReturn() {
    this[_RESULT] += `// FRAME = LCL
                      @LCL
                      D=M
                      @R13
                      M=D
                      // RET = *(FRAME-5)
                      @5
                      A=D-A
                      D=M
                      @R14
                      M=D
                      // *ARG = POP()
                      @ARG
                      D=M
                      @R15
                      M=D
                      @SP
                      AM=M-1
                      D=M
                      @R15
                      A=M
                      M=D
                      // SP = ARG + 1
                      @ARG
                      D=M
                      @SP
                      M=D+1
                      // THAT = *(FRAME-1)
                      @R13
                      AM=M-1
                      D=M
                      @THAT
                      M=D
                      // THIS = *(FRAME-2)
                      @R13
                      AM=M-1
                      D=M
                      @THIS
                      M=D
                      // ARG = *(FRAME-3)
                      @R13
                      AM=M-1
                      D=M
                      @ARG
                      M=D
                      // LCL = *(FRAME-4)
                      @R13
                      AM=M-1
                      D=M
                      @LCL
                      M=D
                      // goto_RET
                      @R14
                      A=M
                      0;JMP
                     `.replace(/ /g, "");

  }

  /**
   * functionコマンドを行うアセンブリコードを書く
   * @param {string} functionName
   * @param {number} numLocals 整数
   */
  writeFunction(functionName, numLocals) {
    this.writeLabel(functionName);
    for (let i=0; i<numLocals; i++) {
      this.writePushPop("C_PUSH", "constant", 0);
    }
  }

  close() {
    const FOLDER_NAME = this[_FILE_PATH].split("/").slice(-2).shift();
    fs.writeFileSync(this[_FILE_PATH].replace(
      /(?<=\/.*\/)(.*?).vm$/,
      `${FOLDER_NAME}.asm`
    ), this[_RESULT]);
  }

}
