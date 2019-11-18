const fs = require("fs");

module.exports = class Parser {

  constructor(filepath) {
    this.commands = fs.readFileSync(filepath, { encoding: "utf-8" })
                      .split("\n")
                      .map(line => line.replace(/[\/\/].*/g, "").trim().replace(/\s+/, " "))
                      .filter(line => !!line);
    this.cmdIt = this.commands.values();
    this.currentCommand = this.cmdIt.next();
  }

  hasMoreCommands() {
    return !this.currentCommand.done;
  }

  advance() {
    this.currentCommand = this.cmdIt.next();
  }

  /**
   * 現VMコマンドの種類を返す
   * 算術コマンドはすべてC_ARITHMETICが返される
   */
  commandType() {
    const cmd = this.currentCommand.value.split(" ")[0];
    switch (true) {
      case ["add", "sub", "neg", "eq", "gt",
            "lt", "and", "or", "not"].includes(cmd):
        return "C_ARITHMETIC";

      case cmd === "push":
        return "C_PUSH";

      case cmd === "pop":
        return "C_POP";

      case cmd === "label":
        return "C_LABEL";

      case cmd === "goto":
        return "C_GOTO";

      case cmd === "if-goto":
        return "C_IF";

      case cmd === "function":
        return "C_FUNCTION";

      case cmd === "return":
        return "C_RETURN";

      case cmd === "call":
        return "C_CALL";

      default:
        console.error(`illegal command: ${cmd}`);
        throw new Error(`illegal command: ${cmd}`);
    }
  }

  /**
   * 現コマンドの最初の引数を返す
   * C_ARITHMETICの場合、コマンド自体(add, subなど)が返される
   * 現コマンドがC_RETURNの場合、本ルーチンは呼ばないようにする
   */
  arg1() {
    return this.commandType() === "C_ARITHMETIC" ?
             this.currentCommand.value :
             this.currentCommand.value.split(" ")[1] ;
  }

  /**
   * 現コマンドの2番目の引数が返される
   * 現コマンドがC_PUSH、C_POP、C_FUNCTION、C_CALLの場合のみ
   * 本ルーチンを呼ぶようにする
   */
  arg2() {
    return Number(this.currentCommand.value.split(" ")[2]);
  }

}
