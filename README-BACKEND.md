# Backend for Delhi Traffic Command

This folder contains an Express-based backend designed to run serverless on Vercel.

Environment variables (set in Vercel or .env locally):
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - secret for signing JWTs
- `CLIENT_ORIGIN` - frontend origin for CORS
- `START_GENERATOR` - optional `false` to disable generator
- `GENERATOR_INTERVAL` - ms interval for synthetic data

Vercel notes:
- Add `VERCEL` project and set the above env vars in the dashboard.
- The `api/server.ts` file exposes the Express app as a serverless function.

Local run:
1. Create `.env` with variables above.
2. Install deps: `npm install`.
3. Run serverless locally with `vercel dev` or run `node ./src/server/index.js` after building.

Deployment steps to Vercel:
1. Create a Vercel project and link the Git repository.
2. In Project Settings → Environment Variables, add:
	- `MONGODB_URI` (MongoDB Atlas connection string)
	- `JWT_SECRET` (strong random secret)
	- `CLIENT_ORIGIN` (URL of frontend, e.g., https://your-site.vercel.app)
	- `START_GENERATOR` (optional; set to `true` to run generator in production)
3. Deploy; Vercel will build and expose serverless functions under `/api`.
4. Verify logs in Vercel dashboard and ensure DB connects.

Security notes:
- Never commit `.env` to source control.
- Use strong `JWT_SECRET` and rotate periodically.
