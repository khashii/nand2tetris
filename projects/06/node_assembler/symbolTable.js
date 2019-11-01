module.exports = class SymbolTable {

  constructor() {
    this.symbolTable = new Map([
      ["SP", 0],
      ["LCL", 1],
      ["ARG", 2],
      ["THIS", 3],
      ["THAT", 4],
      ...[...Array(16).keys()].map(n => ["R" + n, n]),
      ["SCREEN", 16384],
      ["KBD", 24576],
    ]);
  }

  addEntry(symbol, address) {
    this.symbolTable.set(symbol, address);
  }

  contains(symbol) {
    return this.symbolTable.has(symbol);
  }

  getAddress(symbol) {
    return this.symbolTable.get(symbol);
  }

}
