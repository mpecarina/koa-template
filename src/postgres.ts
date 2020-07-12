import { Client } from "pg"

export const getClient = () => {
  const client = new Client({
    user: process.env.DB_USER || "postgres",
    database: process.env.DB_NAME || "postgres",
    password: process.env.DB_PASSWORD || "password",
    port: Number(process.env.DB_PORT) || 5432,
    host: process.env.DB_HOST || "localhost",
  })
  return client
}

export const clientQuery = async (client: any, query: string) => {
  return client.query(query)
}

export const queryDB = async (query: string) => {
  const pgClient = getClient()
  await pgClient.connect()
  const queryResults = await clientQuery(pgClient, query)
  await pgClient.end()
  return queryResults
}

const run = async () => {
  const client = getClient()
  await client.connect()
  const query = await clientQuery(client, "SELECT * FROM tokens")
  console.log(query)
  await client.end()
}

if (!module.parent) {
  run().catch(console.error)
}
