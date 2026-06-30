# GuardianOfTheMising
Repositorio destinado a el seguimiento del proyecto GuardianOfMissing

---

# Gestión del Alcance del Proyecto

## Objetivo General

Desarrollar un ecosistema integral de seguridad personal multiplataforma (aplicación móvil, smartwatch y plataforma web) para gestionar la ubicación, prevenir incidentes mediante geocercas y coordinar respuestas inmediatas ante emergencias a través de alertas en tiempo real y la recolección de evidencia.


## Descripción del Proyecto

El proyecto consiste en el desarrollo de un ecosistema tecnológico orientado a la seguridad personal, integrado por una aplicación móvil para Android, una aplicación para smartwatch con Wear OS y una plataforma web de administración. El sistema permitirá monitorear la ubicación de los usuarios en tiempo real, administrar zonas seguras y de riesgo mediante geocercas, detectar situaciones de emergencia y generar alertas automáticas hacia contactos de confianza.

Además, la solución incorporará la captura de evidencia durante una emergencia, incluyendo fotografías, audio, ubicación GPS y la fecha y hora del incidente, permitiendo un mejor seguimiento y respuesta ante situaciones de riesgo.

La plataforma web facilitará la administración de usuarios, la visualización de incidentes en un mapa, el monitoreo de alertas y la consulta del historial de eventos registrados.


# Alcance del Proyecto

El proyecto comprende el análisis, diseño, desarrollo, implementación y pruebas de una plataforma de seguridad personal que incluya las siguientes funcionalidades:

- Desarrollo de una aplicación móvil para Android.
- Desarrollo de una aplicación para smartwatch con Wear OS.
- Desarrollo de una plataforma web administrativa.
- Registro e inicio de sesión de usuarios.
- Administración del perfil del usuario.
- Gestión de contactos de emergencia.
- Monitoreo de ubicación en tiempo real mediante GPS.
- Creación y administración de geocercas.
- Detección automática de entrada y salida de zonas seguras o restringidas.
- Botón de pánico para el envío inmediato de alertas.
- Envío de notificaciones en tiempo real.
- Compartición automática de ubicación durante una emergencia.
- Captura de evidencia (fotografía, audio, ubicación y fecha del incidente).
- Historial de alertas y eventos.
- Visualización de incidentes mediante mapas.
- Panel administrativo para la gestión de usuarios.
- Integración entre la aplicación móvil, smartwatch y plataforma web mediante una API REST.
- Almacenamiento seguro de la información.
- Pruebas funcionales, de integración y aceptación.


# Entregables

Al finalizar el proyecto se entregarán los siguientes productos:

1. Documento de análisis de requerimientos.
2. Documento de diseño del sistema.
3. Modelo y base de datos implementada.
4. API REST para la comunicación entre plataformas.
5. Aplicación móvil funcional.
6. Aplicación para smartwatch funcional.
7. Plataforma web administrativa.
8. Sistema de monitoreo mediante GPS.
9. Sistema de geocercas.
10. Sistema de alertas en tiempo real.
11. Sistema de captura y almacenamiento de evidencia.
12. Manual técnico.
13. Manual de usuario.
14. Casos de prueba y resultados.
15. Código fuente documentado.


# Exclusiones del Alcance

El presente proyecto **no contempla**:

- Integración directa con servicios oficiales de emergencia (911, policía o protección civil).
- Desarrollo para dispositivos iOS.
- Reconocimiento facial o autenticación biométrica avanzada.
- Inteligencia Artificial para predicción de incidentes.
- Integración con cámaras de videovigilancia públicas.
- Funcionamiento completamente offline para el envío de alertas.
- Publicación de la aplicación en Google Play Store o App Store.
- Infraestructura propia para alta disponibilidad o balanceo de carga.


# Restricciones

Durante el desarrollo deberán considerarse las siguientes restricciones:

- El sistema dependerá de una conexión a Internet para sincronizar información y enviar alertas.
- La precisión del monitoreo dependerá del GPS del dispositivo móvil.
- Las notificaciones estarán sujetas al funcionamiento de Firebase Cloud Messaging (FCM).
- El desarrollo estará enfocado únicamente en dispositivos Android y Wear OS.
- Se utilizarán herramientas de software libres o con licencia educativa.
- El proyecto deberá concluir dentro del tiempo establecido por la planificación académica.


# Supuestos

Se asume que:

- Los usuarios dispondrán de dispositivos Android compatibles.
- Los smartwatch utilizarán Wear OS.
- Los usuarios concederán permisos para acceder al GPS, cámara, micrófono y almacenamiento.
- Existirá acceso a Internet durante el uso normal del sistema.
- Los servicios de mapas y geolocalización estarán disponibles.
- El servidor permanecerá disponible para recibir y procesar las solicitudes del sistema.
