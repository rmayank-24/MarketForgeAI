# --- STAGE 1: Builder ---
# This stage installs all dependencies into a virtual environment.
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies that might be needed for compiling some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends build-essential

# Copy only the requirements file first to leverage Docker layer caching
COPY requirements.txt .

# Create a virtual environment and install dependencies into it
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
# --no-cache-dir helps keep the layer size smaller
RUN pip install --no-cache-dir -r requirements.txt


# --- STAGE 2: Final Runtime Image ---
# This stage creates the final, small image by copying only what's needed.
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment with all the installed packages from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Copy the application code
COPY . .

# Set the path to use the Python interpreter from our virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
