import os
from datetime import datetime, timezone
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = "guardian_of_the_missing"

# Cliente e instancia de base de datos
client = AsyncIOMotorClient(MONGO_URI)
db_mongo = client[DB_NAME]

async def registrar_ubicacion_gps(id_usuario: int, lat: float, lon: float, precision: Optional[float] = None) -> str:
    """Guarda un punto GPS en el historial de Mongo (GeoJSON: [longitud, latitud])."""
    doc = {
        "id_usuario": id_usuario,
        "ubicacion": {
            "type": "Point",
            "coordinates": [lon, lat]  # ¡OJO! Longitud va primero
        },
        "precision_metros": precision,
        "fecha_hora": datetime.now(timezone.utc)
    }
    result = await db_mongo.ubicaciones.insert_one(doc)
    return str(result.inserted_id)

async def buscar_geocerca_cercana(id_usuario: int, lat: float, lon: float) -> Optional[str]:
    """
    Busca si las coordenadas están dentro del radio de una geocerca activa.
    Retorna el ID en string de la geocerca o None.
    """
    pipeline = [
        {
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [lon, lat]  # ¡OJO! Longitud va primero
                },
                "distanceField": "distancia_calculada",
                "spherical": True,
                "query": {
                    "id_usuario": id_usuario,
                    "activa": True
                }
            }
        },
        {
            "$match": {
                "$expr": {"$lte": ["$distancia_calculada", "$radio_metros"]}
            }
        },
        {"$limit": 1}
    ]

    cursor = db_mongo.geocercas.aggregate(pipeline)
    geocercas = await cursor.to_list(length=1)

    if geocercas:
        return str(geocercas[0]["_id"])
    return None