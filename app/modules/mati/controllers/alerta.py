from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.alerta import Alerta
from schemas.alerta import AlertaCreate, AlertaUpdate

# CREAR
async def crear_alerta(db: AsyncSession, alerta_data: AlertaCreate) -> Alerta:
    nueva_alerta = Alerta(**alerta_data.model_dump())
    db.add(nueva_alerta)
    await db.commit()
    await db.refresh(nueva_alerta)
    return nueva_alerta

# OBTENER TODAS (Con paginación opcional)
async def obtener_alertas(db: AsyncSession, skip: int = 0, limit: int = 100) -> list[Alerta]:
    result = await db.execute(select(Alerta).offset(skip).limit(limit))
    return result.scalars().all()

# OBTENER UNA POR ID
async def obtener_alerta_por_id(db: AsyncSession, id_alerta: int) -> Alerta | None:
    result = await db.execute(select(Alerta).filter(Alerta.id_alerta == id_alerta))
    return result.scalar_one_or_none()

# ACTUALIZAR
async def actualizar_alerta(db: AsyncSession, id_alerta: int, alerta_data: AlertaUpdate) -> Alerta | None:
    alerta = await obtener_alerta_por_id(db, id_alerta)
    if not alerta:
        return None
    
    # exclude_unset=True evita sobrescribir con None los campos que el usuario no mandó
    datos_actualizar = alerta_data.model_dump(exclude_unset=True)
    for clave, valor in datos_actualizar.items():
        setattr(alerta, clave, valor)
        
    await db.commit()
    await db.refresh(alerta)
    return alerta

# ELIMINAR
async def eliminar_alerta(db: AsyncSession, id_alerta: int) -> bool:
    alerta = await obtener_alerta_por_id(db, id_alerta)
    if not alerta:
        return False
        
    await db.delete(alerta)
    await db.commit()
    return True