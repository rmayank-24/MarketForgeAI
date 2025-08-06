# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# We add --no-cache-dir to keep the image size small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container
COPY . .

# Command to run the application when the container launches
# Uvicorn will run on port 8000, and 0.0.0.0 makes it accessible
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]