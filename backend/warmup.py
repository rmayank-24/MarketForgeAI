# backend/warmup.py
# This script is used during the Docker build process to pre-download the embedding model.
# This ensures the model is included in the final image and doesn't need to be downloaded
# when the application starts, preventing timeouts.

from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

print("--- Starting model warmup ---")
# This line will download and cache the model
embedding_model = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
print("--- Model warmup complete ---")

