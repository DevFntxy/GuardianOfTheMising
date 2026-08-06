#Estas son libreria que sirven para poder escribir directamente codigo SQL para 
#construir la base de datos
from sqlalchemy import Column, Integer, String, DECIMAL, DateTime, Enum, ForeignKey, CHAR  
#Esta es para mandar a traer un funcion que existe en MySQL
from sqlalchemy.sql import func
#Para declarar Llaves foraneas de otras tablas pero decir que esto son datos que
#
from sqlalchemy.orm import relationship
from services.mysql.mysql import Base


class Alerta(Base):
    __tablename__ = "alertas"

    id_alerta = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    id_dispositivo = Column(Integer, ForeignKey("dispositivos.id_dispositivo"), nullable=False)
    id_geocerca_mongo = Column(CHAR(24), nullable=True, server_default="Geo-01")
    latitud = Column(DECIMAL(10, 7), nullable=False)
    longitud = Column(DECIMAL(10, 7), nullable=False)
    fecha_hora = Column(DateTime, server_default=func.now())
    #  CORREGIDO: Quitar name='riesgoalerta' para que use el nombre real de la tabla ('riesgo')
    riesgo = Column(Enum('alto', 'medio', 'bajo'), server_default='alto')
    # Este está BIEN porque en tu BD la columna sí se llama 'estado_alerta'
    estado = Column(Enum('activa', 'atendida', 'cancelada', 'falsa_alarma'), name='estado_alerta', server_default='activa')
    comentario = Column(String(255))
    intentos_fallidos = Column(Integer, default=0)
    ultimo_intento_fallido = Column(DateTime(timezone=True), nullable=True)
    

    usuario = relationship("Usuario", back_populates="alertas")
    dispositivo = relationship("Dispositivo", back_populates="alertas")
    evidencias = relationship("Evidencia", back_populates="alerta")