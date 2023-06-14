import express, { type Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './services/database.service'
import { usersRouter } from './routes/users.router'
import { walletsRouter } from './routes/wallets.router'
import { verifyJWT } from './jwt'

dotenv.config()

const app: Express = express()
const port = 8000
const allowedOrigins = ['http://localhost:5173']
const options: cors.CorsOptions = {
  origin: allowedOrigins
}

connectToDatabase()
  .then(() => {
    app.use(cors(options)) // CORS middleware
    app.use(express.json())
    app.use(verifyJWT)

    app.use('/wallets', walletsRouter)
    app.use('/users', usersRouter)

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`)
    })
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error)
    process.exit()
  })
