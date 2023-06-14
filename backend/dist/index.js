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
const users_db_1 = require("./services/users.db");
const users_router_1 = require("./routes/users.router");
const crypto_1 = __importDefault(require("crypto"));
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
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        try {
            if (authHeader === undefined) {
                throw Error('authorization header is undefined');
            }
            if (!authHeader.startsWith('Bearer ')) {
                throw Error('authorization header does not start with Bearer');
            }
            const token = authHeader.substring(7, authHeader.length);
            const decoded = jsonwebtoken_1.default.verify(token, dynamicPubKey);
            req.id = decoded.sub;
            // Store user in DB if not found
            const user = yield (0, users_db_1.ReadUser)(decoded.sub);
            if (!user) {
                console.log('user not found...creating one');
                yield (0, users_db_1.CreateUser)(decoded.sub, decoded.verified_credentials[0].address);
            }
            else {
                console.log('user found');
            }
            // console.log(decoded.sub) // debug
            // console.log(decoded.verified_credentials[0].address) // debug
        }
        catch (err) {
            console.log(err); // debug
            // return res.status(401).json({ message: 'Invalid token' + err }) // TODO
            next(err);
        }
        console.log('verified'); // debug
        next();
    });
};
app.use(verifyJWT);
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
// Create wallet
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV = '5183666c72eec9e4';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
function encrypt(data) {
    const cipher = crypto_1.default.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
;
function decrypt(data) {
    const decipher = crypto_1.default.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, IV);
    const decrypted = decipher.update(data, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
}
;
app.post('/create_wallet', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.id;
    try {
        const user = yield (0, users_db_1.ReadUser)(id);
        if (!user) {
            throw Error('user not found');
        }
        // Generate a private key and create a wallet based on it
        const privateKey = ethers_1.ethers.Wallet.createRandom().privateKey;
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        console.log(`New wallet address: ${wallet.address} Private key: ${privateKey}`);
        // Encrypt the private key and add to user data
        const encryptedPrivateKey = encrypt(privateKey);
        const newWallet = {
            address: wallet.address,
            privateKey: encryptedPrivateKey
        };
        user.wallets.push(newWallet);
        yield (0, users_db_1.UpdateUser)(id, user);
        console.log('New wallet created and stored successfully!');
        res.status(200).json({ address: wallet.address });
    }
    catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json(error);
    }
}));
app.post('/send_tx', (req, res) => {
    const { destination, amount } = req.body;
    console.log(destination);
    console.log(amount);
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
app.get('/get_wallets', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallets = yield (0, users_db_1.GetWallets)(req.id);
        res.status(200).json({ wallets });
    }
    catch (error) {
        console.error('Failed to get all wallets:', error);
        throw error;
    }
}));
