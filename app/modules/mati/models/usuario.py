#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR  
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, nullable=False)
    nombre = Column(String(50),nullable=False)
    apellido_paterno= Column(String(50),nullable=False)
    apellido_materno=Column(String(50),nullable=False)
    correo=Column(String(100),nullable=False)
    contrasena_hash = Column(String(255),nullable=False)
    telefono= Column(String(20),nullable=False)
    fecha_nacimiento=Column(DateTime, nullable=False)
    tipo_sangre=Column(Enum('A+','A-','B+','B-','AB+','AB-','O+','O-'), name='sangre_tipo',nullable=False)
    id_rol = Column(Integer, ForeignKey("roles.id_rol"), server_default="1")
    activo= Column(String(2), server_default="1")
    fecha_registro= Column(DateTime, server_default=func.now())

    alertas = relationship("Alerta", back_populates='usuario')
    rol= relationship("Rol", back_populates='usuarios')
    contactos_emergencia= relationship("Contacto_Emergencia", back_populates='usuario')
    dispositivos = relationship("Dispositivo", back_populates="usuario")