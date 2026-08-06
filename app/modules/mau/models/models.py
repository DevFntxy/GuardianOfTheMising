from datetime import date, datetime, timezone
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship
from pydantic import EmailStr, field_validator, BaseModel
from decimal import Decimal  # Necesario para latitud y longitud
from enum import Enum        # Necesario para EstadoAlerta y TipoEvidencia

# --- ENUMS ---
class EstadoAlerta(str, Enum):
    ACTIVA = "ACTIVA"
    RESUELTA = "RESUELTA"
    FALSA_ALARMA = "FALSA_ALARMA"

class TipoEvidencia(str, Enum):
    AUDIO = "AUDIO"
    IMAGEN = "IMAGEN"
    VIDEO = "VIDEO"

# --- TABLA: roles ---
class Rol(SQLModel, table=True):
    __tablename__ = "roles"

    id_rol: Optional[int] = Field(default=None, primary_key=True)
    nombre_rol: str = Field(max_length=50, nullable=False)

    # Relación inversa: Un rol puede pertenecer a múltiples usuarios
    usuarios: List["Usuario"] = Relationship(back_populates="rol")


# --- TABLA: usuarios ---
class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id_usuario: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, nullable=False)
    apellido_paterno: str = Field(max_length=50, nullable=False)
    apellido_materno: Optional[str] = Field(default=None, max_length=50)
    correo: str = Field(max_length=100, index=True, unique=True, nullable=False)
    contrasena_hash: str = Field(max_length=255, nullable=False)
    telefono: Optional[str] = Field(default=None, max_length=20)
    fecha_nacimiento: date
    
    # Mantenemos el campo que agregamos previamente
    tipo_sangre: Optional[str] = Field(default=None, max_length=5) 
    
    # Clave Foránea a roles
    id_rol: int = Field(default=1, foreign_key="roles.id_rol", nullable=False)
    activo: bool = Field(default=True, nullable=False)
    fecha_registro: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relaciones
    rol: Optional[Rol] = Relationship(back_populates="usuarios")
    contactos: List["ContactoEmergencia"] = Relationship(back_populates="usuario")
    # Relaciones adicionales para el Módulo de Operaciones/Analítica
    dispositivos: List["Dispositivo"] = Relationship(back_populates="usuario")
    alertas: List["Alerta"] = Relationship(back_populates="usuario")


# --- TABLA: contactosemergencia ---
class ContactoEmergencia(SQLModel, table=True):
    __tablename__ = "contactosemergencia"

    id_contacto: Optional[int] = Field(default=None, primary_key=True)
    
    # Clave Foránea a usuarios
    id_usuario: int = Field(foreign_key="usuarios.id_usuario", nullable=False)
    
    nombre: str = Field(max_length=100, nullable=False)
    telefono: str = Field(max_length=20, nullable=False)
    correo: Optional[str] = Field(default=None, max_length=100)
    parentesco: str = Field(max_length=50, nullable=False)
    prioridad: int = Field(nullable=False)
    fecha_registro: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    # Relación inversa al usuario
    usuario: Optional[Usuario] = Relationship(back_populates="contactos")

class TokenBloqueado(SQLModel, table=True):
    __tablename__ = "tokens_bloqueados"

    id_token: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(max_length=500, unique=True, index=True, nullable=False)
    fecha_bloqueo: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

class Dispositivo(SQLModel, table=True):
    __tablename__ = "dispositivos"
    
    id_dispositivo: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuarios.id_usuario")
    # Se eliminó tipo_dispositivo: la tabla asume por defecto que es el Smartwatch
    token_fcm: Optional[str] = Field(default=None, max_length=255)
    modelo: Optional[str] = Field(default=None, max_length=100)
    id_dispositivo_vinculado: Optional[int] = None
    activo: bool = Field(default=True)
    fecha_registro: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ultima_conexion: Optional[datetime] = None

    usuario: Optional[Usuario] = Relationship(back_populates="dispositivos")

class Alerta(SQLModel, table=True):
    __tablename__ = "alertas"
    
    id_alerta: Optional[int] = Field(default=None, primary_key=True)
    id_usuario: int = Field(foreign_key="usuarios.id_usuario")
    id_dispositivo: Optional[int] = Field(foreign_key="dispositivos.id_dispositivo", default=None)
    id_geocerca_mongo: Optional[str] = Field(default=None, max_length=24) 
    latitud: Decimal = Field(max_digits=10, decimal_places=7)
    longitud: Decimal = Field(max_digits=10, decimal_places=7)
    fecha_hora: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    estado: EstadoAlerta
    comentario: Optional[str] = Field(default=None, max_length=255)

    usuario: Optional[Usuario] = Relationship(back_populates="alertas")
    evidencias: List["Evidencia"] = Relationship(back_populates="alerta")

class Evidencia(SQLModel, table=True):
    __tablename__ = "evidencias"
    
    id_evidencia: Optional[int] = Field(default=None, primary_key=True)
    id_alerta: int = Field(foreign_key="alertas.id_alerta")
    tipo_evidencia: TipoEvidencia
    id_archivo: str = Field(max_length=255) 
    latitud: Decimal = Field(max_digits=10, decimal_places=7)
    longitud: Decimal = Field(max_digits=10, decimal_places=7)
    fecha_hora: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    alerta: Optional[Alerta] = Relationship(back_populates="evidencias")
# ==========================================
# ESQUEMAS (DTOs) PARA FASTAPI
# ==========================================

class UsuarioCreate(SQLModel):
    """Esquema para recibir los datos de registro desde el Frontend"""
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    correo: EmailStr
    contrasena: str  # Se recibe en texto plano para hashearla en la lógica
    telefono: Optional[str] = None
    fecha_nacimiento: date
    tipo_sangre: Optional[str] = None

    @field_validator('correo')
    @classmethod
    def sanitizar_correo(cls, v: str) -> str:
        # Convierte a minúsculas y quita espacios al inicio o final
        return v.lower().strip()

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    correo: Optional[EmailStr] = None
    contrasena: Optional[str] = None
    telefono: Optional[str] = None
    tipo_sangre: Optional[str] = None

class UsuarioResponse(SQLModel):
    """Esquema para devolver datos al Frontend de forma segura (sin el hash)"""
    id_usuario: int
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    correo: str
    telefono: Optional[str] = None
    fecha_nacimiento: date
    tipo_sangre: Optional[str] = None
    id_rol: int
    activo: bool
    fecha_registro: datetime

class LoginRequest(SQLModel):
    """Esquema para recibir los credenciales desde el Frontend"""
    correo: EmailStr
    contrasena: str

class TokenResponse(SQLModel):
    """Esquema para devolver el JWT al Frontend"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class ContactoEmergenciaCreate(SQLModel):
    """Esquema para recibir los datos de un nuevo contacto desde el Frontend"""
    nombre: str
    telefono: str
    correo: Optional[EmailStr] = None
    parentesco: str
    prioridad: int

class ContactoEmergenciaUpdate(BaseModel):
    """Esquema para actualización parcial (PATCH) del contacto"""
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    correo: Optional[EmailStr] = None
    parentesco: Optional[str] = None
    prioridad: Optional[int] = None

class ContactoEmergenciaResponse(SQLModel):
    """Esquema para devolver los datos del contacto al Frontend"""
    id_contacto: int
    id_usuario: int
    nombre: str
    telefono: str
    correo: Optional[str] = None
    parentesco: str
    prioridad: int
    fecha_registro: datetime