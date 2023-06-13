import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { ethers } from 'ethers'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { connectToDatabase } from './services/database.service'
import { usersRouter } from './routes/users.router'

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
  environment_id: string
  verified_credentials: VerifiedCredential[]
}

const verifyJWT = function (req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization

  try {
    if (token === undefined) {
      throw Error('authorization header is undefined')
    }

    const decoded = jwt.verify(token, dynamicPubKey) as DecodedToken

    console.log(decoded.environment_id) // debug
    console.log(decoded.verified_credentials[0].address) // debug
  } catch (err) {
    console.log(err) // debug

    // return res.status(401).json({ message: 'Invalid token' + err }) // TODO
    next(err)
  }

  console.log('verified') // debug

  next()
}

app.use(verifyJWT)

// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
// })

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

// // Create account / wallet
// app.post('/create_wallet', (req: Request, res: Response) => {
//   try {
//     // Generate a new random private key
//     const privateKey = ethers.Wallet.createRandom().privateKey;

//     // Create a new wallet instance from the private key
//     const wallet = new ethers.Wallet(privateKey);

//     // Connect to MongoDB
//     const client = await MongoClient.connect('mongodb://localhost:27017');
//     const db = client.db('my-database');

//     // Encrypt the private key
//     const encryptedPrivateKey = encryptPrivateKey(privateKey);

//     // Store the wallet in MongoDB
//     await db.collection('wallets').insertOne({
//       address: wallet.address,
//       encryptedPrivateKey: encryptedPrivateKey,
//     });

//     console.log('New wallet created and stored successfully!');
//   } catch (error) {
//     console.error('An error occurred:', error);
//   } finally {
//     // Close the MongoDB connection
//     client?.close();
//   }
// })
