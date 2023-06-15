import express, { type Request, type Response } from 'express'
import { collections } from '../services/database.service'
import { type User } from '../models/user'

export const usersRouter = express.Router()

// GET
usersRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = (await collections.users!.find({}).toArray()) as User[]
    res.status(200).send(users)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

usersRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const query = { _id: req.params.id }
    const user = await collections.users!.findOne(query) as User
    if (user != null) {
      res.status(200).send(user)
    } else {
      throw new Error('failed to find user')
    }
  } catch (error) {
    console.error(error)
    res.status(404).send(`Unable to find matching document with id: ${req.params.id}`)
  }
})

// POST
usersRouter.post('/', async (req: Request, res: Response) => {
  try {
    const newUser = req.body as User
    const result = await collections.users!.insertOne(newUser)
    res.status(201).send(`Successfully created a new user with id ${result.insertedId}`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error.message)
  }
})

// PUT
usersRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const updatedUser: User = req.body as User
    const query = { _id: id }
    await collections.users!.updateOne(query, { $set: updatedUser })
    res.status(200).send(`Successfully updated user with id ${id}`)
  } catch (error) {
    console.error(error.message)
    res.status(400).send(error.message)
  }
})

// DELETE
usersRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const query = { _id: id }
    await collections.users!.deleteOne(query)
    res.status(202).send(`Successfully removed user with id ${id}`)
  } catch (error) {
    console.error(error.message)
    res.status(400).send(error.message)
  }
})
