import { Client } from 'faunadb'

export const fauna = new Client({
  secret: process.env.FAUNADB_KEY || "fnAFQvxP1cAAUPdPCA8X7M17Qwlg4X9jdree2TxP",
  domain: 'db.us.fauna.com'
})