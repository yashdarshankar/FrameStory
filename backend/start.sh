#!/bin/bash
# Provide necessary setup for persistent storage
mkdir -p /var/data/uploads
mkdir -p /var/data/static

# Symlink uploads and static to the persistent disk so they are not ephemeral
rm -rf ./uploads ./static
ln -s /var/data/uploads ./uploads
ln -s /var/data/static ./static

# Start Celery worker in the background
celery -A celery_worker.celery_app worker --loglevel=info &

# Start FastAPI web server in the foreground
uvicorn main:app --host 0.0.0.0 --port $PORT
