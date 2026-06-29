import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI!
const dbName = process.env.MONGODB_DB!

let client: MongoClient
let db: Db

declare global {
  var _mongoClient: MongoClient | undefined
}

async function connectDb(): Promise<Db> {
  if (db) return db

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri)
      await global._mongoClient.connect()
    }
    client = global._mongoClient
  } else {
    client = new MongoClient(uri)
    await client.connect()
  }

  db = client.db(dbName)
  await ensureIndexes(db)
  return db
}

async function ensureIndexes(database: Db) {
  const users = database.collection('users')
  const videos = database.collection('videos')

  await users.createIndex({ email: 1 }, { unique: true, background: true })
  await videos.createIndex({ userId: 1 }, { background: true })
  await videos.createIndex(
    { name: 'text', description: 'text', tags: 'text' },
    { background: true }
  )
}

export { connectDb }
