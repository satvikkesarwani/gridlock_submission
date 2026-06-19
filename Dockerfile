# Stage 1: Build the React frontend
FROM node:18-alpine AS build-frontend

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Python backend and serve
FROM python:3.11-slim AS production

# Install system dependencies (libgomp1 is often needed for XGBoost/LightGBM)
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the built frontend from Stage 1 into the location main.py expects
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Railway injects the PORT environment variable
ENV PORT=8000

# Start the application using Uvicorn
CMD uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT:-8000}
