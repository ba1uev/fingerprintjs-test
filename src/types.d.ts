interface Transaction {
  id: string
  amount: number
  bankCountryCode: string
}

interface TransactionEnhanced extends Transaction {
  apiLatency: number
  cost: number
}

interface TransactionProcessed {
  id: string
  fraudulent: boolean
}