import * as mongoDB from 'mongodb'
import * as dotenv from 'dotenv'

export const collections: { users?: mongoDB.Collection<{ _id: string }> } = {}

export async function connectToDatabase (): Promise<void> {
  dotenv.config()

  let dbConnString: string
  if (process.env.DB_CONN_STRING != null) {
    dbConnString = process.env.DB_CONN_STRING
  } else {
    throw new Error('DB_CONN_STRING environment variable is not set')
  }
  let usersCollectionName: string
  if (process.env.USERS_COLLECTION_NAME != null) {
    usersCollectionName = process.env.USERS_COLLECTION_NAME
  } else {
    throw new Error('USERS_COLLECTION_NAME environment variable is not set')
  }

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(dbConnString)
  await client.connect()

  const db: mongoDB.Db = client.db(process.env.DB_NAME)
  const usersCollection: mongoDB.Collection<{ _id: string }> = db.collection<{ _id: string }>(usersCollectionName)

  collections.users = usersCollection
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`)
}
