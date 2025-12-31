import { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/server/index.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Vercel's Node serverless adapter: forward to Express app
  // @ts-ignore
  return app(req as any, res as any);
}
