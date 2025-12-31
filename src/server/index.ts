import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import trafficRoutes from './routes/traffic';
import alertRoutes from './routes/alerts';
import connect from './db';
import { startGenerator } from './generator';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 3001;

connect().then(() => {
  app.listen(PORT, () => {
    console.log('Server running on port', PORT);
    if (process.env.START_GENERATOR !== 'false') {
      startGenerator(+(process.env.GENERATOR_INTERVAL || 5000));
      console.log('Traffic generator started');
    }
  });
});

export default app;
