import apiLatencies from './api-latencies.json'

export async function processTransactions(transactions: Transaction[]): Promise<TransactionProcessed[]> {
  const results = []
  for (const transaction of transactions) {
    const result: Partial<TransactionProcessed> = { id: transaction.id }
    result.fraudulent = await processTransaction(transaction)
    results.push(result)
  }
  return results
}

export async function processTransaction(transaction: Transaction): Promise<boolean> {
  const apiLatency = apiLatencies[transaction.bankCountryCode]
  const result = Boolean(Math.round(Math.random()))
  return new Promise((resolve) =>
    setTimeout(() => resolve(result), apiLatency)
  )
}

export const sanitizeTransactionData = (x: TransactionEnhanced): Transaction => ({
  id: x.id,
  amount: x.amount,
  bankCountryCode: x.bankCountryCode
})

export function prioritize(transactions: Transaction[], totalTime: number = 1000): Transaction[] {
  const enhancedTransactions: TransactionEnhanced[] = transactions
    .map((tx) => {
      const apiLatency = apiLatencies[tx.bankCountryCode]
      // Defining a normalized transaction amount as its amount per 1 millisecond
      const cost = tx.amount / apiLatency
      return {
        ...tx,
        apiLatency,
        cost,
      }
    })
  const txsOrderedByCost = enhancedTransactions
    .slice()
    .sort((a, b) => b.cost - a.cost)
  const txsOrderedByLatencyAndAmount = enhancedTransactions
    .slice()
    .sort((a, b) => a.apiLatency - b.apiLatency || b.amount - a.amount)

  let timeLeft = totalTime
  const result: Transaction[] = []

  for (let i = 0; i < transactions.length; i++) {
    const transaction = txsOrderedByCost[i]
    if (timeLeft - transaction.apiLatency >= 0) {
      result.push(sanitizeTransactionData(transaction))
      timeLeft -= transaction.apiLatency
    } else {
      break
    }
  }

  /*
    In some cases, there is still available time here.
    It can be used for the most profitable of the fastest transactions.
  */
  const processedTransactionIds = result.map((x) => x.id)
  const transactionsLeft = txsOrderedByLatencyAndAmount
    .filter((tx) => !processedTransactionIds.includes(tx.id))

  for (let i = 0; i < transactionsLeft.length; i++) {
    const transaction = transactionsLeft[i]
    if (timeLeft >= transaction.apiLatency) {
      result.push(sanitizeTransactionData(transaction))
      timeLeft -= transaction.apiLatency
    } else {
      break
    }
  }

  return result
}

export function calculateTotalAmount(transactions: Transaction[]): number {
  const totalAmountBaseUnit = transactions
    .map((x) => x.amount * 100)
    .reduce((acc, x) => acc + x, 0)
  return totalAmountBaseUnit / 100
}
