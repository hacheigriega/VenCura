import express, { type Request, type Response } from 'express'
import { ethers } from 'ethers'
import { GetWallets, ReadUser, UpdateUser, FindWallet } from '../services/users.db'
import { encrypt, decrypt } from '../util/crypto'
import { type Wallet } from '../models/user'
import { INFURA_API_KEY } from '../util/environment'

export const walletsRouter = express.Router()

interface SignMsgForm {
  message: string
}

interface SendTxForm {
  destination: string
  amount: number
}

walletsRouter.get('/get_balance/:address', (req: Request, res: Response) => {
  getAccountBalance(req.params.address)
    .then((balance) => {
      res.status(200).json({ balance })
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
  }
})

walletsRouter.post('/create_wallet', async (req: Request, res: Response) => {
  try {
    const id = req.id // user ID

    const user = await ReadUser(id)
    if (!user) {
      throw Error('user not found')
    }

    // generate a private key and create the wallet from it
    const privateKey = ethers.Wallet.createRandom().privateKey
    const wallet = new ethers.Wallet(privateKey)
    console.log(`New wallet address: ${wallet.address} Private key: ${privateKey}`)

    // encrypt the private key and add to user data
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

// Sign message using given address
walletsRouter.post('/sign_msg/:address', async (req: Request, res: Response) => {
  try {
    const address = req.params.address
    const { message }: SignMsgForm = req.body
    const id = req.id // user ID

    // find given wallet and decrypt private key
    const wallet = await FindWallet(id, address)
    if (wallet == null) {
      throw Error('Wallet not found')
    }
    const pvtKey = decrypt(wallet.privateKey)

    // sign using ethers and respond
    const ethersWallet = new ethers.Wallet(pvtKey)
    const signature = await ethersWallet.signMessage(message)
    res.status(200).json({ signature })
  } catch (error) {
    console.error('Failed to sign message', error)
    res.status(500).json(error)
  }
})

walletsRouter.post('/send_tx/:address', async (req: Request, res: Response) => {
  try {
    const { destination, amount }: SendTxForm = req.body
    const id = req.id // user ID
    const address = req.params.address // wallet address

    const ethAmount = ethers.utils.parseEther(amount.toString())
    if (!ethers.utils.isAddress(destination)) {
      throw Error(`Invalid destination address ${destination}`)
    }

    // find given wallet and decrypt private key
    const wallet = await FindWallet(id, address)
    if (wallet == null) {
      throw Error('Wallet not found')
    }
    const pvtKey = decrypt(wallet.privateKey)

    // send tx using ethers and respond
    const provider = new ethers.providers.InfuraProvider('sepolia', INFURA_API_KEY)
    const senderWallet = new ethers.Wallet(pvtKey, provider)

    // nonce
    const baseNonce = provider.getTransactionCount(wallet.address)
    let nonceOffset = 0
    const nonce = await baseNonce.then((nonce) => (nonce + (nonceOffset++)))

    const tx = {
      to: destination,
      value: ethAmount,
      chainId: 11155111,
      gasLimit: 21000,
      gasPrice: await provider.getGasPrice(),
      nonce
    }
    console.log('Sending transaction:')
    console.log(tx)

    const txHash = await senderWallet.signTransaction(tx)
      .then(async (signedTx) => await provider.sendTransaction(signedTx))
      .then(async (txRes) => await txRes.wait())
      .then((receipt) => {
        console.log(`Transaction hash ${receipt.transactionHash}`)
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`)

        return receipt.transactionHash
      })
    res.status(200).json({ txHash })
  } catch (error) {
    console.error(error)
    res.status(500).json({ msg: error.toString() })
  }
})

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
