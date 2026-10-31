# APRHS Quick Start Guide

Get the AI-Powered Rural Healthcare System up and running in 5 minutes!

## 🚀 One-Command Setup

```bash
cd APRHS
./scripts/setup.sh
```

This will:
- ✅ Check prerequisites (Docker, Node.js, Python)
- ✅ Install frontend dependencies
- ✅ Install backend dependencies
- ✅ Start CouchDB
- ✅ Initialize databases
- ✅ Create environment configuration

## 🎯 Quick Start Options

### Option 1: Full Stack (Recommended)

```bash
# Start all backend services
./scripts/start.sh

# In a new terminal, start frontend
cd frontend
npm run dev
```

### Option 2: Docker Only

```bash
docker-compose up -d
```

Then access:
- Frontend: http://localhost:3000 (after building)
- Services: Ports 8001, 8002, 8003

### Option 3: Manual Start

```bash
# Terminal 1: CouchDB
docker run -d -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:3.3

# Terminal 2: Triage Service
cd backend/ai-services/triage-service
python main.py

# Terminal 3: Vision Service
cd backend/ai-services/vision-service
python main.py

# Terminal 4: NLU Service
cd backend/ai-services/nlu-voice-service
python main.py

# Terminal 5: Frontend
cd frontend
npm run dev
```

## 📱 Access the Application

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Triage API** | http://localhost:8001/docs | Symptom analysis API |
| **Vision API** | http://localhost:8002/docs | Image analysis API |
| **NLU API** | http://localhost:8003/docs | Chatbot API |
| **CouchDB** | http://localhost:5984/_utils | Database admin |

**Default CouchDB credentials:**
- Username: `admin`
- Password: `password`

## 🎮 Try It Out

### 1. Create a Patient Visit

1. Go to http://localhost:3000
2. Click "New Visit"
3. Fill in patient details
4. Add symptoms (e.g., "fever, cough")
5. Upload a photo (optional)
6. Save the visit
7. See the AI triage results!

### 2. Use the Chatbot

1. Click "Symptom Checker" in the navigation
2. Select language (English or Hindi)
3. Type or speak your symptoms
4. Get AI-powered health advice

### 3. View Dashboard

1. Click "Dashboard"
2. See statistics and analytics
3. View charts and trends

## 🛠️ Common Tasks

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f triage-service
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Check Service Health

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Clear Database

```bash
curl -X DELETE http://admin:password@localhost:5984/visits
curl -X DELETE http://admin:password@localhost:5984/patients
# Then recreate
curl -X PUT http://admin:password@localhost:5984/visits
curl -X PUT http://admin:password@localhost:5984/patients
```

## ⚠️ Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :5984

# Kill the process or change ports in docker-compose.yml
```

### Services Won't Start

```bash
# Check Docker is running
docker ps

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Issues

```bash
# Verify CouchDB is running
docker ps | grep couchdb

# Test connection
curl http://localhost:5984/_up
```

## 📚 Next Steps

- [Architecture Overview](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Full README](README.md)

## 💡 Tips

1. **Offline Mode**: Frontend works without backend services (limited functionality)
2. **Data Sync**: Use "Sync to Cloud" button to sync offline data
3. **Multiple Languages**: Chatbot supports English and Hindi
4. **Image Analysis**: Upload wound/skin photos for AI assessment
5. **Dashboard**: View real-time health metrics and trends

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- View issues: [GitHub Issues](https://github.com/ankit-kumar-developer-122/learning-Android/issues)
- Read docs: `/docs` directory

## 🎉 You're Ready!

The APRHS system is now running. Explore the features:
- ✅ Offline patient visit recording
- ✅ AI-powered symptom triage
- ✅ Medical image analysis
- ✅ Multilingual chatbot
- ✅ Real-time dashboard
- ✅ Data synchronization

**Happy healthcare innovation! 🏥💚**
