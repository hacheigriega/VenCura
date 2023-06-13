import { type ObjectId } from 'mongodb'

export default class User {
  constructor (
    public walletAddresses: string[], // list of wallet addresses
    public privateKeys: string[], // list of pvt keys to the wallets (empty if non-custodial)
    public sub?: ObjectId // user ID = sub of Dynamic JWT
  ) {}
}
