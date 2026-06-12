import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/server';

// Export the Express app as the default Vercel serverless handler.
// Vercel's Node.js runtime calls this function for every incoming request
// to /api/* (after the vercel.json rewrite routes them here).
// The Express app handles all routing internally (POST /api/scan, GET /api/history, etc.)
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
