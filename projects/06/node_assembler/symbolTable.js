module.exports = class SymbolTable {

  constructor() {
    this.symbolTable = new Map();
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
