import request from 'supertest'
import { expect } from '@jest/globals'
import { type Request, type Response, type NextFunction } from 'express'
import type { Server } from 'http'
import { connectToDatabase, closeDatabase } from '../services/database.service'
import { type User } from '../models/user'
import app from '../app'

let server: Server

const mockUser: User = {
  _id: 'mock-user-for-wallets-test',
  wallets: [
    { address: '0x7155B442544B2e1eb5313c9A95f8c67192760B21', privateKey: '' },
    { address: '0xEb2A5f7c9B29C191B5bd1E1cC4C3e48Dc8EB7451', privateKey: '7d7e325f0ba56d208c862cda9e5d2a6cc4fffd2dced31e9361727a6d5244dc34d1b44914927ea31f7dcab261f19d36299c3f0d08a99fcc9771c24ea460d73aaa04ef86764fc0d404a81877a19bdf5261' }
  ]
}

// mock JWT auth middleware
jest.mock('../middlewares/jwt', () => ({
  verifyJWT: (req: Request, res: Response, next: NextFunction) => {
    req.id = mockUser._id
    next()
  }
}))

beforeAll(async () => {
  await connectToDatabase()
  server = app.listen(4000)

  // data setup
  const res = await request(server)
    .put('/users/' + mockUser._id)
    .set('Content-Type', 'application/json')
    .send(mockUser)
  expect(res.status).toEqual(200)
})

afterAll(async () => {
  await closeDatabase()
  server.close()
})

test('Get balance', async () => {
  const res = await request(server)
    .get('/wallets/get_balance/' + mockUser.wallets[1].address)

  expect(res.status).toBe(200)
})

test('Get wallets', async () => {
  const res = await request(server)
    .get('/wallets/get_wallets')

  expect(res.status).toBe(200)
  expect(res.body.wallets).toStrictEqual(mockUser.wallets)
})

// POST /create_wallet
test('Create wallet', async () => {
  const res = await request(server)
    .post('/wallets/create_wallet')

  expect(res.status).toBe(200)
  expect(res.body.address).toBeDefined()
})

// POST /sign_msg/:address
test('Sign message', async () => {
  const payload = { message: 'Sample message to be signed' }
  const res = await request(server)
    .post('/wallets/sign_msg/' + mockUser.wallets[1].address)
    .set('Content-Type', 'application/json')
    .send(payload)

  expect(res.status).toBe(200)
  expect(res.body.signature).toBe('0xb0a800f28e11e41c24218a05b88905bc5cd1de9ee7848ae197c5fb4620c7e2300ef4a02c0d9b1529a22cdeb6afe25dba067c1c57e89a147e75e526054e69c0d91b')
})

// POST /send_tx/:address
test('Send transaction', async () => {
  const payload = { destination: mockUser.wallets[1].address, amount: '0.000000000000001' }
  const res = await request(server)
    .post('/wallets/send_tx/' + mockUser.wallets[1].address)
    .set('Content-Type', 'application/json')
    .send(payload)

  expect(res.status).toBe(200)
  expect(res.body.txHash).toBeDefined()
}, 90000) // longer timeout
