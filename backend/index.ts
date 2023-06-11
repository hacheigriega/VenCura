import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import jwt, { VerifyErrors, VerifyOptions } from 'jsonwebtoken';

const app: Express = express();
const port = 8000;

app.get('/', (req: Request, res: Response) => {
  res.send('server running');
});

const allowedOrigins = ['http://localhost:5173'];
const options: cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options));

app.use(express.json());

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

// verify jwt
interface VerifiedCredential {
  address: string;
  chain: string;
  id: string;
  public_identifier: string;
  wallet_name: string;
  wallet_provider: string;
  format: string;
}

interface DecodedToken {
  environment_id: string;
  verified_credentials: VerifiedCredential[];
}

app.post('/api', (req: Request, res: Response) => {
  const token = req.headers.authorization;
  if(token === undefined){
    throw Error("authorization header is undefined");
  }

  //try?
  const publicKey = '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyTpJ/85vaSK9mThdN6M6X5tSb7HUcVQBk8m/ZIg6iVW4/tdzeuDhgC9WsfO5kBHks8kUe6PATiy5RU6JRttmisxsFiHd9yWys6A5JikB5aJirkEkvf5urCHB+b2zdaOOIv+rB82KQ4rLMoH/T4iPJ1MgM+T0Z62wOouuL83hIEkTr69xEg3qmiuPc8Pr1mcntV/O1OuP7UVpoaVIUJTEcUAasIEyzycPRJGrwbbw6EYN/23ULX/klEyKMz47+iZ2pJt9GJLPtkjBbsHs6iUeLBBaJ3+lRZmlyC/RoCJpkHrtUgapFUpymJmv7aWz3+AjouZUhxc0fT5RX/Ie3UrdAVRU+lV4LxVjpLAsA59XDVcspbkIoen0VYv/DKpHM0kEMNB3aUHvcHGmk+lcIPKGMh9m2AUCW7DuxwiNAW4JzEzzVSSpm/dtT8eApkq7t1WN2fNWnR2qecHQjSRsbJ7pW+aVsWen3QdoWAcrpjJD28c0Z20L8GU9U7nlqx0CYnXu2CvOU9fPSpz7ohwW2JaQc4A+mhqjHZEG9soUu5NmH3mM3BI4Z5iVb/rqsoWixuaLwvC+REVoCDiYKNgpAOfWVTD7ZHDa9c9FTi7jQNAsVC2UK+zx3BtF1s91tkIsYyc3d4ZNJeHJ+Ev9yMkOJP2FSIy52ukWuyIfUgludLMlgEcCAwEAAQ==\n-----END PUBLIC KEY-----'

  // let decoded: DecodedToken;
  try {
    var decoded = jwt.verify(token, publicKey);
    var decoded2 = decoded as DecodedToken;
    // var decoded = jwt.verify(token, publicKey);
    console.log(decoded2.environment_id)
    console.log(decoded2.verified_credentials[0].address)
  } catch(err) {
    // 
  }

  // async???
  // const options: VerifyOptions = {
  //   complete: false
  // };

  // jwt.verify(token, publicKey, options, (err: VerifyErrors, decodedToken: DecodedToken) => {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     // resolve(decoded as DecodedToken); 
  //     console.log(decodedToken.kid)
  //   }
  // });
});


async function getAccountBalance(address: string): Promise<string> {
  try {
    const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.utils.formatEther(balanceWei);
    return balanceEth;
  } catch (error) {
    console.error('Failed to fetch account balance:', error);
    throw error;
  }
}

app.get('/get_balance', (req: Request, res: Response) => {
  const address = '0x7155B442544B2e1eb5313c9A95f8c67192760B21';

  getAccountBalance(address)
    .then((balance) => {
      console.log(`Account balance: ${balance} ETH`);
      res.json({ balance: balance });
    })
    .catch((error) => {
      console.error('Failed to get account balance:', error);
    });
});
