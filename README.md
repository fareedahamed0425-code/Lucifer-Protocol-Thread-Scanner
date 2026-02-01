# 🔥 BS4: Lucifer Protocol — URL Threat Scanner

<p align="center">
  <img src="https://img.shields.io/badge/Project-BS4-red?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Threat%20Scanner-URL%20Security-black?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/AI%20Analysis-DeepSeek-blue?style=for-the-badge&logo=deepseek"/>
  <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=next.js"/>
</p>

<p align="center">
  <strong>Advanced AI-powered URL threat detection with risk scoring, IP intelligence, and threat classification.</strong>
</p>

---

## 🌟 Overview
**BS4: Lucifer Protocol** is a specialized security platform developed for the Student Innovation Hackathon. It bridges the gap between simple URL validation and deep security analysis. By leveraging **DeepSeek AI** and multi-layer verification logic, the system identifies malicious patterns, phishing attempts, and unsafe IP reputations in real-time.

---

## 🏗 System Architecture

The project follows a modern **Serverless Architecture** using Next.js, where the frontend interacts with a specialized Analysis Engine powered by DeepSeek AI logic.

🎯 Core Functionality
🔍 Multi-Layer URL Scanning

The scanner inspects URLs through multiple analysis techniques, including:

Suspicious URL structure and patterns

Redirect-based & unsafe link behavior

Known malicious domain indicators

IP-based threat signals

📊 Threat Score Engine

Each scan produces a Threat Score (0–100) based on security indicators detected during analysis.

Low score → Likely safe

Medium score → Suspicious

High score → Dangerous / malicious

🧠 Threat Classification Output

In addition to scoring, the system classifies threats into categories such as:

🛑 Phishing risk

🦠 Malware / harmful hosting

🔁 Suspicious redirects

🌐 Unsafe IP / domain reputation

⚠️ Blacklist association

🚦 How It Works
User enters URL
     ↓
Analysis service runs multi-layer checks
     ↓
Threat scoring + classification engine
     ↓
Threat Score + Threat Types + Explanation
     ↓
Result displayed in UI

🖥️ User Interface (UI)

The platform typically includes:

URL input field + scan action

Threat score visualization

Threat category list

Detailed analysis / breakdown report

🔥 Why Lucifer Protocol?

✅ Not a basic “URL validator”
✅ Threat-analysis workflow focused on real security use cases
✅ Multi-scan threat detection model
✅ Risk score + threat classification output
✅ Designed as a practical hackathon-ready cybersecurity solution

🚀 Highlights

🧠 AI-assisted scoring logic (DeepSeek-based analysis engine)

🔍 Multi-factor detection approach (not single-check scanning)

📌 Clear classification of detected threats

📄 Report-style output for readability

🛡️ Security-first design and workflow

🧠 Tech Stack
Layer	Technology
Frontend	React / Next.js
UI	Tailwind CSS
Backend	Node.js / API Routes
Analysis Engine	DeepSeek-powered logic
Deployment	Vercel / Localhost
🗂️ Project Structure (Simplified)
Lucifer-Protocol-Thread-Scanner/
├── src/
│   ├── app/                # App Router routes (if Next.js)
│   ├── pages/              # Pages Router (if used)
│   ├── components/         # Reusable UI components
│   ├── services/           # Threat scanning logic / analysis service
│   ├── utils/              # URL parsing, validators, scoring helpers
│   ├── lib/                # Shared constants, config, helper logic
│   └── api/                # Backend scanning API endpoints
│
├── public/                 # Static assets
├── package.json            # Dependencies & scripts
├── README.md               # Documentation
└── .gitignore

⚙️ Run Locally
1️⃣ Clone the repository
git clone https://github.com/fareedahamed0425-code/Lucifer-Protocol-Thread-Scanner.git
cd Lucifer-Protocol-Thread-Scanner

2️⃣ Install dependencies
npm install

3️⃣ Start development server
npm run dev


Open in browser:
👉 http://localhost:3000

📌 Use Cases

🔎 Scan suspicious links before opening them

🛡️ Cybersecurity student projects

🧪 Hackathons & security demonstrations

🏫 Academic research and URL threat studies

🌐 Community-driven threat intelligence prototype

🧭 Future Enhancements

✅ Scan history tracking (logs)

🔗 Integration with multiple threat intelligence sources

🧾 Exportable threat reports (PDF / JSON)

🧠 Advanced scoring weights / ML-based scoring

🧩 Browser extension integration

🚨 Real-time alerting and monitoring system

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a feature branch

Submit a Pull Request ✅

🔐 Disclaimer

This project is intended for:

✅ Educational use
✅ Research purposes
✅ Hackathons / demos

It may not detect:

All zero-day attacks

Newly registered malicious domains

Advanced APT-level campaigns

Always verify suspicious URLs using trusted security tools.

📄 License

This project is open-source and free to use for educational and development purposes.

👨‍💻 Author

Fareed Ahamed
GitHub: @fareedahamed0425-code
