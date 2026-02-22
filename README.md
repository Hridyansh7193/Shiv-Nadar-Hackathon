# 🛡️ Sentinel Source – Dependency Firewall

An AI-powered supply chain security auditor that detects malicious and vulnerable dependencies in your project.

---

## 🚨 Problem

Modern applications rely heavily on third-party dependencies (npm, pip, etc.).
These dependencies can:

* Contain hidden malicious code
* Introduce vulnerabilities
* Be compromised in supply chain attacks

---

## 💡 Solution

**Sentinel Source** analyzes dependencies and identifies:

* 🚨 Suspicious behavior (exec, base64, network calls)
* ⚠️ Risk levels (Low / Medium / High / Critical)
* 📊 Overall security score
* 🧠 Detailed explanations for each risk

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion

### Backend

* FastAPI (Python)
* Uvicorn
* Custom dependency analyzer

---

# ⚙️ SETUP & RUN (STEP-BY-STEP)

---

## 🔹 Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

---

## 🔹 Step 2: Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

## 🔹 Step 3: Run Backend

```bash
python -m uvicorn main:app --reload
```

---

### ✅ Verify Backend

Open in browser:

```
http://127.0.0.1:8000/docs
```

You should see FastAPI Swagger UI.

---

## 🔹 Step 4: Frontend Setup

```bash
cd frontend
npm install
```

---

## 🔹 Step 5: Run Frontend

```bash
npm run dev
```

---

### ✅ Open App

```
http://localhost:5173
```

---

# 🔗 FRONTEND ↔ BACKEND INTEGRATION

---

## 🔹 Step 6: Ensure API Base URL

In `src/services/api.js`:

```js
const API_BASE_URL = "http://localhost:8000";
```

---

## 🔹 Step 7: Disable Demo Mode

In `App.jsx`:

```js
const DEMO_MODE = false;
```

---

## 🔹 Step 8: Test API Call

1. Open browser
2. Press `F12 → Network → Fetch/XHR`
3. Upload a file

You should see:

```
POST /analyze → 200
```

---

## 🔹 Step 9: Verify Data Flow

Data flow:

```
Upload → API → Backend → Response → Frontend → Dashboard
```

---

# 🚀 HOW TO USE

---

## 🔹 Step 10: Application Flow

1. Open the app
2. Go to Auth Page
3. Login / Continue
4. Upload `package.json`
5. View results

---

## 🔹 Step 11: Output Includes

* 📊 Security Score
* 📦 Dependency list
* ⚠️ Risk level
* 🧠 Explanation
* 🚨 Suspicious indicators

---

# 🧠 HOW IT WORKS

---

## 🔍 Analysis Engine

The backend scans dependencies and detects:

* `exec()` calls → command execution
* Base64 encoding → obfuscation
* Network calls → suspicious communication
* File access → sensitive operations

---

## 📊 Risk Calculation

* Each dependency gets a risk score (0–100)
* Average risk → overall project score
* Higher score = safer project

---

# ⚠️ TROUBLESHOOTING

---

## ❌ Backend not running

```bash
uvicorn main:app --reload
```

---

## ❌ Frontend not connecting

* Check backend URL in `api.js`
* Ensure backend is running

---

## ❌ No API request

* Check `DEMO_MODE = false`
* Verify file upload triggers function

---

## ❌ CORS error

Add this in backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ❌ Blank UI / No Data

* Check API response in Network tab
* Ensure mapping from `results → dependencies`

---

# 🔥 FEATURES

* 📁 Upload `package.json`
* 🔍 Dependency analysis
* ⚠️ Risk classification
* 📊 Security scoring
* 🧠 AI-style explanations
* 🎨 Interactive dashboard

---

# 🚀 FUTURE IMPROVEMENTS

* GitHub repo scanning
* CI/CD integration
* Auto-fix suggestions
* Dependency trust scoring
* SaaS deployment

---
