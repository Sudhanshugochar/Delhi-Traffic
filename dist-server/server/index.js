"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const traffic_1 = __importDefault(require("./routes/traffic"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const db_1 = __importDefault(require("./db"));
const generator_1 = require("./generator");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_1.default);
app.use('/api/traffic', traffic_1.default);
app.use('/api/alerts', alerts_1.default);
const PORT = process.env.PORT || 3001;
(0, db_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log('Server running on port', PORT);
        if (process.env.START_GENERATOR !== 'false') {
            (0, generator_1.startGenerator)(+(process.env.GENERATOR_INTERVAL || 5000));
            console.log('Traffic generator started');
        }
    });
});
exports.default = app;
