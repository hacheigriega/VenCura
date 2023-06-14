import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { ethers } from 'ethers'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { connectToDatabase } from './services/database.service'
import { GetWallets, ReadUser, UpdateUser, CreateUser } from './services/users.db'
import { usersRouter } from './routes/users.router'
import crypto from 'crypto'
import { type Wallet } from './models/user'

dotenv.config()

const dynamicPubKey = process.env.DYNAMIC_PUB_KEY as string

// App
const app: Express = express()
const port = 8000

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('server running')
})

// CORS middleware
const allowedOrigins = ['http://localhost:5173']
const options: cors.CorsOptions = {
  origin: allowedOrigins
}
app.use(cors(options))

// JWT verification middleware
interface VerifiedCredential {
  address: string
  chain: string
  id: string
  public_identifier: string
  wallet_name: string
  wallet_provider: string
  format: string
}

interface DecodedToken {
  sub: string
  environment_id: string
  verified_credentials: VerifiedCredential[]
}

const verifyJWT = async function (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  try {
    if (authHeader === undefined) {
      throw Error('authorization header is undefined')
    }
    if (!authHeader.startsWith('Bearer ')) {
      throw Error('authorization header does not start with Bearer')
    }

    const token = authHeader.substring(7, authHeader.length)
    const decoded = jwt.verify(token, dynamicPubKey) as DecodedToken

    req.id = decoded.sub

    // Store user in DB if not found
    const user = await ReadUser(decoded.sub)
    if (!user) {
      console.log('user not found...creating one')
      await CreateUser(decoded.sub, decoded.verified_credentials[0].address)
    } else {
      console.log('user found')
    }
    // console.log(decoded.sub) // debug
    // console.log(decoded.verified_credentials[0].address) // debug
  } catch (err) {
    console.log(err) // debug

    // return res.status(401).json({ message: 'Invalid token' + err }) // TODO
    next(err)
  }

  console.log('verified') // debug

  next()
}

app.use(verifyJWT)

connectToDatabase()
  .then(() => {
    app.use('/users', usersRouter)

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`)
    })
  })
  .catch((error: Error) => {
    console.error('Database connection failed', error)
    process.exit()
  })

// Create wallet
const ENCRYPTION_ALGORITHM = 'aes-256-cbc'
const IV = '5183666c72eec9e4'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!

function encrypt (data: string): string {
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
};

function decrypt (data: string): string {
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV)
  const decrypted = decipher.update(data, 'hex', 'utf8')
  return decrypted + decipher.final('utf8')
};

app.post('/create_wallet', async (req: Request, res: Response) => {
  const id = req.id
  try {
    const user = await ReadUser(id)
    if (!user) {
      throw Error('user not found')
    }
    // Generate a private key and create a wallet based on it
    const privateKey = ethers.Wallet.createRandom().privateKey
    const wallet = new ethers.Wallet(privateKey)
    console.log(`New wallet address: ${wallet.address} Private key: ${privateKey}`)

    // Encrypt the private key and add to user data
    const encryptedPrivateKey = encrypt(privateKey)
    const newWallet: Wallet = {
      address: wallet.address,
      privateKey: encryptedPrivateKey
    }
    user.wallets.push(newWallet)
    await UpdateUser(id, user)

    console.log('New wallet created and stored successfully!')
    res.status(200).json({ address: wallet.address })
  } catch (error) {
    console.error('An error occurred:', error)
    res.status(500).json(error)
  }
})

// SendTransaction: POST /send_tx
interface TxForm {
  destination: string
  amount: number
}

app.post('/send_tx', (req: Request, res: Response) => {
  const { destination, amount }: TxForm = req.body

  console.log(destination)
  console.log(amount)
})

// GetBalance: GET /get_balance
async function getAccountBalance (address: string): Promise<string> {
  try {
    const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY)
    const balanceWei = await provider.getBalance(address)
    const balanceEth = ethers.utils.formatEther(balanceWei)
    return balanceEth
  } catch (error) {
    console.error('Failed to fetch account balance:', error)
    throw error
  }
}

app.get('/get_balance', (req: Request, res: Response) => {
  const address = '0x7155B442544B2e1eb5313c9A95f8c67192760B21' // TODO

  getAccountBalance(address)
    .then((balance) => {
      console.log(`Account balance: ${balance} ETH`)
      res.json({ balance })
    })
    .catch((error) => {
      console.error('Failed to get account balance:', error)
    })
})

app.get('/get_wallets', async (req: Request, res: Response) => {
  try {
    const wallets = await GetWallets(req.id)
    res.status(200).json({ wallets })
  } catch (error) {
    console.error('Failed to get all wallets:', error)
    throw error
  }
})
