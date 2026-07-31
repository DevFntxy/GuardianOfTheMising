from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Literal

# Tipos definidos con Literal para validar los valores exactos del Enum de MySQL
RiesgoEnum = Literal['alto', 'medio', 'bajo']
EstadoEnum = Literal['activa', 'atendida', 'cancelada', 'falsa_alarma']

# 1. Base: Campos comunes
class AlertaBase(BaseModel):
    latitud: float
    longitud: float
    comentario: Optional[str] = None
    id_geocerca_mongo: Optional[str] = None
    riesgo: Optional[RiesgoEnum] = "alto"


# 2. Para CREAR (POST)
class AlertaCreate(AlertaBase):
    id_usuario: int
    id_dispositivo: int  # Obligatorio por el nullable=False de tu modelo
    estado: Optional[EstadoEnum] = "activa"


# 3. Para ACTUALIZAR (PUT / PATCH)
class AlertaUpdate(BaseModel):
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    riesgo: Optional[RiesgoEnum] = None
    estado: Optional[EstadoEnum] = None
    comentario: Optional[str] = None


# 4. Para RESPONDER al cliente (GET / Return)
class AlertaResponse(AlertaBase):
    id_alerta: int
    id_usuario: int
    id_dispositivo: int
    estado: EstadoEnum
    fecha_hora: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)