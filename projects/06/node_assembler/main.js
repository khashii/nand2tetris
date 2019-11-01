const fs = require("fs");

const Parser = require("./parser.js");
const Code = require("./code.js");
const SymbolTable = require("./symbolTable.js");

const filepaths = process.argv.slice(2);

filepaths.forEach(filepath => {

  const parserForSymbolTable = new Parser(filepath);
  const parser = new Parser(filepath);
  const code = new Code();
  const symbolTable = new SymbolTable();

  let result = "";

  let address = 0;
  while (parserForSymbolTable.hasMoreCommands()) {

    if (["A_COMMAND", "C_COMMAND"].includes(parserForSymbolTable.commandType())) {
      address++;
    } else if (parserForSymbolTable.commandType() === "L_COMMAND") {
      // ラベル定義
      symbolTable.addEntry(parserForSymbolTable.symbol().replace(/\(|\)/g, ""), address);
    }
    parserForSymbolTable.advance();
  }

  let ramAddress  = 16;
  while (parser.hasMoreCommands()) {
    switch (parser.commandType()) {
      case "A_COMMAND":

        let symbol = parser.symbol().replace(/@/, "");
        // A命令の数値に出くわしたとき(@Xxxという命令においてXxxがシンボルでなく
        // 数値であるとき)
        if (!Number.isNaN(Number(symbol))) {
          result += Number(symbol).toString(2).padStart(16, 0) + "\n";
          break;
        }

        if (symbolTable.contains(symbol)) {
          result += Number(symbolTable.getAddress(symbol)).toString(2).padStart(16, 0) + "\n";
        } else {
          symbolTable.addEntry(symbol, ramAddress);
          result += (ramAddress++).toString(2).padStart(16, 0) + "\n";
        }
        break;

      case "C_COMMAND":
        const dest = code.dest(parser.dest());
        const comp = code.comp(parser.comp());
        const jump = code.jump(parser.jump());
        result += "111" + comp + dest + jump + "\n";
        break;

      default:
        break;
    }
    parser.advance();
  }

  // 雑
  fs.writeFileSync(
    filepath.split("/").pop().split(".").shift() + ".hack",
    result,
  );
});
