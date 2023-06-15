import dotenv from 'dotenv'

dotenv.config()

export const {
  INFURA_API_KEY,
  DYNAMIC_PUB_KEY,
  DB_CONN_STRING,
  DB_NAME,
  USERS_COLLECTION_NAME,
  ENCRYPTION_KEY,
  ALLOWED_ORIGIN
}: {
  INFURA_API_KEY: string
  DYNAMIC_PUB_KEY: string
  DB_CONN_STRING: string
  DB_NAME: string
  USERS_COLLECTION_NAME: string
  ENCRYPTION_KEY: string
  ALLOWED_ORIGIN: string
} = process.env as {
  INFURA_API_KEY: string
  DYNAMIC_PUB_KEY: string
  DB_CONN_STRING: string
  DB_NAME: string
  USERS_COLLECTION_NAME: string
  ENCRYPTION_KEY: string
  ALLOWED_ORIGIN: string
}
