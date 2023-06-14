export interface Wallet {
  address: string // wallet address
  privateKey: string // encrypted private key (empty if non-custodial wallet)
}

export interface User {
  _id: string // user ID = sub of Dynamic JWT
  wallets: Wallet[] // list of wallets
}
