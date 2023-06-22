import { type Request, type Response, type NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ReadUser, CreateUser } from '../services/users.db'
import { DYNAMIC_PUB_KEY } from '../util/environment'

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

export const verifyJWT = async function (req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  try {
    if (authHeader === undefined) {
      throw Error('authorization header is undefined')
    }
    if (!authHeader.startsWith('Bearer ')) {
      throw Error('authorization header does not start with Bearer')
    }

    const token = authHeader.substring(7, authHeader.length)
    const decoded = jwt.verify(token, DYNAMIC_PUB_KEY) as DecodedToken

    req.id = decoded.sub

    // Store user in DB if not found
    const user = await ReadUser(decoded.sub)
    if (!user) {
      console.log('user not found...creating one')
      await CreateUser(decoded.sub, decoded.verified_credentials[0].address)
    }

    next()
  } catch (error) {
    console.error(error)
    res.status(401).json({ error })
  }
}
