# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

WORKDIR /frontend
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements first
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY app.py .

# Copy built frontend from stage 1
COPY --from=frontend-build /frontend/build ./build

# No CSV folder needed — Google Sheets will store data

# Expose port
EXPOSE 5000

# Command to run app
CMD ["python", "app.py"]
