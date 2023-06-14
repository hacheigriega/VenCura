"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_service_1 = require("./services/database.service");
const users_router_1 = require("./routes/users.router");
const wallets_router_1 = require("./routes/wallets.router");
const jwt_1 = require("./jwt");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8000;
const allowedOrigins = ['http://localhost:5173'];
const options = {
    origin: allowedOrigins
};
(0, database_service_1.connectToDatabase)()
    .then(() => {
    app.use((0, cors_1.default)(options)); // CORS middleware
    app.use(express_1.default.json());
    app.use(jwt_1.verifyJWT);
    app.use('/wallets', wallets_router_1.walletsRouter);
    app.use('/users', users_router_1.usersRouter);
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error('Database connection failed', error);
    process.exit();
});
