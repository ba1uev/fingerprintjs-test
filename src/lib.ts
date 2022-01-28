export const sanitizeTransactionData = (x: TransactionEnhanced): Transaction => ({
  id: x.id,
  amount: x.amount,
  bankCountryCode: x.bankCountryCode
})

export function prioritize(algorithm: Algorythm, transactions: Transaction[], apiLatencies: ApiLatencies, totalTime: number = 1000): Transaction[] {
  switch (algorithm) {
    case 'greedy':
      return greedyAlgorithm(transactions, apiLatencies, totalTime)
    case 'dp':
      return dynamicProgramming(transactions, apiLatencies, totalTime)
    default:
      throw new Error(`The algorythm "${algorithm}" is not implemented`)
  }
}

export function calculateTotalAmount(transactions: Transaction[]): number {
  const totalAmountBaseUnit = transactions
    .map((x) => x.amount * 100)
    .reduce((acc, x) => acc + x, 0)
  return totalAmountBaseUnit / 100
}

export const money = {
  add(a1: number, a2: number): number {
    return ((a1 * 100) + (a2 * 100)) / 100
  },
  subtract(a1: number, a2: number): number {
    return ((a1 * 100) - (a2 * 100)) / 100
  },
}

export function greedyAlgorithm(transactions: Transaction[], apiLatencies: ApiLatencies, totalTime: number): Transaction[] {
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

export function dynamicProgramming(transactions: Transaction[], apiLatencies: ApiLatencies, totalTime: number): Transaction[] {
  const T = Array(transactions.length + 1)
    .fill(null)
    .map(() => Array(totalTime + 1).fill(null))

  for (let i = 0; i <= transactions.length; i++) {
    const tx = i ? transactions[i - 1] : null
    const txApiLatency = tx ? apiLatencies[tx.bankCountryCode] : null
    for (let w = 0; w <= totalTime; w++) {
      if (i === 0 || w === 0) {
        T[i][w] = 0
      } else if (txApiLatency > w) {
        T[i][w] = T[i - 1][w]
      } else {
        T[i][w] = Math.max(T[i - 1][w], money.add(tx.amount, T[i - 1][w - txApiLatency]))
      }
    }
  }

  let result = T[transactions.length][totalTime]
  let apiLatency = totalTime
  const resultTxs = []
  for (let i = transactions.length; i > 0 && result > 0; i--) {
    if (result === T[i - 1][apiLatency]) {
      continue
    }
    const tx = transactions[i - 1]
    resultTxs.push(tx)
    result = money.subtract(result, tx.amount)
    apiLatency -= apiLatencies[tx.bankCountryCode]
  }

  return resultTxs
}
