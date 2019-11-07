const fs = require("fs");

const _FILE_NAME = Symbol();
const _RESULT = Symbol();
const _STACK_INDEX = Symbol();

module.exports = class CodeWriter {

  constructor() {
    this[_RESULT] = "";
    this[_STACK_INDEX] = 255;
    this.eqCnt = 0;
    this.gtCnt = 0;
    this.ltCnt = 0;
  }

  /**
   * CodeWriteモジュールに新しいVMファイルの変換が
   * 開始したことを知らせる
   * @param {string} fileName
   */
  setFileName(fileName) {
    this[_FILE_NAME] = fileName;
  }

  /**
   * 与えられた算術コマンドをアセンブリコードに変換し、
   * それを書き込む
   * @param {string} command
   */
  writeArithmetic(command) {
    switch (command) {
      case "add":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nM=D+M\n@SP\nM=M-1\n`;
        break;

      case "sub":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nM=M-D\n@SP\nM=M-1\n`;
        break;

      case "neg":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nM=-M\n`;
        break;

      case "eq":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nD=D-M\nM=0\n@EQ${++this.eqCnt}\nD;JEQ\n@SKIP_EQ${this.eqCnt}\n0;JMP\n(EQ${this.eqCnt})\n@${this[_STACK_INDEX]}\nM=-1\n(SKIP_EQ${this.eqCnt})\n@SP\nM=M-1\n`;
        break;

      case "gt":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nD=M-D\nM=0\n@GT${++this.gtCnt}\nD;JGT\n@SKIP_GT${this.gtCnt}\n0;JMP\n(GT${this.gtCnt})\n@${this[_STACK_INDEX]}\nM=-1\n(SKIP_GT${this.gtCnt})\n@SP\nM=M-1\n`;
        break;

      case "lt":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nD=M-D\nM=0\n@LT${++this.ltCnt}\nD;JLT\n@SKIP_LT${this.ltCnt}\n0;JMP\n(LT${this.ltCnt})\n@${this[_STACK_INDEX]}\nM=-1\n(SKIP_LT${this.ltCnt})\n@SP\nM=M-1\n`;
        break;

      case "and":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nM=D&M\n@SP\nM=M-1\n`;
        break;

      case "or":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nD=M\n@${--this[_STACK_INDEX]}\nM=D|M\n@SP\nM=M-1\n`;
        break;

      case "not":
        this[_RESULT] += `@${this[_STACK_INDEX]}\nM=!M\n`;
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
    if (command === "C_PUSH") {
      if (segment === "constant") {
        this[_STACK_INDEX]++;
        this[_RESULT] += `@${index}\nD=A\n@${this[_STACK_INDEX]}\nM=D\n@SP\nM=M+1\n`;
      }
    } else if (command === "C_POP") {
      // ステージ2で実装する
    }

  }

  close() {
    // 雑
    fs.writeFileSync(this[_FILE_NAME].replace(/.vm/, ".asm"), this[_RESULT]);
  }

}
