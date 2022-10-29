import express from 'express';
import { Request, Response } from 'express';

export const web3StorageEndpoints = (web3Storage: any) => {
  const router = express.Router();

  router.use((req: Request, res: Response, next: any) => {
    if(req.ssx.verified) {
     return next();
    }
    res.status(401).json({ message: 'Unauthorized', success: false });
  });

  router.get('/', function (req: Request, res: Response): void {
    console.log(req.ssx);
    res.json({ message: 'Welcome to the Web3.Storage API' });
  });

  router.post('/upload', async (req: Request, res: Response) => {
    // const { files } = req;
    // const { cid } = await web3Storage.put(files);
    // res.json({ cid });
    res.json({ message: 'unimplemented' });

  });

  router.get('/files/:cid', async (req: Request, res: Response) => {
    // const { cid } = req.params;
    // const files = await web3Storage.get(cid);
    // res.json({ files });
    res.json({ message: 'unimplemented' });

  });

  router.get('/list', async (req: Request, res: Response) => {
    // const list = await web3Storage.list();
    // res.json({ list });
    res.json({ message: 'unimplemented' });
  });

  return router;
}
