from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
import pandas as pd
import io, os, re
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import asyncio

load_dotenv()

# ─── App ─────────────────────────────────────────────────────────────────────
app = FastAPI(title="Byzlytics API v2.0")

app.add_middleware(
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://byzlytics.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
)

# ─── MongoDB ──────────────────────────────────────────────────────────────────
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME     = os.getenv("DB_NAME", "byzlytics")

client = AsyncIOMotorClient(MONGODB_URI)
db     = client[DB_NAME]

users_col  = db["users"]
sales_col  = db["sales"]

# ─── Auth setup ───────────────────────────────────────────────────────────────
JWT_SECRET    = os.getenv("JWT_SECRET", "changeme_secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ─── Pydantic models ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str
    provider: Optional[str] = "gemini"  # "gemini" or "groq"

class StockRequest(BaseModel):
    message: str

class ApiKeyUpdate(BaseModel):
    provider: str  # "gemini" or "groq"
    api_key: str

class UserProfile(BaseModel):
    name: str
    email: str
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None

# ─── Auth helpers ─────────────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ─── Helper: build summary for AI ────────────────────────────────────────────
def build_summary(records: list) -> str:
    if not records:
        return "No data uploaded yet."

    df = pd.DataFrame(records)
    df["revenue"] = df["quantity_sold"] * df["unit_price"]
    df["cost"]    = df["quantity_sold"] * df["unit_cost"]
    df["profit"]  = df["revenue"] - df["cost"]

    total_revenue = df["revenue"].sum()
    total_profit  = df["profit"].sum()
    total_cost    = df["cost"].sum()
    margin        = (total_profit / total_revenue * 100) if total_revenue else 0
    top_product   = df.groupby("product")["profit"].sum().idxmax()
    low_product   = df.groupby("product")["profit"].sum().idxmin()
    low_stock     = df[df["stock_remaining"] < 50]["product"].unique().tolist()
    out_of_stock  = df[df["stock_remaining"] == 0]["product"].unique().tolist()

    return f"""
Business Data Summary:
- Total Revenue: ₹{total_revenue:,.0f}
- Total Cost: ₹{total_cost:,.0f}
- Total Profit: ₹{total_profit:,.0f}
- Profit Margin: {margin:.1f}%
- Most profitable product: {top_product}
- Least profitable product: {low_product}
- Low stock items (< 50 units): {low_stock or 'None'}
- Out of stock: {out_of_stock or 'None'}
- Products: {df['product'].unique().tolist()}
- Categories: {df['category'].unique().tolist()}
"""

# ─── AI Providers ─────────────────────────────────────────────────────────────
async def call_gemini(api_key: str, prompt: str) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

async def call_groq(api_key: str, prompt: str) -> str:
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        message = client.messages.create(
            model="mixtral-8x7b-32768",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq error: {str(e)}")

# ─── ROUTE: Health check ─────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "Byzlytics API v2.0 running"}

# ─── ROUTE: Register ─────────────────────────────────────────────────────────
@app.post("/auth/register")
async def register(body: UserRegister):
    existing = await users_col.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "gemini_api_key": None,
        "groq_api_key": None,
        "created_at": datetime.utcnow(),
    }
    result = await users_col.insert_one(user)
    token = create_token({"sub": body.email})
    return {"token": token, "name": body.name, "email": body.email}

# ─── ROUTE: Login ─────────────────────────────────────────────────────────────
@app.post("/auth/login")
async def login(body: UserLogin):
    user = await users_col.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token({"sub": body.email})
    return {"token": token, "name": user["name"], "email": user["email"]}

# ─── ROUTE: Get User Profile ──────────────────────────────────────────────────
@app.get("/auth/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user["name"],
        "email": current_user["email"],
        "has_gemini_key": bool(current_user.get("gemini_api_key")),
        "has_groq_key": bool(current_user.get("groq_api_key")),
    }

# ─── ROUTE: Update API Keys ───────────────────────────────────────────────────
@app.post("/auth/api-key")
async def update_api_key(body: ApiKeyUpdate, current_user: dict = Depends(get_current_user)):
    if body.provider not in ["gemini", "groq"]:
        raise HTTPException(status_code=400, detail="Provider must be 'gemini' or 'groq'")

    key_field = f"{body.provider}_api_key"
    result = await users_col.update_one(
        {"email": current_user["email"]},
        {"$set": {key_field: body.api_key}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update API key")

    return {"message": f"{body.provider.capitalize()} API key updated successfully"}

# ─── ROUTE: Upload CSV ────────────────────────────────────────────────────────
@app.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    required = {"date", "product", "quantity_sold", "unit_price", "unit_cost", "stock_remaining"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%dT%H:%M:%S")

    user_email = current_user["email"]

    await sales_col.delete_many({"user_email": user_email})

    records = df.to_dict(orient="records")
    for r in records:
        r["user_email"] = user_email

    if records:
        await sales_col.insert_many(records)

    return {
        "message": "File uploaded successfully",
        "rows": len(records),
        "columns": list(df.columns),
        "filename": file.filename,
    }

# ─── ROUTE: Reports ───────────────────────────────────────────────────────────
@app.get("/reports")
async def get_reports(current_user: dict = Depends(get_current_user)):
    cursor = sales_col.find({"user_email": current_user["email"]}, {"_id": 0, "user_email": 0})
    records = await cursor.to_list(length=10000)

    if not records:
        raise HTTPException(status_code=404, detail="No data uploaded yet")

    df = pd.DataFrame(records)
    df["date"]    = pd.to_datetime(df["date"])
    df["revenue"] = df["quantity_sold"] * df["unit_price"]
    df["cost"]    = df["quantity_sold"] * df["unit_cost"]
    df["profit"]  = df["revenue"] - df["cost"]

    total_revenue = float(df["revenue"].sum())
    total_cost    = float(df["cost"].sum())
    total_profit  = float(df["profit"].sum())
    margin        = round(total_profit / total_revenue * 100, 1) if total_revenue else 0

    df["month"] = df["date"].dt.to_period("M").astype(str)
    monthly = (
        df.groupby("month")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"), cost=("cost","sum"))
        .reset_index().to_dict(orient="records")
    )

    by_product = (
        df.groupby("product")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"),
             quantity=("quantity_sold","sum"), stock=("stock_remaining","last"))
        .reset_index()
    )
    by_product["margin"] = (by_product["profit"] / by_product["revenue"] * 100).round(1)
    product_data = by_product.to_dict(orient="records")

    by_category = (
        df.groupby("category")
        .agg(revenue=("revenue","sum"), profit=("profit","sum"))
        .reset_index().to_dict(orient="records")
    )

    latest_stock = df.sort_values("date").groupby("product").last()["stock_remaining"].reset_index()
    inventory = []
    for _, row in latest_stock.iterrows():
        stock = int(row["stock_remaining"])
        status = "out_of_stock" if stock == 0 else "low" if stock < 50 else "medium" if stock < 150 else "good"
        inventory.append({"product": row["product"], "stock": stock, "status": status})

    top3 = by_product.nlargest(3, "profit")[["product","profit"]].to_dict(orient="records")
    bot3 = by_product.nsmallest(3, "profit")[["product","profit"]].to_dict(orient="records")

    return {
        "kpis": {"total_revenue": total_revenue, "total_cost": total_cost,
                 "total_profit": total_profit, "margin": margin},
        "monthly": monthly,
        "products": product_data,
        "categories": by_category,
        "inventory": inventory,
        "top_performers": top3,
        "bottom_performers": bot3,
    }

# ─── ROUTE: AI Chat ───────────────────────────────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest, current_user: dict = Depends(get_current_user)):
    provider = req.provider.lower()
    if provider not in ["gemini", "groq"]:
        provider = "gemini"

    # Get user's API key for the chosen provider
    api_key_field = f"{provider}_api_key"
    api_key = current_user.get(api_key_field, "")

    if not api_key:
        return {
            "reply": f"⚠️ Please add your {provider.capitalize()} API key in Settings first. "
                     f"Go to Dashboard → Settings → Add API Key"
        }

    cursor = sales_col.find({"user_email": current_user["email"]}, {"_id": 0, "user_email": 0})
    records = await cursor.to_list(length=10000)
    summary = build_summary(records)

    prompt = f"""You are a friendly business advisor for a small business owner.

Data:
{summary}

Question: {req.message}

Rules:
- Plain English, no jargon
- Use real numbers and ₹ for currency
- 2–4 sentences max
- Be actionable
"""

    try:
        if provider == "gemini":
            reply = await call_gemini(api_key, prompt)
        else:  # groq
            reply = await call_groq(api_key, prompt)
        return {"reply": reply}
    except Exception as e:
        return {"reply": f"Error: {str(e)}"}

# ─── ROUTE: Add stock ─────────────────────────────────────────────────────────
@app.post("/add-stock")
async def add_stock(req: StockRequest, current_user: dict = Depends(get_current_user)):
    msg = req.message.lower()
    numbers = re.findall(r'\d+', msg)
    if not numbers:
        raise HTTPException(status_code=400, detail="No number found in message")

    quantity = int(numbers[0])
    cursor   = sales_col.find({"user_email": current_user["email"]}, {"product": 1})
    docs     = await cursor.to_list(length=1000)
    products = list({d["product"] for d in docs})

    matched = None
    for p in products:
        if p.lower() in msg or any(w in msg for w in p.lower().split()):
            matched = p
            break

    if not matched:
        return {"message": f"Product not found. Available: {products}", "success": False}

    await sales_col.update_many(
        {"user_email": current_user["email"], "product": matched},
        {"$inc": {"stock_remaining": quantity}}
    )

    latest = await sales_col.find_one(
        {"user_email": current_user["email"], "product": matched},
        sort=[("date", -1)]
    )
    new_stock = latest["stock_remaining"] if latest else quantity

    return {
        "message": f"Added {quantity} units to {matched}. New stock: {new_stock} units.",
        "product": matched,
        "added": quantity,
        "new_stock": new_stock,
        "success": True,
    }