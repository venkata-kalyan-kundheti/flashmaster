# Railway Deployment (Backend)

## 1) Create a Railway service from this folder
- In Railway, create a new project/service from GitHub.
- Set service root directory to `server`.

## 2) Required environment variables
Use values from `.env.example` and set these in Railway Variables:
- `MONGO_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `CLIENT_URL` (or `CLIENT_URLS` for multiple frontend domains)
- `NODE_ENV=production`

## 3) Build and start behavior
This service includes `railway.toml` with:
- Builder: Nixpacks
- Start command: `npm run start`
- Health check: `/api/health`

## 4) Important note about uploads
Current file uploads are stored on local disk (`server/uploads`).
Railway filesystem is ephemeral, so uploaded files can be lost on restarts/redeploys.
For production durability, move uploads to cloud object storage (Cloudinary/S3).