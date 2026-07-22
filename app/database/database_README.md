# app/database

Arquitectura híbrida: dos motores, cada quien con su carpeta.

- **mysql/** — `schema_mysql.sql`. Roles, Usuarios, ContactosEmergencia, Alertas, Evidencias.
  Datos con relaciones fuertes (FK real).
- **mongo/** — `setup_mongo.js`. Colecciones `geocercas` y `ubicaciones`.
  Escritura de alta frecuencia + índice geoespacial `2dsphere`. Sin FK real hacia MySQL
  (la referencia es lógica vía `id_usuario` / `id_geocerca_mongo`, se valida en el backend).

Diccionario de datos completo (campos, tipos, normalización): rama `documentation`, carpeta `docs/`.


