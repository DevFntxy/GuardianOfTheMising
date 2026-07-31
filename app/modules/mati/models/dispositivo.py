#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR, Boolean 
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base

class Dispositivo(Base):
    __tablename__ = "dispositivos"

    id_dispositivo = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    tipo_dispositivo = Column(Enum('movil', 'hardware', 'wearable', name='tipo_dispositivo_enum'), nullable=False)
    token_fcm = Column(String(255), nullable=True)
    modelo = Column(String(100), nullable=True)
    id_dispositivo_vinculado = Column(Integer, ForeignKey("dispositivos.id_dispositivo"), nullable=True)
    activo = Column(Boolean, nullable=False, server_default="1") # TINYINT(1) mapea a Boolean
    fecha_registro = Column(DateTime, server_default=func.now())
    ultima_conexion = Column(DateTime, nullable=True)

    # Relaciones
    usuario = relationship("Usuario", back_populates="dispositivos")
    alertas = relationship("Alerta", back_populates="dispositivo")
