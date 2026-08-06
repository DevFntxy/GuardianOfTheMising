#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR  
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base

class Evidencia(Base):
    __tablename__ = "evidencias"

    id_evidencia = Column(Integer, primary_key=True, autoincrement=True)
    id_alerta = Column(Integer, ForeignKey("alertas.id_alerta"), nullable=False)
    tipo_evidencia = Column(Enum('foto', 'video', 'audio', name='tipo_evidencia_enum'), nullable=False)
    url_archivo = Column(String(255), nullable=False)
    latitud = Column(DECIMAL(10, 7), nullable=True)
    longitud = Column(DECIMAL(10, 7), nullable=True)
    fecha_hora = Column(DateTime, server_default=func.now())

    # Relación (Cada evidencia pertenece a 1 alerta)
    alerta = relationship("Alerta", back_populates="evidencias")