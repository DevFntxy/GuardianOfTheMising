# models/__init__.py

from services.mysql.mysql import Base
from models.alerta import Alerta
from models.usuario import Usuario
from models.dispositivo import Dispositivo
from models.evidencia import Evidencia
from models.rol import Rol
from models.contacto_emergencia import Contacto_Emergencia