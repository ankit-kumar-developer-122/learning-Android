# APRHS Deployment Guide

Complete guide for deploying APRHS in different environments.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.9+ (for local backend development)
- Git

## Local Development

### 1. Clone Repository

```bash
git clone https://github.com/ankit-kumar-developer-122/learning-Android.git
cd learning-Android/APRHS
```

### 2. Start Backend Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start services individually:

# CouchDB
docker run -d -p 5984:5984 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password couchdb:3.3

# Triage Service
cd backend/ai-services/triage-service
pip install -r ../../requirements.txt
python main.py

# Vision Service
cd backend/ai-services/vision-service
pip install -r ../../requirements.txt
python main.py

# NLU Service
cd backend/ai-services/nlu-voice-service
pip install -r ../../requirements.txt
python main.py
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:3000
- Triage Service: http://localhost:8001
- Vision Service: http://localhost:8002
- NLU Service: http://localhost:8003
- CouchDB Admin: http://localhost:5984/_utils

## Production Deployment

### Using Docker Compose

1. **Update Environment Variables**

Create `.env` file:

```bash
# API Settings
SECRET_KEY=your-production-secret-key-change-this
COUCHDB_USER=admin
COUCHDB_PASSWORD=strong-password-here

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_COUCHDB_URL=https://db.yourdomain.com
```

2. **Build and Start Services**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Setup SSL/TLS**

Using Let's Encrypt with Certbot:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

4. **Setup Nginx Reverse Proxy**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    location /triage {
        proxy_pass http://localhost:8001;
    }

    location /vision {
        proxy_pass http://localhost:8002;
    }

    location /chatbot {
        proxy_pass http://localhost:8003;
    }
}
```

### Cloud Deployment

#### AWS Deployment

**Using ECS (Elastic Container Service)**

1. **Setup ECR Repositories**

```bash
# Create repositories
aws ecr create-repository --repository-name aprhs-frontend
aws ecr create-repository --repository-name aprhs-triage
aws ecr create-repository --repository-name aprhs-vision
aws ecr create-repository --repository-name aprhs-nlu

# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag aprhs-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/aprhs-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/aprhs-frontend:latest
```

2. **Create ECS Cluster**

```bash
aws ecs create-cluster --cluster-name aprhs-cluster
```

3. **Deploy Services**

Create `task-definition.json` and deploy:

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster aprhs-cluster --service-name aprhs-service --task-definition aprhs-task
```

**Using Lambda (Serverless)**

1. Package each service as Lambda function
2. Use API Gateway for routing
3. Deploy with SAM or Serverless Framework

#### Azure Deployment

**Using AKS (Azure Kubernetes Service)**

1. **Create AKS Cluster**

```bash
az aks create --resource-group aprhs-rg --name aprhs-cluster --node-count 3
az aks get-credentials --resource-group aprhs-rg --name aprhs-cluster
```

2. **Deploy with Kubernetes**

```bash
kubectl apply -f k8s/
```

**Using Azure Container Instances**

```bash
az container create \
  --resource-group aprhs-rg \
  --name aprhs-frontend \
  --image <registry>/aprhs-frontend:latest \
  --dns-name-label aprhs-app \
  --ports 3000
```

#### Google Cloud Platform

**Using GKE (Google Kubernetes Engine)**

1. **Create GKE Cluster**

```bash
gcloud container clusters create aprhs-cluster --num-nodes=3
gcloud container clusters get-credentials aprhs-cluster
```

2. **Deploy Services**

```bash
kubectl apply -f k8s/
```

**Using Cloud Run**

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/aprhs-frontend
gcloud run deploy aprhs-frontend --image gcr.io/PROJECT_ID/aprhs-frontend --platform managed
```

## Database Setup

### CouchDB Configuration

1. **Create Required Databases**

```bash
curl -X PUT http://admin:password@localhost:5984/visits
curl -X PUT http://admin:password@localhost:5984/patients
```

2. **Setup Replication**

For multi-region setup:

```json
{
  "source": "http://admin:password@region1.yourdomain.com:5984/visits",
  "target": "http://admin:password@region2.yourdomain.com:5984/visits",
  "continuous": true,
  "create_target": true
}
```

3. **Configure Backups**

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
curl -X GET http://admin:password@localhost:5984/visits/_all_docs?include_docs=true > backup_visits_$DATE.json
curl -X GET http://admin:password@localhost:5984/patients/_all_docs?include_docs=true > backup_patients_$DATE.json
```

## Monitoring Setup

### Health Checks

All services expose `/health` endpoint:

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

### Prometheus Monitoring

Add to `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Log Aggregation

Using ELK Stack:

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
  environment:
    - discovery.type=single-node

logstash:
  image: docker.elastic.co/logstash/logstash:8.5.0

kibana:
  image: docker.elastic.co/kibana/kibana:8.5.0
  ports:
    - "5601:5601"
```

## Security Hardening

### 1. Environment Variables

Never commit secrets. Use:
- AWS Secrets Manager
- Azure Key Vault
- GCP Secret Manager
- HashiCorp Vault

### 2. Network Security

```bash
# Firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 3. Container Security

- Use non-root users in containers
- Scan images with Trivy
- Keep base images updated
- Use minimal base images (alpine)

### 4. Database Security

- Enable authentication
- Use strong passwords
- Enable SSL/TLS
- Regular backups
- Network isolation

## Performance Optimization

### Frontend

```bash
# Enable compression in nginx
gzip on;
gzip_types text/plain application/json;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Backend

```python
# Enable uvicorn workers
uvicorn main:app --workers 4 --host 0.0.0.0 --port 8001
```

### Database

```bash
# CouchDB configuration
# Increase max_dbs_open
[couchdb]
max_dbs_open = 500

# Enable compression
[httpd]
compression = gzip
```

## Scaling Strategy

### Horizontal Scaling

```bash
# Scale services with Docker Compose
docker-compose up -d --scale triage-service=3 --scale vision-service=2

# Scale with Kubernetes
kubectl scale deployment aprhs-triage --replicas=5
```

### Load Balancing

Nginx upstream configuration:

```nginx
upstream triage_backend {
    least_conn;
    server triage1:8001;
    server triage2:8001;
    server triage3:8001;
}
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs triage-service

# Check service health
curl http://localhost:8001/health
```

### Database Connection Issues

```bash
# Test CouchDB connection
curl http://admin:password@localhost:5984/_up

# Check database status
curl http://admin:password@localhost:5984/_all_dbs
```

### Sync Not Working

1. Check network connectivity
2. Verify CouchDB credentials
3. Check browser console for errors
4. Review PouchDB sync status

## Maintenance

### Updates

```bash
# Update dependencies
cd frontend && npm update
cd backend && pip install --upgrade -r requirements.txt

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```

### Backups

Schedule regular backups:

```bash
# Cron job for daily backups
0 2 * * * /opt/aprhs/scripts/backup.sh
```

### Database Cleanup

```bash
# Compact databases
curl -X POST http://admin:password@localhost:5984/visits/_compact
curl -X POST http://admin:password@localhost:5984/patients/_compact
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/ankit-kumar-developer-122/learning-Android/issues
- Documentation: /docs/

---

**Last Updated:** 2024-01-15  
**Version:** 1.0.0
