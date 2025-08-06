# --- STAGE 1: Builder ---
# This stage installs all dependencies and then cleans them up.
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies needed for building some python packages
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Copy only the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# --- !! NEW, AGGRESSIVE CLEANUP STEP !! ---
# This is the crucial step to reduce the size of the installed packages.
# It removes compiled python files, cache directories, and test folders from the installed packages.
RUN find /opt/venv -follow -type f -name '*.pyc' -delete && \
    find /opt/venv -follow -type d -name '__pycache__' -delete && \
    find /opt/venv -follow -type d -name 'tests' -delete && \
    find /opt/venv -follow -type d -name 'test' -delete && \
    rm -rf /root/.cache/pip


# --- STAGE 2: Final Runtime Image ---
# This stage creates the final, small image.
FROM python:3.11-slim

WORKDIR /app

# Copy the cleaned-up virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy the application code
COPY . .

# Set the path to use the Python interpreter from our virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
