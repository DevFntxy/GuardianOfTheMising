#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR  
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base

class Rol(Base):
    __tablename__="roles"
    id_rol = Column(Integer, primary_key=True, nullable=False)
    nombre_rol =Column(String(30),nullable=False)

    usuarios = relationship("Usuario", back_populates='rol')