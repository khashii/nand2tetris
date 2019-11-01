const fs = require("fs");

const Parser = require("./parser.js");
const Code = require("./code.js");
const SymbolTable = require("./symbolTable.js");

const filepath = process.argv[2];
const parser = new Parser(filepath);
const code = new Code();

let result = "";

while (parser.hasMoreCommands()) {
  switch (parser.commandType()) {
    case "A_COMMAND":
      const symbol = parser.symbol();
      result += Number(symbol).toString(2).padStart(16, 0) + "\n";
      break;

    case "C_COMMAND":
      const dest = code.dest(parser.dest());
      const comp = code.comp(parser.comp());
      const jump = code.jump(parser.jump());
      result += "111" + comp + dest + jump + "\n";
      break;

    default:
      /^\(.*\)$/
      break;
  }
  parser.advance();
}

console.log(result);
// クソ雑
fs.writeFileSync(
  process.argv[2].split("/").pop().split(".").shift() + ".hack",
  result,
);
