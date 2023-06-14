import express, { type Request, type Response } from 'express'
import { ethers } from 'ethers'
import { GetWallets, ReadUser, UpdateUser } from '../services/users.db'
import { encrypt } from '../util/crypto'
import { type Wallet } from '../models/user'
import { INFURA_API_KEY } from '../util/environment'

export const walletsRouter = express.Router()
// usersRouter.use(express.json())

interface TxForm {
  destination: string
  amount: number
}

async function getAccountBalance (address: string): Promise<string> {
  try {
    const provider = new ethers.providers.InfuraProvider('sepolia', INFURA_API_KEY)
    const balanceWei = await provider.getBalance(address)
    const balanceEth = ethers.utils.formatEther(balanceWei)
    return balanceEth
  } catch (error) {
    console.error('Failed to fetch account balance:', error)
    throw error
  }
}

walletsRouter.post('/send_tx', (req: Request, res: Response) => {
  const { destination, amount }: TxForm = req.body

  console.log(destination)
  console.log(amount)
})

walletsRouter.get('/get_balance/:address', (req: Request, res: Response) => {
  getAccountBalance(req.params.address)
    .then((balance) => {
      console.log(`Account balance: ${balance} ETH`)
      res.json({ balance })
    })
    .catch((error) => {
      console.error('Failed to get account balance:', error)
    })
})

walletsRouter.get('/get_wallets', async (req: Request, res: Response) => {
  try {
    const wallets = await GetWallets(req.id)
    res.status(200).json({ wallets })
  } catch (error) {
    console.error('Failed to get all wallets:', error)
    throw error
  }
})

walletsRouter.post('/create_wallet', async (req: Request, res: Response) => {
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
