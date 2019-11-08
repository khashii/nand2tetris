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
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nM=D+M\n@SP\nM=M+1\n`;
        break;

      case "sub":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nM=M-D\n@SP\nM=M+1\n`;
        break;

      case "neg":
        this[_RESULT] += `@SP\nA=M-1\nM=-M\n`;
        break;

      case "eq":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nD=M-D\n@EQ${++this.eqCnt}\nD;JEQ\n@SP\nA=M\nM=0\n@SKIP_EQ${this.eqCnt}\n0;JMP\n(EQ${this.eqCnt})\n@SP\nA=M\nM=-1\n(SKIP_EQ${this.eqCnt})\n@SP\nM=M+1\n`;
        break;

      case "gt":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nD=M-D\n@GT${++this.gtCnt}\nD;JGT\n@SP\nA=M\nM=0\n@SKIP_GT${this.gtCnt}\n0;JMP\n(GT${this.gtCnt})\n@SP\nA=M\nM=-1\n(SKIP_GT${this.gtCnt})\n@SP\nM=M+1\n`;
        break;

      case "lt":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nD=M-D\n@LT${++this.ltCnt}\nD;JLT\n@SP\nA=M\nM=0\n@SKIP_LT${this.ltCnt}\n0;JMP\n(LT${this.ltCnt})\n@SP\nA=M\nM=-1\n(SKIP_LT${this.ltCnt})\n@SP\nM=M+1\n`;
        break;

      case "and":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nM=D&M\n@SP\nM=M+1\n`;
        break;

      case "or":
        this[_RESULT] += `@SP\nAM=M-1\nD=M\n@SP\nAM=M-1\nM=D|M\n@SP\nM=M+1\n`;
        break;

      case "not":
        this[_RESULT] += `@SP\nA=M-1\nM=!M\n`;
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
          this[_RESULT] += `@${index}\nD=A\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "local":
          this[_RESULT] += `@${index}\nD=A\n@LCL\nA=M+D\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "argument":
          this[_RESULT] += `@${index}\nD=A\n@ARG\nA=M+D\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "this":
          this[_RESULT] += `@${index}\nD=A\n@THIS\nA=M+D\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "that":
          this[_RESULT] += `@${index}\nD=A\n@THAT\nA=M+D\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "pointer":
          this[_RESULT] += `@${3+index}\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "temp":
          this[_RESULT] += `@${5+index}\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        case "static":
          this[_RESULT] += `@${this[_FILE_NAME]}.${index}\nD=M\n@SP\nA=M\nM=D\n@SP\nM=M+1\n`;
          break;
        default:
          break;
      }
    } else if (command === "C_POP") {
      switch (segment) {
        case "constant":
          break;
        case "local":
          this[_RESULT] += `@${index}\nD=A\n@LCL\nD=M+D\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D\n`;
          break;
        case "argument":
          this[_RESULT] += `@${index}\nD=A\n@ARG\nD=M+D\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D\n`;
          break;
        case "this":
          this[_RESULT] += `@${index}\nD=A\n@THIS\nD=M+D\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D\n`;
          break;
        case "that":
          this[_RESULT] += `@${index}\nD=A\n@THAT\nD=M+D\n@R13\nM=D\n@SP\nAM=M-1\nD=M\n@R13\nA=M\nM=D\n`;
          break;
        case "pointer":
          this[_RESULT] += `@SP\nAM=M-1\nD=M\n@${3+index}\nM=D\n`;
          break;
        case "temp":
          this[_RESULT] += `@SP\nAM=M-1\nD=M\n@${5+index}\nM=D\n`;
          break;
        case "static":
          this[_RESULT] += `@SP\nAM=M-1\nD=M\n@${this[_FILE_NAME]}.${index}\nM=D\n`;
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
