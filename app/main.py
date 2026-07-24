from fastapi import FastAPI
from pydantic import BaseModel

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