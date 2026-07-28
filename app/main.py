from fastapi import FastAPI
from pydantic import BaseModel

from app.config.mongo_config import (
    connect_to_mongo,
    close_mongo_connection,
    ensure_indexes,
)
from app.modules.sesni.routes.ubicacion_routes import router as ubicacion_router

app = FastAPI(
    title="GuardianOfTheMising API",
    version="0.1.0",
    description="API base para el proyecto GuardianOfTheMising",
)


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/")
def read_root() -> dict:
    return {"message": "Bienvenido a GuardianOfTheMising API"}


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", message="API funcionando correctamente")


@app.on_event("startup")
async def startup():
    connect_to_mongo()
    await ensure_indexes()


@app.on_event("shutdown")
async def shutdown():
    close_mongo_connection()


app.include_router(ubicacion_router)