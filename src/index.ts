import { retrieveTransactions, retrieveApiLatencies } from './transactions'
import { prioritize, calculateTotalAmount } from './lib'

async function main(): Promise<void> {
  let transactions = await retrieveTransactions()
  const apiLatencies = await retrieveApiLatencies()
  console.log(`Total ${transactions.length} transactions`)
  console.log(`Max USD amount and processed transactions number at different priority thresholds:`)

  // @ts-ignore
  const algorithms: Algorythm[] = ['greedy', 'dp', 'meh']
  for (const algorythm of algorithms) {
    console.log(`\n--------------- Algorythm: "${algorythm}" ---------------`)
    const results = {
      '50': prioritize(algorythm, transactions, apiLatencies, 50),
      '60': prioritize(algorythm, transactions, apiLatencies, 60),
      '90': prioritize(algorythm, transactions, apiLatencies, 90),
      '1000': prioritize(algorythm, transactions, apiLatencies, 1000),
    }
    console.log(`50ms: $${calculateTotalAmount(results['50'])} (${results['50'].length})`, )
    console.log(`60ms: $${calculateTotalAmount(results['60'])} (${results['60'].length})`)
    console.log(`90ms: $${calculateTotalAmount(results['90'])} (${results['90'].length})`)
    console.log(`1000ms: $${calculateTotalAmount(results['1000'])} (${results['1000'].length})`)
  }
}

main()
