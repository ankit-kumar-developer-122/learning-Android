FROM python:3.9-slim

WORKDIR /app

# Copy requirements
COPY ../../../requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy common modules
COPY ../../common /app/common

# Copy service code
COPY . /app/vision-service

WORKDIR /app/vision-service

# Expose port
EXPOSE 8002

# Run the service
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
