# 🛡️ Sentinel Source – Dependency Firewall

An AI-powered supply chain security auditor that detects malicious and vulnerable dependencies in your project.

---

## 🚨 Problem

Modern applications rely heavily on third-party packages (npm, pip, etc.).  
Many of these packages:

- Contain hidden malicious code  
- Are vulnerable to exploits  
- Can compromise entire systems (supply chain attacks)

---

## 💡 Solution

**Sentinel Source** analyzes dependencies and detects:

- 🔥 Suspicious behavior patterns (exec, base64, network calls)
- ⚠️ Risk levels (Low / Medium / High / Critical)
- 📊 Security score of your project
- 🧠 AI-generated explanations

---

## ✨ Features

- 📁 Upload `package.json`
- 🔍 Deep dependency analysis
- 🚨 Risk scoring system
- 🧠 Behavioral pattern detection
- 📊 Interactive dashboard
- ⚡ Real-time results

---

## 🧠 How It Works

1. User uploads `package.json`
2. Backend analyzes dependencies
3. Detects patterns like:
   - `exec()` calls
   - Base64 encoding
   - Network activity
4. Assigns risk scores
5. Frontend visualizes results

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion

### Backend
- FastAPI (Python)
- Uvicorn
- Custom dependency analyzer

---

## 📦 Installation

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
