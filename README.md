# Byzlytics 2.0

<p align="center">
  <b>AI-Powered Business Intelligence Platform for SMBs</b>
</p>

<p align="center">
  Transform raw business data into actionable insights with AI-powered analytics, inventory tracking, KPI dashboards, and intelligent business recommendations.
</p>

<p align="center">
  🌐 <a href="https://byzlytics.vercel.app">Use Byzlytics on the Web</a>
</p>

---

## ✨ Features

### 📊 Advanced Business Analytics

* Real-time KPI dashboards
* Revenue and profit tracking
* Sales trend visualizations
* Business performance monitoring
* Interactive charts and reports

### 🤖 AI Business Assistant

* Ask questions about business data
* AI-generated recommendations and insights
* Smart business analysis using Gemini AI
* Natural language interaction

### 📦 Smart Inventory Management

* Inventory monitoring system
* Stock alerts and updates
* Product tracking dashboard
* Intelligent stock management

### 🔐 Secure Authentication System

* JWT authentication
* Secure login & registration
* Password hashing with bcrypt
* Protected backend routes

### ☁️ Cloud Database Integration

* MongoDB Atlas integration
* Persistent user data storage
* Scalable backend architecture

### 📁 CSV Data Processing

* Upload and analyze sales datasets
* Automated business reports
* Dynamic dashboard generation

---

## 🚀 Overview

Byzlytics 2.0 is a full-stack AI-powered business analytics platform built for small and medium businesses. It transforms raw CSV sales data into interactive dashboards, profit reports, inventory insights, and AI-generated recommendations.

The platform combines:

* 📊 Real-time analytics dashboards
* 🤖 AI-powered business assistant using Gemini AI
* 🔐 Secure JWT authentication
* ☁️ MongoDB cloud database integration
* 📈 KPI visualizations and reports
* 📦 Inventory tracking and alerts

Whether you're analyzing revenue trends, monitoring stock levels, or asking AI for recommendations, Byzlytics provides a modern business intelligence experience in a simple web application.

---

## ✨ Features

### 📊 Smart Analytics Dashboard

* Revenue and profit analytics
* Interactive KPI cards
* Sales trend visualizations
* Top-performing products analysis
* Business performance reports

### 🤖 AI Business Advisor

* Chat with your business data
* AI-generated insights and recommendations
* Powered by Google Gemini AI
* Natural language interaction

### 📦 Inventory Management

* Stock tracking system
* Inventory alerts
* Smart stock updates
* Natural language stock input

### 🔐 Authentication & Security

* JWT-based authentication
* Secure login and registration
* Protected API routes
* Password hashing with bcrypt

### ☁️ Cloud Database Integration

* MongoDB Atlas support
* Persistent user data storage
* Async backend operations

### 📁 CSV Data Processing

* Upload business sales data
* Automatic report generation
* Data visualization from CSV files

---

## 🛠️ Tech Stack

| Layer           | Technologies                 |
| --------------- | ---------------------------- |
| Frontend        | React 18, Vite, Tailwind CSS |
| Charts          | Recharts                     |
| Backend         | FastAPI, Uvicorn             |
| Database        | MongoDB Atlas, Motor         |
| Authentication  | JWT, bcrypt, python-jose     |
| AI Integration  | Google Gemini 1.5 Flash      |
| Data Processing | Pandas                       |
| Icons           | Lucide React                 |

---

## 📂 Project Structure

```bash
byzlytics/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   │
│   ├── package.json
│   └── index.html
│
├── sample_data.csv
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ovemugan/-Byzlytics.git
cd -Byzlytics
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` directory.

```env
MONGODB_URI=your_mongodb_connection_string
DB_NAME=byzlytics
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🧠 Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload
```

Backend will run on:

```bash
http://127.0.0.1:8000
```

FastAPI docs:

```bash
http://127.0.0.1:8000/docs
```

---

## ⚛️ Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run on:

```bash
http://localhost:5173
```

---

## 📊 How It Works

1. User registers or logs in
2. Uploads a CSV sales dataset
3. Backend processes data using Pandas
4. Dashboard displays KPIs and analytics
5. AI assistant provides insights using Gemini AI
6. Inventory alerts help monitor stock levels

---

## 📸 Core Modules

### 🏠 Landing Page

Modern responsive landing page with authentication modals.

### 📤 CSV Upload System

Upload and process business datasets instantly.

### 📈 Analytics Dashboard

Interactive charts, KPIs, revenue tracking, and performance analysis.

### 🤖 AI Chat Assistant

Ask business-related questions in natural language.

### 📦 Inventory Monitoring

Track stock levels and receive inventory alerts.

---

## 🔌 API Endpoints

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/`              | Health check            |
| POST   | `/auth/register` | Register new user       |
| POST   | `/auth/login`    | Login user              |
| POST   | `/upload-csv`    | Upload CSV dataset      |
| GET    | `/reports`       | Fetch analytics reports |
| POST   | `/chat`          | AI business advisor     |
| POST   | `/add-stock`     | Add or update stock     |

---

## 🧪 Sample Dataset

A sample dataset is included:

```bash
sample_data.csv
```

You can use it to test:

* Revenue analytics
* Profit tracking
* Inventory alerts
* Dashboard visualizations

---

## 🎯 Key Highlights

* Full-stack production-style architecture
* AI integration with Gemini API
* JWT authentication flow
* Responsive modern UI
* Interactive charts and KPIs
* Real-world SMB business use case
* Cloud database integration
* Clean modular folder structure

---

## 🚀 Future Improvements

* Export reports as PDF/Excel
* Advanced forecasting using ML
* Multi-user organization support
* Role-based access control
* Real-time notifications
* Dark/light theme toggle
* Docker deployment
* Advanced analytics engine

---

## 🌐 Web Application

Byzlytics is fully deployed and accessible on the web.

🔗 [https://byzlytics.vercel.app](https://byzlytics.vercel.app)

Access the platform to:

* Upload and analyze business datasets
* Track KPIs and sales analytics
* Monitor inventory insights
* Interact with the AI business assistant
* Explore the complete dashboard experience

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

```bash
# Fork the repository
# Create a feature branch
# Commit your changes
# Push and create a pull request
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by Omshakthi Sharma.

GitHub: [https://github.com/ovemugan](https://github.com/ovemugan)

---

## ⭐ Support

If you found this project useful:

* Star the repository
* Share it with others
* Contribute improvements

---

<p align="center">
  Built with ❤️ using FastAPI, React, MongoDB, and Gemini AI
</p>
