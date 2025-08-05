import sys
import os
from fastapi.testclient import TestClient

# Add the project's root directory (backend/) to the Python path
# This allows the test script to find the 'main' module in the parent directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app # Import the FastAPI app instance from your main.py file

# Create a TestClient instance
client = TestClient(app)

def test_health_check():
    """
    Tests the root endpoint to ensure the server is running and responsive.
    """
    # Make a GET request to the root URL "/"
    response = client.get("/")
    
    # Assert that the HTTP status code is 200 (OK)
    assert response.status_code == 200
    
    # Assert that the JSON response body is what we expect
    assert response.json() == {"status": "ok"}
