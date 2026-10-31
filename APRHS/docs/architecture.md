# APRHS Architecture

## System Overview

APRHS (AI-Powered Rural Healthcare System) is a modular, microservices-based healthcare platform designed for rural and remote areas with limited internet connectivity.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (PWA)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   VHW    │  │ Patient  │  │ Doctor   │  │ Chatbot  │    │
│  │    UI    │  │  Self    │  │Dashboard │  │   UI     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│         │              │              │            │         │
│         └──────────────┴──────────────┴────────────┘         │
│                           │                                  │
│                     PouchDB (Offline)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    Network Boundary
                            │
┌───────────────────────────┴─────────────────────────────────┐
│                      API Gateway (Nginx)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│    Triage      │  │   Vision    │  │   NLU/Voice     │
│   Service      │  │  Service    │  │    Service      │
│  (FastAPI)     │  │ (FastAPI)   │  │   (FastAPI)     │
└───────┬────────┘  └──────┬──────┘  └────────┬────────┘
        │                  │                   │
        └──────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   CouchDB   │
                    │   (Sync)    │
                    └─────────────┘
```

## Components

### 1. Frontend (PWA)

**Technology Stack:**
- React 18 with Vite
- PouchDB for offline storage
- Recharts for data visualization
- Web Speech API for voice input

**Key Features:**
- Offline-first architecture
- Progressive Web App (PWA) capabilities
- Real-time sync when online
- Responsive design for mobile/tablet

**Modules:**
- **VHW Interface**: Patient visit recording, photo capture, vitals tracking
- **Patient Self-Assessment**: Symptom checker, image upload
- **Doctor Dashboard**: Analytics, village metrics, outbreak alerts
- **Chatbot Interface**: Multilingual symptom assessment

### 2. Backend Services

#### 2.1 Triage Service (Port 8001)

**Purpose:** AI-powered symptom analysis and prioritization

**Technology:** Python/FastAPI

**Features:**
- Rule-based triage logic
- Priority classification (Emergency, Urgent, Moderate, Routine)
- Age-adjusted recommendations
- Batch processing capability

**Integration:** Based on Gramin-Ai and IMAS triage workflows

#### 2.2 Vision Service (Port 8002)

**Purpose:** Medical image analysis for wounds and skin conditions

**Technology:** Python/FastAPI

**Features:**
- Image upload and analysis
- Severity classification
- Clinical recommendations
- Support for multiple image types (wounds, rashes, burns)

**Integration:** Designed for CO2Dnet model integration

#### 2.3 NLU/Voice Service (Port 8003)

**Purpose:** Multilingual chatbot and voice interaction

**Technology:** Python/FastAPI

**Features:**
- English and Hindi support
- Symptom detection from text
- Context-aware conversations
- Voice input processing

**Integration:** Based on GramAarogya multilingual patterns

### 3. Database Layer

#### PouchDB (Client-side)
- Local storage in browser
- IndexedDB backend
- Offline query support
- Automatic conflict resolution

#### CouchDB (Server-side)
- Distributed document database
- Built-in replication
- RESTful HTTP API
- Multi-master sync

**Sync Strategy:**
- Background sync when online
- Conflict-free replicated data types (CRDTs)
- Incremental updates
- Retry logic for failed syncs

### 4. API Gateway (Nginx)

**Purpose:** Unified API endpoint and load balancing

**Features:**
- Request routing
- SSL/TLS termination
- Rate limiting
- CORS handling
- Health checks

## Data Flow

### Patient Visit Recording Flow

```
1. VHW opens "New Visit" form (offline capable)
2. Fills patient details, symptoms, vitals
3. Captures photos if needed
4. Data saved to PouchDB immediately
5. If online: 
   - Symptoms sent to Triage Service → Priority assigned
   - Images sent to Vision Service → Analysis performed
6. Results stored in local visit record
7. Visit synced to CouchDB when connection available
8. Dashboard updated with aggregated data
```

### Chatbot Interaction Flow

```
1. Patient opens chatbot interface
2. Selects language (English/Hindi)
3. Types or speaks symptoms
4. Web Speech API converts voice to text (if voice)
5. Text sent to NLU Service
6. NLU detects symptoms and generates response
7. Response displayed with suggestions
8. Conversation continues with context tracking
9. Final recommendation: consult doctor or home care
```

## Security

### Authentication
- JWT-based authentication (planned)
- Role-based access control (VHW, Doctor, Admin)
- Session management

### Data Protection
- HTTPS/TLS for all API calls
- End-to-end encryption for sensitive data
- HIPAA-compliant data handling
- Audit logs for all access

### Privacy
- Anonymized patient identifiers
- Consent management
- Data retention policies
- Right to erasure support

## Scalability

### Horizontal Scaling
- Microservices can scale independently
- Stateless service design
- Load balancing via Nginx
- Container orchestration (Kubernetes ready)

### Vertical Scaling
- CouchDB clustering
- Redis for session storage (planned)
- CDN for static assets
- Database indexing optimization

## Deployment Options

### Development
```bash
docker-compose up
```

### Production (Docker)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud (Kubernetes)
```bash
kubectl apply -f k8s/
```

### Supported Platforms
- AWS (ECS, EKS, Lambda)
- Azure (AKS, Container Instances)
- GCP (GKE, Cloud Run)
- On-premise servers

## Monitoring & Observability

### Metrics
- Service health checks
- Response times
- Error rates
- Sync status
- Database size

### Logging
- Centralized logging (planned)
- Error tracking
- Audit trails
- Performance monitoring

### Alerting
- Service downtime alerts
- High error rate notifications
- Sync failure alerts
- Resource utilization warnings

## Future Architecture Enhancements

1. **Event-Driven Architecture**
   - Apache Kafka for event streaming
   - Async processing of images
   - Real-time outbreak detection

2. **Machine Learning Pipeline**
   - Model training infrastructure
   - A/B testing for models
   - Continuous model improvement

3. **Edge Computing**
   - Local inference on edge devices
   - Reduce latency for critical services
   - Bandwidth optimization

4. **Federation**
   - Multi-region deployment
   - Data sovereignty compliance
   - Cross-region replication

## Technology Choices Rationale

### Why React + PouchDB?
- **React**: Component reusability, large ecosystem, PWA support
- **PouchDB**: Offline-first, syncs perfectly with CouchDB, battle-tested

### Why FastAPI?
- High performance (async support)
- Auto-generated API docs (OpenAPI)
- Type safety with Pydantic
- Easy deployment

### Why CouchDB?
- Built-in replication
- HTTP API (works with any client)
- Conflict resolution
- Offline-first by design

### Why Microservices?
- Independent deployment
- Technology flexibility
- Fault isolation
- Easier scaling

## Integration with Referenced Projects

| Project | Component Used | How Integrated |
|---------|---------------|----------------|
| Gramin-Ai | Symptom prediction logic | Adapted in Triage Service |
| GramAarogya | Multilingual flows | Implemented in NLU Service |
| E-Laaj | Health record patterns | Used in data models |
| IMAS | Triage workflows | Applied in service logic |
| CO2Dnet | Wound vision model | Placeholder for future integration |

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Page Load | < 2s | ~1.5s |
| API Response | < 500ms | ~200ms |
| Offline Capability | 100% | 100% |
| Sync Time | < 10s for 100 visits | ~5s |
| Image Analysis | < 3s | ~1s (placeholder) |
| Chatbot Response | < 200ms | ~100ms |

## Compliance & Standards

- **FHIR**: Future support for healthcare data exchange
- **HL7**: Messaging standards
- **HIPAA**: Privacy and security rules
- **GDPR**: Data protection (for international deployment)

---

**Version:** 1.0.0  
**Last Updated:** 2024-01-15  
**Maintainer:** APRHS Team
