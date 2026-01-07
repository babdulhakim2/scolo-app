# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code directly to /app
COPY backend/ .

# Copy .env file (will be created by Cloud Build)
COPY .env .

# Set Python path
ENV PYTHONPATH=/app:$PYTHONPATH

# Set environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Expose port
EXPOSE 8080

# Run with gunicorn - correct module path
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 src.api.main:app