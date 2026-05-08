# PixelTruth — AI Image Detector

> Detect AI-generated images and deepfakes with advanced neural analysis.

![Stack](https://img.shields.io/badge/React_18-TypeScript-blue) ![Backend](https://img.shields.io/badge/Node.js-Express-green) ![DB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)

---

## Architecture

```
Browser (React + Vite)
  └─▶ POST /api/upload
        └─▶ Multer (validate 5MB, JPEG/PNG/WEBP/GIF)
              └─▶ Cloudinary (store → get secure_url)
                    └─▶ Sightengine (ai-generated, deepfake, faces)
                          └─▶ mapVerdict → MongoDB (save scan)
                                └─▶ JSON response → Results page
```

## Verdict Logic

| Score Range | Verdict       |
|-------------|---------------|
| ≥ 0.85      | AI_GENERATED  |
| ≥ 0.65      | LIKELY_AI     |
| ≥ 0.40      | UNCERTAIN     |
| ≥ 0.20      | LIKELY_REAL   |
| < 0.20      | REAL          |

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo>
cd ai-image-detector

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment

**Server** (`server/.env`):
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ai-detector

# Cloudinary → https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Sightengine → https://sightengine.com/developers
SIGHTENGINE_API_USER=your_api_user
SIGHTENGINE_API_SECRET=your_api_secret

CLIENT_ORIGIN=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

### 3. Start MongoDB

```bash
# With Docker:
docker run -d -p 27017:27017 --name mongo mongo:7

# Or use your local MongoDB instance
```

### 4. Run development servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Open http://localhost:5173

---

## Docker Compose (Full Stack)

```bash
# Copy and fill in server/.env first, then:
docker-compose up --build
```

Open http://localhost:5173

---

## API Reference

### `POST /api/upload`
Upload and analyze an image.

**Request:** `multipart/form-data`
- `image` — file (JPEG/PNG/WEBP/GIF, max 5MB)

**Response:**
```json
{
  "id": "...",
  "imageUrl": "https://res.cloudinary.com/...",
  "verdict": "AI_GENERATED",
  "confidence_ai": 0.92,
  "confidence_real": 0.08,
  "is_deepfake": false,
  "deepfake_score": 0.03,
  "face_count": 1,
  "scan_time_ms": 1842,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### `GET /api/history?page=1&limit=10`
Retrieve paginated scan history.

### `DELETE /api/history/:id`
Delete a specific scan (removes from MongoDB + Cloudinary).

### `DELETE /api/history`
Clear all scan history.

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — restricted to `CLIENT_ORIGIN`  
- **Rate limiting** — 20 requests per 15 minutes on `/api/upload`
- **File validation** — type + size checked by Multer before processing
- **Cloudinary cleanup** — assets deleted on failed scans and when history is cleared

---

## Project Structure

```
ai-image-detector/
├── server/
│   ├── src/
│   │   ├── config/         # Cloudinary, Winston logger
│   │   ├── middleware/     # Multer, error handler
│   │   ├── models/         # Mongoose Scan model
│   │   ├── routes/         # upload.ts, history.ts
│   │   ├── utils/          # verdict mapper
│   │   └── index.ts        # Express app entry
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # Navbar
│   │   │   └── ui/         # DropZone, Progress, Verdict, Results, Toast
│   │   ├── context/        # UploadContext (reducer)
│   │   ├── hooks/          # useToast
│   │   ├── pages/          # Home, Results, History, NotFound
│   │   ├── types/          # TypeScript interfaces
│   │   ├── utils/          # API client, verdict helpers
│   │   └── styles/         # Tailwind globals
│   └── package.json
│
└── docker-compose.yml
```

---

## External Services Setup

### Cloudinary (Image Storage)
1. Sign up at https://cloudinary.com
2. Go to Dashboard → copy Cloud Name, API Key, API Secret

### Sightengine (AI Detection)
1. Sign up at https://sightengine.com
2. Go to API Credentials → copy API User + API Secret
3. Models used: `ai-generated`, `deepfake`, `faces`

### MongoDB
- Local: `mongodb://localhost:27017/ai-detector`
- Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier works great

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind v3 |
| Animation | Framer Motion                           |
| Icons     | Lucide React                            |
| Routing   | React Router v6                         |
| HTTP      | Axios                                   |
| Backend   | Node.js, Express, TypeScript            |
| Database  | MongoDB, Mongoose                       |
| Storage   | Cloudinary                              |
| AI API    | Sightengine                             |
| Security  | Helmet, CORS, express-rate-limit        |
| Logging   | Winston                                 |
