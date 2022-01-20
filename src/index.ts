import { retrieveTransactions } from './transactions'
import { prioritize, calculateTotalAmount } from './lib'

async function main(): Promise<void> {
  let transactions = await retrieveTransactions()
  console.log(`Total ${transactions.length} transactions`)

  console.log(`-----------------------------------------`)
  console.log(`Max USD amount and processed transactions number at different priority thresholds:`)
  const results = {
    '50': prioritize(transactions, 50),
    '60': prioritize(transactions, 60),
    '90': prioritize(transactions, 90),
    '1000': prioritize(transactions, 1000),
  }
  console.log(`50ms: $${calculateTotalAmount(results['50'])} (${results['50'].length})`, )
  console.log(`60ms: $${calculateTotalAmount(results['60'])} (${results['60'].length})`)
  console.log(`90ms: $${calculateTotalAmount(results['90'])} (${results['90'].length})`)
  console.log(`1000ms: $${calculateTotalAmount(results['1000'])} (${results['1000'].length})`)

  console.log(`-----------------------------------------`)
  console.log(`Processing all transactions. Please, whait...`)
  let portions = []
  while (transactions.length) {
    const processedTransactions = prioritize(transactions)
    const processedTransactionIds = processedTransactions.map((x) => x.id)
    transactions = transactions.filter((x) => !processedTransactionIds.includes(x.id))
    portions.push(processedTransactions)
  }
  console.log(`The programm processed all transactions in ${portions.length} seconds`)
}

main()
