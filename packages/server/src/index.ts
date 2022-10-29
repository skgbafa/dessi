import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { SSXServer, SSXExpressMiddleware } from '@spruceid/ssx-server';
import { Web3Storage } from 'web3.storage'
import { web3StorageEndpoints } from './web3storage';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

const ssx = new SSXServer({
  signingKey: process.env.SSX_SIGNING_KEY,
});

const web3Storage = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN || '' });

app.use(cors({
  credentials: true,
  origin: true,
}));

app.use(SSXExpressMiddleware(ssx));

app.use("/storage", web3StorageEndpoints(web3Storage))

app.use((req, res) => {
  if (!res.headersSent) {
    res.status(404).json({ message: 'Invalid API route', success: false });
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
