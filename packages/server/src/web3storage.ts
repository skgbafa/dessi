import express from 'express';
import { Request, Response } from 'express';

export const web3StorageEndpoints = (web3Storage: any) => {
  const router = express.Router();

  router.get('/', function (req: Request, res: Response): void {
    res.json({ message: 'Welcome to the Web3.Storage API' });
  });

  return router;
}
