"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = require("ethers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_service_1 = require("./services/database.service");
const users_router_1 = require("./routes/users.router");
dotenv_1.default.config();
const dynamicPubKey = process.env.DYNAMIC_PUB_KEY;
// App
const app = (0, express_1.default)();
const port = 8000;
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('server running');
});
// CORS middleware
const allowedOrigins = ['http://localhost:5173'];
const options = {
    origin: allowedOrigins
};
app.use((0, cors_1.default)(options));
const verifyJWT = function (req, res, next) {
    const token = req.headers.authorization;
    try {
        if (token === undefined) {
            throw Error('authorization header is undefined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, dynamicPubKey);
        console.log(decoded.environment_id); // debug
        console.log(decoded.verified_credentials[0].address); // debug
    }
    catch (err) {
        console.log(err); // debug
        // return res.status(401).json({ message: 'Invalid token' + err }) // TODO
        next(err);
    }
    console.log('verified'); // debug
    next();
};
app.use(verifyJWT);
// app.listen(port, () => {
//   console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
// })
(0, database_service_1.connectToDatabase)()
    .then(() => {
    app.use('/users', users_router_1.usersRouter);
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error('Database connection failed', error);
    process.exit();
});
// GetBalance: GET /get_balance
function getAccountBalance(address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const provider = new ethers_1.ethers.providers.InfuraProvider('sepolia', process.env.INFURA_API_KEY);
            const balanceWei = yield provider.getBalance(address);
            const balanceEth = ethers_1.ethers.utils.formatEther(balanceWei);
            return balanceEth;
        }
        catch (error) {
            console.error('Failed to fetch account balance:', error);
            throw error;
        }
    });
}
app.get('/get_balance', (req, res) => {
    const address = '0x7155B442544B2e1eb5313c9A95f8c67192760B21'; // TODO
    getAccountBalance(address)
        .then((balance) => {
        console.log(`Account balance: ${balance} ETH`);
        res.json({ balance });
    })
        .catch((error) => {
        console.error('Failed to get account balance:', error);
    });
});
app.post('/send_tx', (req, res) => {
    const { destination, amount } = req.body;
    console.log(destination);
    console.log(amount);
});
// // Create account / wallet
// app.post('/create_wallet', (req: Request, res: Response) => {
//   try {
//     // Generate a new random private key
//     const privateKey = ethers.Wallet.createRandom().privateKey;
//     // Create a new wallet instance from the private key
//     const wallet = new ethers.Wallet(privateKey);
//     // Connect to MongoDB
//     const client = await MongoClient.connect('mongodb://localhost:27017');
//     const db = client.db('my-database');
//     // Encrypt the private key
//     const encryptedPrivateKey = encryptPrivateKey(privateKey);
//     // Store the wallet in MongoDB
//     await db.collection('wallets').insertOne({
//       address: wallet.address,
//       encryptedPrivateKey: encryptedPrivateKey,
//     });
//     console.log('New wallet created and stored successfully!');
//   } catch (error) {
//     console.error('An error occurred:', error);
//   } finally {
//     // Close the MongoDB connection
//     client?.close();
//   }
// })
