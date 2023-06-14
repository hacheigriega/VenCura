import * as mongoDB from 'mongodb'
import * as dotenv from 'dotenv'
import { DB_CONN_STRING, USERS_COLLECTION_NAME, DB_NAME } from '../util/environment'

export const collections: { users?: mongoDB.Collection<{ _id: string }> } = {}

export async function connectToDatabase (): Promise<void> {
  dotenv.config()

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(DB_CONN_STRING)
  await client.connect()

  const db: mongoDB.Db = client.db(DB_NAME)
  const usersCollection: mongoDB.Collection<{ _id: string }> = db.collection<{ _id: string }>(USERS_COLLECTION_NAME)

  collections.users = usersCollection
  console.log(`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`)
}
