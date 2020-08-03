const taxTables = {
  "US-MEDICARE-2020-JOINT" : [
    { start: 0, stop: 250000, rate: 0.0145 },
    { start: 250000, rate: 0.009 }
  ],
  "US-SOCIAL-SECURITY-2020" : [
    { start: 0, stop: 139200, rate: 0.062 },
    { start: 137700, rate: 0 }
  ],
  "US-LONG-TERM-CAP-GAINS-2020-JOINT" : [
    { start: 0, stop: 40000, rate: 0.0 },
    { start: 40000, stop: 248300, rate: 0.15 },
    { start: 248300, rate: 0.2 }
  ],
  "US-INCOME-2020-JOINT" : [
    { start: 0, stop: 19750, rate: 0.10 },
    { start: 19750, stop: 80250, rate: 0.12 },
    { start: 80250, stop: 171050, rate: 0.22 },
    { start: 171050, stop: 326600, rate: 0.24 },
    { start: 326600, stop: 414700, rate: 0.32 },
    { start: 414700, stop: 622050, rate: 0.35 },
    { start: 622050, rate: 0.37 }
  ],
  "CA-INCOME-2020-JOINT" : [
    { start: 0, stop: 17618, rate: 0.01 },
    { start: 17618, stop: 41766, rate: 0.02 },
    { start: 41766, stop: 65920, rate: 0.04 },
    { start: 65920, stop: 91506, rate: 0.06 },
    { start: 91506, stop: 115648, rate: 0.08 },
    { start: 115648, stop: 590746, rate: 0.093 },
    { start: 590746, stop: 708890, rate: 0.103 },
    { start: 708890, stop: 1000000, rate: 0.113 },
    { start: 1000000, stop: 1181484, rate: 0.123 },
    { start: 1181484, rate: 0.133 }
  ],
  "IL-INCOME-2020" : [
    { rate: 0.0495 }
  ],
  "MI-INCOME-2020" : [
    { rate: 0.045 }
  ]
}

class Tier {
  constructor(start, stop, rate, income) {
    this.start = start
    this.stop = stop
    this.rate = rate
    this.income = income
  }

  taxAmount() {
    return this.taxableAmount() * this.rate
  }

  taxableAmount() {
    if(this.isTopBracket() || this.isWithinBracket()){
      return this.income
    } else {
      return this.bracketAmount()
    }
  }

  isTopBracket() {
    return (this.stop == null) || (this.stop == Infinity)
  }

  bracketAmount() {
    return this.stop - this.start
  }

  isWithinBracket(){
    return this.income < this.bracketAmount()
  }
}

class Calculator {
  constructor(bracket, income) {
    this.bracket = bracket
    this.income = income
    this.tiers = this.calculateTiers()
  }

  totalTax() {
    return this.tiers.reduce((balance, tier) =>{
      return balance + tier.taxAmount()
    }, 0)
  }

  remainingIncome() {
    return this.income - this.totalTax()
  }

  effectiveRate() {
    return this.totalTax() / this.income
  }

  calculateTiers() {
    var balance = this.income;
    return this.bracket.map((tier) => {
      var t = new Tier(
        tier.start  || 0,     // Default to 0 so we can just have a `rate` key and cleaner tax tables.
        tier.stop   || null,  // Default to null if the value isn't specified for top brackets.
        tier.rate,
        balance > 0 ? balance : 0 // A negative balance would reverse the tax liabillity. No good.
      )
      balance = balance - t.taxableAmount()
      return t;
    })
  }
}

function calculator(table, income){
  var bracket = taxTables[table]
  return new Calculator(bracket, income)
}

function TAX_TOTAL(table, income){
  return calculator(table, income).totalTax()
}

function TAX_EFFECTIVE_RATE(table, income){
  return calculator(table).effectiveRate()
}
