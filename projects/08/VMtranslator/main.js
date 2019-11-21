const fs = require("fs");

const Parser = require("./parser.js");
const CodeWriter = require("./codeWriter.js");

const path = process.argv[2];
const codeWriter = new CodeWriter();

const stat = fs.statSync(path);

if (stat.isFile()) {
  translateVMToASM(path);
} else if (stat.isDirectory()) {
  codeWriter.writeInit();
  fs.readdirSync(path).filter(filename => filename.match(/.vm$/)).forEach(vmFilepath => {
    translateVMToASM(`${path}${path.match(/\/$/) ? "" : "/"}${vmFilepath}`);
  });
}
codeWriter.close();

function translateVMToASM(path) {
  const parser = new Parser(path);
  codeWriter.setFileName(path);

  while (parser.hasMoreCommands()) {
    switch (parser.commandType()) {
      case "C_ARITHMETIC":
        codeWriter.writeArithmetic(parser.arg1());
        break;

      case "C_PUSH":
      case "C_POP":
        codeWriter.writePushPop(parser.commandType(), parser.arg1(), parser.arg2());
        break;

      case "C_LABEL":
        codeWriter.writeLabel(parser.arg1());
        break;

      case "C_GOTO":
        codeWriter.writeGoto(parser.arg1());
        break;

      case "C_IF":
        codeWriter.writeIf(parser.arg1());
        break;

      case "C_FUNCTION":
        codeWriter.writeFunction(parser.arg1(), parser.arg2());
        break;

      case "C_RETURN":
        codeWriter.writeReturn();
        break;

      case "C_CALL":
        codeWriter.writeCall(parser.arg1(), parser.arg2());
        break;

      default:
        console.error(`illegal command-type: ${parser.commandType()}`);
        throw new Error(`illegal command-type: ${parser.commandType()}`);
    }
    parser.advance();
  }

}
