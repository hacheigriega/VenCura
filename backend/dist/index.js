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
const app = (0, express_1.default)();
const port = 8000;
app.get('/', (req, res) => {
    res.send('server running');
});
const allowedOrigins = ['http://localhost:5173'];
const options = {
    origin: allowedOrigins
};
app.use((0, cors_1.default)(options));
app.use(express_1.default.json());
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
app.post('/api', (req, res) => {
    const token = req.headers.authorization;
    if (token === undefined) {
        throw Error("authorization header is undefined");
    }
    //try?
    const publicKey = '-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyTpJ/85vaSK9mThdN6M6X5tSb7HUcVQBk8m/ZIg6iVW4/tdzeuDhgC9WsfO5kBHks8kUe6PATiy5RU6JRttmisxsFiHd9yWys6A5JikB5aJirkEkvf5urCHB+b2zdaOOIv+rB82KQ4rLMoH/T4iPJ1MgM+T0Z62wOouuL83hIEkTr69xEg3qmiuPc8Pr1mcntV/O1OuP7UVpoaVIUJTEcUAasIEyzycPRJGrwbbw6EYN/23ULX/klEyKMz47+iZ2pJt9GJLPtkjBbsHs6iUeLBBaJ3+lRZmlyC/RoCJpkHrtUgapFUpymJmv7aWz3+AjouZUhxc0fT5RX/Ie3UrdAVRU+lV4LxVjpLAsA59XDVcspbkIoen0VYv/DKpHM0kEMNB3aUHvcHGmk+lcIPKGMh9m2AUCW7DuxwiNAW4JzEzzVSSpm/dtT8eApkq7t1WN2fNWnR2qecHQjSRsbJ7pW+aVsWen3QdoWAcrpjJD28c0Z20L8GU9U7nlqx0CYnXu2CvOU9fPSpz7ohwW2JaQc4A+mhqjHZEG9soUu5NmH3mM3BI4Z5iVb/rqsoWixuaLwvC+REVoCDiYKNgpAOfWVTD7ZHDa9c9FTi7jQNAsVC2UK+zx3BtF1s91tkIsYyc3d4ZNJeHJ+Ev9yMkOJP2FSIy52ukWuyIfUgludLMlgEcCAwEAAQ==\n-----END PUBLIC KEY-----';
    // let decoded: DecodedToken;
    try {
        var decoded = jsonwebtoken_1.default.verify(token, publicKey);
        var decoded2 = decoded;
        // var decoded = jwt.verify(token, publicKey);
        console.log(decoded2.environment_id);
        console.log(decoded2.verified_credentials[0].address);
    }
    catch (err) {
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