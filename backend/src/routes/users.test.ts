import request from 'supertest'
import { expect } from '@jest/globals'
import { type Request, type Response, type NextFunction } from 'express'
import type { Server } from 'http'
import { type User } from '../models/user'
import { connectToDatabase, closeDatabase } from '../services/database.service'
import app from '../app'

let server: Server

const mockUser: User = {
  _id: 'some-user-id',
  wallets: [{ address: 'addr', privateKey: 'pvtKey' }]
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
  server = app.listen(4001)
})

afterAll(async () => {
  const res = await request(app)
    .delete('/users/' + mockUser._id)
  expect(res.status).toEqual(202)

  await closeDatabase()
  server.close()
})

test('Get all users', async () => {
  const res = await request(app)
    .get('/users')
  expect(res.status).toEqual(200)
})

test('Create and get a user', async () => {
  let res = await request(app)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send(mockUser)
  expect(res.status).toBe(201)

  res = await request(app)
    .get('/users/' + mockUser._id)
  expect(res.status).toEqual(200)
})
