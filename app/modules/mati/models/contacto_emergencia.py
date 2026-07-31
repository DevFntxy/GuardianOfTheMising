#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR  
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base

class Contacto_Emergencia(Base):
    __tablename__="contactoemergencia"
    id_contacto= Column(Integer, primary_key=True, nullable=False)
    id_usuario= Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    nombre= Column(String(100), nullable=False)
    telefono= Column(String(20), nullable=False)
    correo= Column(String(100), nullable=False)
    parentesco = Column(String(50), nullable=False)
    prioridad= Column(Integer, nullable=True, server_default="1")
    fecha_registro= Column(DateTime, nullable=True, server_default=func.now())

    usuario = relationship("Usuario", back_populates='contactos_emergencia')
