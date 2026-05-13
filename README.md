# Byzlytics 2.0 — Smart Business Dashboard

AI-powered sales analytics with MongoDB, JWT auth, and a full landing page.
Upload a CSV → instant profit reports, inventory alerts, AI chat.

---

## 🏗️ Project Structure

```
byzlytics/
├── backend/
│   ├── main.py              ← FastAPI server (auth + MongoDB + AI)
│   ├── requirements.txt     ← Python packages
│   └── .env                 ← Your secrets (never commit this)
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Root (landing → upload → dashboard)
│   │   ├── context/
│   │   │   └── AuthContext.jsx  ← JWT auth state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  ← Hero + Login/Signup modals
│   │   │   ├── UploadPage.jsx   ← CSV upload
│   │   │   └── Dashboard.jsx    ← Analytics dashboard
│   │   ├── components/
│   │   │   ├── KpiCards.jsx
│   │   │   ├── Charts.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── AiChat.jsx
│   │   │   ├── Performers.jsx
│   │   │   └── StockInput.jsx
│   │   └── utils/
│   │       ├── api.js       ← All API calls (with JWT)
│   │       └── format.js    ← Number/currency formatters
│   ├── index.html
│   └── package.json
├── sample_data.csv
├── .gitignore
└── README.md
```

---

## ⚙️ STEP 1 — Get Your API Keys

### MongoDB Atlas (free)
1. Go to https://cloud.mongodb.com
2. Create a free cluster (M0 is free forever)
3. Click **Connect → Drivers → copy the URI**
4. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`

### Gemini AI (free)
1. Go to https://aistudio.google.com
2. Sign in → **Get API Key → Create API Key**
3. Copy the key

---

## ⚙️ STEP 2 — Configure Backend

Open `backend/.env` and fill in your keys:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/byzlytics?retryWrites=true&w=majority
DB_NAME=byzlytics
JWT_SECRET=pick_any_long_random_string_here_minimum_32_chars
GEMINI_API_KEY=AIzaSy...your_actual_key...
```

---

## 🐍 STEP 3 — Start the Backend

Open a terminal in your project root:

```bash
# Go into backend folder
cd backend

# Create a virtual environment (recommended, do once)
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install packages (do once)
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

You should see:
```
INFO: Uvicorn running on http://127.0.0.1:8000
```

Test it at: http://localhost:8000/docs (FastAPI auto-generated docs)

---

## ⚛️ STEP 4 — Start the Frontend

Open a **NEW terminal** (keep backend running):

```bash
# Go into frontend folder
cd frontend

# Install packages (do once)
npm install

# Start the app
npm run dev
```

You should see:
```
VITE v5.x.x  ready in Xms
➜  Local:   http://localhost:5173/
```

Open your browser at: **http://localhost:5173**

---

## 🚀 STEP 5 — Use the App

1. **Landing Page** — you'll see the homepage with Sign In / Get Started
2. **Sign Up** — create your account (stored in MongoDB)
3. **Upload CSV** — drop `sample_data.csv` from the project folder
4. **Dashboard** — explore:
   - **Overview** — revenue/profit charts, KPIs, top performers
   - **Inventory** — stock levels and alerts
   - **AI Advisor** — chat with Gemini about your data

---

## 🐙 STEP 6 — Push to GitHub

Run these commands ONE TIME to set up the repo:

```bash
# Make sure you're in the project root (byzlytics/)
cd byzlytics

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "feat: Byzlytics 2.0 — MongoDB + auth + landing page"

# Create repo on GitHub first at https://github.com/new
# Then add it as remote (replace with YOUR repo URL):
git remote add origin https://github.com/YOUR_USERNAME/byzlytics.git

# Push to GitHub
git branch -M main
git push -u origin main
```

After the first push, future updates are just:
```bash
git add .
git commit -m "your message here"
git push
```

---

## 🔌 API Endpoints

| Method | Route           | Auth Required | Description              |
|--------|-----------------|---------------|--------------------------|
| GET    | /               | No            | Health check             |
| POST   | /auth/register  | No            | Create account           |
| POST   | /auth/login     | No            | Login → get JWT token    |
| POST   | /upload-csv     | ✅ Yes        | Upload CSV data          |
| GET    | /reports        | ✅ Yes        | Get charts + KPI data    |
| POST   | /chat           | ✅ Yes        | AI advisor chat          |
| POST   | /add-stock      | ✅ Yes        | Natural language stock   |

---

## 🐛 Common Issues & Fixes

**"Module not found" in Python**
```bash
pip install -r requirements.txt
```

**"npm: command not found"**
Download Node.js from https://nodejs.org (LTS version)

**"401 Unauthorized" in browser**
- Make sure you're logged in — token expires after 24 hours
- Try signing out and back in

**MongoDB connection error**
- Check your MONGODB_URI in .env
- Make sure your IP is whitelisted in MongoDB Atlas → Network Access → Add IP → Allow from anywhere (0.0.0.0/0) for dev

**AI chat says "needs API key"**
- Add GEMINI_API_KEY to backend/.env
- Restart backend after editing .env

**CORS error in browser console**
- Make sure backend is on port 8000
- Check allowed_origins in main.py includes http://localhost:5173

---

## 🛠️ Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS |
| Charts    | Recharts                      |
| Icons     | Lucide React                  |
| Backend   | FastAPI + Uvicorn             |
| Database  | MongoDB Atlas + Motor (async) |
| Auth      | JWT (python-jose) + bcrypt    |
| AI        | Google Gemini 1.5 Flash       |
| Data      | Pandas                        |

---

Built with ❤️ for Indian SMBs. Stack: FastAPI + MongoDB + React + Recharts + Gemini AI
