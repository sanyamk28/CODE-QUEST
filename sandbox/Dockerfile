FROM python:3.10-slim

# Install system dependencies for code execution (compilers and runtimes)
RUN apt-get update && apt-get install -y --no-install-recommends \
    g++ \
    openjdk-17-jdk-headless \
    nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a restricted user for running untrusted code
RUN useradd -m -s /bin/bash sandbox_user

# Copy application files
COPY main.py .

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
