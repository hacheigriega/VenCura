import { collections } from './database.service'
import type { User, Wallet } from '../models/user'

export async function ReadUser (id: string): Promise<User> {
  try {
    const user = await collections.users!.findOne({ _id: id }) as User
    if (!user) {
      throw Error('user not found')
    }
    return user
  } catch (error) {
    console.error('Failed to get user', error)
    throw error
  }
}

export async function UpdateUser (id: string, user: User): Promise<void> {
  try {
    await collections.users!.updateOne({ _id: id }, { $set: user })
  } catch (error) {
    console.error('Failed to update user', error)
    throw error
  }
}

// CreateUser creates a user in DB based on Dynamic JWT's
// sub (user ID) and verified address.
// TODO multi verified address support
export async function CreateUser (sub: string, address: string): Promise<void> {
  try {
    const user: User = {
      _id: sub,
      wallets: [{
        address,
        privateKey: ''
      }]
    }

    const result = await collections.users!.insertOne(user)
    console.log(`Successfully created a new user with id ${result.insertedId}`)
  } catch (error) {
    console.error('Failed to create user', error)
    throw error
  }
}

// GetWallets retrieves all wallets that belong to the given user
// (user ID is given)
export async function GetWallets (id: string): Promise<Wallet[]> {
  try {
    const query = { _id: id }
    const user = await collections.users!.findOne(query) as User
    if (!user) {
      throw Error('user not found')
    }
    return user.wallets
  } catch (error) {
    console.error('Failed to get wallets', error)
    throw error
  }
}

// FindWallet finds the wallet given the user's ID and the wallet address.
export async function FindWallet (id: string, address: string): Promise<Wallet | undefined> {
  try {
    const query = { _id: id }
    const user = await collections.users!.findOne(query) as User
    if (!user) {
      throw Error('user not found')
    }

    for (const wallet of user.wallets) {
      if (wallet.address === address) {
        return wallet
      }
    }
  } catch (error) {
    console.error('Failed to get wallets', error)
    throw error
  }
}
