FROM python:3.9-slim

WORKDIR /app

# Copy requirements
COPY ../../../requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy common modules
COPY ../../common /app/common

# Copy service code
COPY . /app/nlu-voice-service

WORKDIR /app/nlu-voice-service

# Expose port
EXPOSE 8003

# Run the service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
