const fs = require("fs");

module.exports = class Parser {

  constructor(filepath) {
    this.commands = fs.readFileSync(filepath, { encoding: "utf-8" })
                      .split("\n")
                      .map(line => line.replace(/([\/\/].*)|\s/g, ""))
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

  commandType() {
    switch (true) {
      case this.currentCommand.value[0] === "@":
        return "A_COMMAND";
      case /^\(.*\)$/.test(this.currentCommand.value):
        return "L_COMMAND";
      default:
        return "C_COMMAND";
    }
  }

  symbol() {
    return this.currentCommand.value;
  }

  dest() {
    // FIXME
    if (this.currentCommand.value.includes(";")) {
      return "";
    }
    return this.currentCommand.value.replace(/=.*/g, "");
  }

  comp() {
    return this.currentCommand.value.split(/=/).pop().split(/;/).shift();
  }

  jump() {
    return this.currentCommand.value.split(";").pop();
  }

}
