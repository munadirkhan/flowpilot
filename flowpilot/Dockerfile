# FlowPilot — single-container build: React frontend + FastAPI backend.
# Stage 1 builds the frontend, stage 2 serves it from the API (one public URL).

# --- Stage 1: build the frontend ---
FROM node:20-alpine AS frontend
WORKDIR /fe
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Empty base => the SPA calls the API on its own origin (e.g. /leads).
ENV VITE_API_BASE=""
RUN npm run build

# --- Stage 2: backend + bundled static frontend ---
FROM python:3.12-slim AS app
WORKDIR /app/backend
ENV PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt
COPY backend/ ./
COPY --from=frontend /fe/dist ./static
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
