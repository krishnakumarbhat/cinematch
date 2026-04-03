FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/
COPY 00_main.py .

# Build frontend (optional: uncomment if Node is available)
# COPY frontend/ frontend/
# RUN apt-get update && apt-get install -y nodejs npm \
#     && cd frontend && npm ci && npm run build

EXPOSE 5002

CMD ["python", "00_main.py"]
