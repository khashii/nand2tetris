module.exports = class Code {

  dest(mnemonic) {
    return (mnemonic.includes("A") ? "1" : "0") +
           (mnemonic.includes("D") ? "1" : "0") +
           (mnemonic.includes("M") ? "1" : "0");
  }

  comp(mnemonic) {
    let re = "";
    switch (mnemonic) {
      case "0":
        re = "101010";
        break;

      case "1":
        re = "111111";
        break;

      case "-1":
        re = "111010";
        break;

      case "D":
        re = "001100";
        break;

      case "A":
      case "M":
        re = "110000";
        break;

      case "!D":
        re = "001101";
        break;

      case "!A":
      case "!M":
        re = "110001";
        break;

      case "-D":
        re = "001111";
        break;

      case "-A":
      case "-D":
        re = "110011";
        break;

      case "D+1":
        re = "011111";
        break;

      case "A+1":
      case "M+1":
        re = "110111";
        break;

      case "D-1":
        re = "001110";
        break;

      case "A-1":
      case "M-1":
        re = "110010";
        break;

      case "D+A":
      case "D+M":
        re = "000010";
        break;

      case "D-A":
      case "D-M":
        re = "010011";
        break;

      case "A-D":
      case "M-D":
        re = "000111";
        break;

      case "D&A":
      case "D&M":
        re = "000000";
        break;

      case "D|A":
      case "D|M":
        re = "010101";
        break;

      default:
        console.error(mnemonic);
        throw new Error(`unknown mnemonic: ${mnemonic}`);
    }
    return (mnemonic.includes("M") ? "1" : "0") + re;
  }

  jump(mnemonic) {
    switch (mnemonic) {
      case "JGT":
        return "001";

      case "JEQ":
        return "010";

      case "JGE":
        return "011";

      case "JLT":
        return "100";

      case "JNE":
        return "101";

      case "JLE":
        return "110";

      case "JMP":
        return "111";

      default:
        return "000";
    }
  }

}
