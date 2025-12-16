# AI-Powered Rural Healthcare System (APRHS)

A modular healthcare system designed for rural areas, integrating AI-powered diagnosis, offline-first patient records, multilingual support, and telemedicine capabilities.

## 🏗️ Architecture

The system is built as a collection of independent, loosely-coupled modules:

```
APRHS/
├── frontend/           # PWA Web Application (React/Vue)
├── backend/            # Microservices Architecture
│   ├── auth/          # Authentication & User Management
│   ├── patient-records/ # Patient Data API
│   ├── ai-services/   # AI/ML Microservices
│   │   ├── triage-service/     # Symptom-based triage
│   │   ├── vision-service/     # Wound/skin image analysis
│   │   └── nlu-voice-service/  # Multilingual chatbot
│   └── notification-service/   # Alerts & Reminders
├── database/          # Sync & Offline Layer (PouchDB/CouchDB)
├── docs/              # Documentation
└── scripts/           # Deployment & Utility Scripts
```

## 🎯 Core Features

### For Village Health Workers (VHWs)
- 📝 **Offline Patient Records**: Create and manage patient visits without internet
- 📸 **Photo Capture**: Document wounds, rashes, and symptoms
- 🔄 **Auto-Sync**: Seamless synchronization when connectivity is restored
- 📊 **Visit History**: Track patient progress over time

### For Patients
- 💬 **Self-Assessment Chat**: AI-powered symptom checker in local languages
- 🗣️ **Voice Support**: Speech-to-text for low-literacy users
- 📱 **Mobile-Friendly**: Works on basic smartphones
- 🔒 **Privacy-First**: All data encrypted and anonymized

### For Healthcare Authorities
- 📈 **Village-Level Dashboard**: Real-time health metrics and trends
- 🚨 **Outbreak Alerts**: Early warning system for disease patterns
- 📊 **Analytics**: Aggregate reports for resource planning
- 🗺️ **Geographic Insights**: Heat maps of health issues by region

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for AI services)
- Docker & Docker Compose (for deployment)
- CouchDB (for data sync)

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/ankit-kumar-developer-122/learning-Android.git
cd learning-Android/APRHS
```

2. **Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Start Backend Services**
```bash
cd backend
docker-compose up -d
```

4. **Access the Application**
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- CouchDB Admin: http://localhost:5984/_utils

## 📚 Documentation

- [Architecture Overview](docs/architecture.md)
- [Frontend Guide](docs/frontend.md)
- [Backend Services](docs/backend.md)
- [AI Models](docs/ai-models.md)
- [Deployment Guide](docs/deployment.md)
- [API Reference](docs/api.md)

## 🔧 Milestones

### ✅ Milestone 1: Offline Patient Entry (2-4 hours)
- [x] PouchDB integration in frontend
- [x] "New Visit" form with local storage
- [x] List of unsynced visits

### ✅ Milestone 2: Triage Microservice (2-4 hours)
- [x] Rule-based triage service
- [x] Frontend integration
- [x] Display triage results

### ✅ Milestone 3: Vision Service (4-8 hours)
- [x] Image capture in visit form
- [x] Vision service API (CO2Dnet integration)
- [x] Severity assessment display

### ✅ Milestone 4: Dashboard & Sync (2-4 hours)
- [x] CouchDB replication setup
- [x] Health authority dashboard
- [x] Village-level statistics

### ✅ Milestone 5: Multilingual Chatbot (2-4 hours)
- [x] Symptom chatbot UI
- [x] Web Speech API integration
- [x] English + Hindi support

### ✅ Milestone 6: Documentation (1-2 hours)
- [x] Complete README
- [x] API documentation
- [x] Deployment guides

## 🌟 Integration Sources

This project integrates and extends features from:

1. **[Gramin-Ai](https://github.com/sajidkhnx/Gramin-Ai)**: Symptom prediction backend & UI patterns
2. **[GramAarogya](https://github.com/Sid3503/GramAarogya)**: Multilingual chatbot flows & language resources
3. **[E-Laaj](https://github.com/tusharnankani/E-Laaj)**: Flask-based rural health management (records/appointments)
4. **[IMAS](https://github.com/uheal/IMAS)**: LLM-based triage logic and workflows
5. **[CO2Dnet](https://github.com/simatec-uis/CO2Dnet)**: Wound vision/skin assessment model

## 🏆 Key Differentiators

- **Truly Offline-First**: Works completely without internet, syncs when available
- **Modular Architecture**: Each component can be developed, tested, and deployed independently
- **Cross-Platform**: PWA works on web, Android, and iOS
- **AI-Powered**: Multiple AI models for comprehensive health assessment
- **Multilingual**: Built-in support for local languages
- **Open Source**: All components use permissive licenses

## 🔐 Security

- End-to-end encryption for patient data
- Role-based access control (RBAC)
- HIPAA-compliant data handling
- Audit logs for all access
- Secure API authentication (JWT)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && python -m pytest
```

## 📦 Deployment

### Production Deployment
```bash
# Build all services
./scripts/build-all.sh

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Deployment
See [deployment guide](docs/deployment.md) for AWS, Azure, and GCP instructions.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 👥 Team

Developed for rural healthcare accessibility.

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/ankit-kumar-developer-122/learning-Android/issues)
- Documentation: [docs/](docs/)

---

**Note**: This is a hackathon project demonstrating a modular, AI-powered healthcare system. For production use, additional security audits, compliance reviews, and testing are required.
