import express, { type Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { usersRouter } from './routes/users.router'
import { walletsRouter } from './routes/wallets.router'
import { verifyJWT } from './middlewares/jwt'
import { ALLOWED_ORIGIN } from './util/environment'

dotenv.config()
console.log(`Adding allowed origin ${ALLOWED_ORIGIN}`) // debug
const options: cors.CorsOptions = {
  origin: ALLOWED_ORIGIN
}

const app: Express = express()

app.use(cors(options))
app.use(express.json())
app.use(verifyJWT)

app.use('/wallets', walletsRouter)
app.use('/users', usersRouter)

export default app
