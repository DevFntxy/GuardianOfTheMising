import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv() 

MYSQL_URL = os.getenv("MYSQL_URL")

# 1. El motor de conexión a MySQL
engine = create_async_engine(MYSQL_URL, echo=False)

# 2. Creador de sesiones (la "charla" con la base de datos)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

# 3. Clase base de la que heredarán tus futuras tablas Esto significa que con esto sqlalchemy utilizara 
Base = declarative_base()

# 4. Esta función se la pasaremos a FastAPI para que abra y cierre conexiones de forma segura
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()