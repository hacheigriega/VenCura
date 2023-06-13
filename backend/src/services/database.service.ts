// External Dependencies
import * as mongoDB from 'mongodb'
import * as dotenv from 'dotenv'
import type User from '../models/user'

// Global Variables
export const collections: { users?: mongoDB.Collection } = {}

// Initialize Connection
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
  const usersCollection: mongoDB.Collection = db.collection(usersCollectionName)

  collections.users = usersCollection
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`)
}
