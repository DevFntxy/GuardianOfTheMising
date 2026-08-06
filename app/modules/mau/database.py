from sqlmodel import create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()
# TODO: Reemplaza esto con tu cadena de conexión real (MySQL, PostgreSQL, etc.)
# Ejemplo para pruebas locales con SQLite:
URL_BASE_DATOS = os.getenv("DATABASE_URL")

# El parámetro echo=True te permite ver las consultas SQL en la consola (útil en desarrollo)
motor = create_engine(URL_BASE_DATOS, echo=True)

def obtener_sesion():
    """
    Dependencia de FastAPI para inyectar la sesión de la base de datos 
    en cada petición y cerrarla automáticamente al terminar.
    """
    with Session(motor) as sesion:
        yield sesion
