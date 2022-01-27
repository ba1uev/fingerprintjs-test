import fs from 'fs/promises'
import path from 'path'

export async function retrieveTransactions(): Promise<Transaction[]> {
  return fs.readFile(path.join(__dirname, '../data/transactions.csv'))
    .then((data): string[] => data.toString().split('\n'))
    .then(([_head, ...lines]): Transaction[] => {
      const data = []
      lines.forEach((line) => {
        const lineChunks = line.split(',')
        const datum = {
          id: lineChunks[0],
          amount: parseFloat(lineChunks[1]),
          bankCountryCode: lineChunks[2]
        }
        data.push(datum)
      })
      return data
    })
}

export async function retrieveApiLatencies(): Promise<ApiLatencies> {
  return fs.readFile(path.join(__dirname, '../data/api-latencies.json'), 'utf-8')
    .then((data) => JSON.parse(data))
}
