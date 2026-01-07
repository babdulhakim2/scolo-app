# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# The .env file will be mounted at runtime via Secret Manager
# Set environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app:$PYTHONPATH

# Expose port
EXPOSE 8080

# Run with Python module
CMD exec python -m gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 src.api.main:app