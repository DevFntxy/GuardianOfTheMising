import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# 1. Cliente asíncrono para conectarse a Mongo
client = AsyncIOMotorClient(MONGO_URL)

# 2. Seleccionamos la base de datos específica de tu proyecto
database = client[MONGO_DB_NAME]

# Nota para después: Así es como llamarás a tus colecciones (el equivalente a tablas)
# usuarios_collection = database.get_collection("usuarios")