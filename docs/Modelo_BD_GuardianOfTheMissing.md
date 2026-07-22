# Diccionario de datos — GuardianOfTheMising (versión demo)

**Elaborado por:** José Arturo Garcia Gonzalez (`230629`) — Diseño y Estructura de BD
**Arquitectura:** híbrida — MySQL + MongoDB
**Alcance:** versión recortada para simulación/demo (1.5 semanas de desarrollo)

---

## 1. Resumen de la arquitectura

| Motor | Contiene | Por qué |
|---|---|---|
| **MySQL** | `Roles`, `Usuarios`, `ContactosEmergencia`, `Alertas`, `Evidencias` | Datos con relaciones fuertes entre sí, necesitan integridad referencial real (FK) |
| **MongoDB** | `geocercas`, `ubicaciones` | Escritura de alta frecuencia (GPS) e indexado geoespacial nativo (`2dsphere`) |

Entidades recortadas del alcance original (no aportan a la demo, se agregan después sin romper nada): `Dispositivos`, `Notificaciones`, `HistorialEventos`.

---

## 2. Diccionario de datos — MySQL

### 2.1 `Roles`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_rol | INT | PK, AI | |
| nombre_rol | VARCHAR(30) | UNIQUE, NOT NULL | 'Administrador', 'Usuario', 'Mantenimiento' |

> El rol *Administrador* es el que usa el **administrador gubernamental** para consultar datos sensibles.

### 2.2 `Usuarios`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_usuario | INT | PK, AI | |
| nombre | VARCHAR(50) | NOT NULL | |
| apellido_paterno | VARCHAR(50) | NOT NULL | |
| apellido_materno | VARCHAR(50) | NULL | |
| correo | VARCHAR(100) | UNIQUE, NOT NULL | Usado para login |
| contrasena_hash | VARCHAR(255) | NOT NULL | Hash bcrypt, nunca texto plano |
| telefono | VARCHAR(20) | NULL | |
| fecha_nacimiento | DATE | NULL | |
| **tipo_sangre** | **ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-')** | **NULL** | **Campo nuevo — lo pide también el front. `NULL` si el usuario no lo especifica** |
| id_rol | INT | FK → Roles | |
| activo | TINYINT(1) | DEFAULT 1 | Baja lógica |
| fecha_registro | DATETIME | DEFAULT NOW | |

### 2.3 `ContactosEmergencia`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_contacto | INT | PK, AI | |
| id_usuario | INT | FK → Usuarios | |
| nombre | VARCHAR(100) | NOT NULL | |
| telefono | VARCHAR(20) | NOT NULL | |
| correo | VARCHAR(100) | NULL | |
| parentesco | VARCHAR(50) | NULL | 'Madre', 'Amigo', etc. |
| prioridad | INT | DEFAULT 1 | Orden en que se notifica |
| fecha_registro | DATETIME | DEFAULT NOW | |

### 2.4 `Alertas`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_alerta | INT | PK, AI | |
| id_usuario | INT | FK → Usuarios | |
| id_geocerca_mongo | CHAR(24) | NULL | ObjectId de Mongo. `NULL` = botón de pánico manual; con valor = disparada por geocerca. Sin FK real |
| latitud | DECIMAL(10,7) | NOT NULL | |
| longitud | DECIMAL(10,7) | NOT NULL | |
| fecha_hora | DATETIME | DEFAULT NOW | |
| estado | ENUM('activa','atendida','cancelada','falsa_alarma') | DEFAULT 'activa' | |
| comentario | VARCHAR(255) | NULL | |

> Ya no hay catálogo de tipos de alerta: todo es una sola **"Alerta de peligro"** genérica.

### 2.5 `Evidencias`
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id_evidencia | INT | PK, AI | |
| id_alerta | INT | FK → Alertas | |
| tipo_evidencia | ENUM('foto','audio') | NOT NULL | |
| url_archivo | VARCHAR(255) | NOT NULL | Ruta a almacenamiento externo, no el archivo en sí |
| latitud | DECIMAL(10,7) | NULL | |
| longitud | DECIMAL(10,7) | NULL | |
| fecha_hora | DATETIME | DEFAULT NOW | |

---

## 3. Diccionario de datos — MongoDB

### 3.1 `geocercas`
| Campo | Tipo (BSON) | Descripción |
|---|---|---|
| _id | ObjectId | |
| id_usuario | int | Referencia lógica a `Usuarios.id_usuario`. Sin FK real |
| nombre | string | 'Casa', 'Escuela', etc. |
| tipo_zona | string enum | 'segura' \| 'riesgo' |
| ubicacion | GeoJSON Point | `{ type:"Point", coordinates:[longitud, latitud] }` ⚠️ orden invertido vs. MySQL |
| radio_metros | double | Geocerca circular |
| activa | bool | |
| fecha_creacion | date | |

### 3.2 `ubicaciones`
| Campo | Tipo (BSON) | Descripción |
|---|---|---|
| _id | ObjectId | |
| id_usuario | int | Referencia lógica a `Usuarios.id_usuario` |
| ubicacion | GeoJSON Point | `{ type:"Point", coordinates:[longitud, latitud] }` |
| precision_metros | double \| null | |
| fecha_hora | date | |

Ver `setup_mongo.js` para el script de creación con validación e índices `2dsphere`.

---

## 4. Normalización aplicada (tablas MySQL)

**1FN:** todos los campos son atómicos. Los contactos de emergencia no van como texto separado por comas dentro de `Usuarios`; cada uno es una fila en `ContactosEmergencia`.

**2FN:** no hay dependencias parciales — todas las tablas usan llave primaria simple (surrogate key), nunca compuesta.

**3FN:** el rol del usuario vive en `Roles` (catálogo), no como texto libre repetido en cada usuario. El nombre/teléfono del contacto no se repite en otras tablas, se referencia por `id_contacto`.

---

## 5. Relaciones

**FK reales (MySQL):**
- `Roles (1) —— (N) Usuarios`
- `Usuarios (1) —— (N) ContactosEmergencia`
- `Usuarios (1) —— (N) Alertas`
- `Alertas (1) —— (N) Evidencias`

**Referencias lógicas (sin FK real, MySQL ↔ MongoDB, se validan en backend):**
- `Usuarios —— geocercas` vía `id_usuario`
- `Usuarios —— ubicaciones` vía `id_usuario`
- `geocercas —— Alertas` vía `id_geocerca_mongo` (opcional, puede ser NULL)

---

## 6. Pendiente / fuera del alcance de la demo

- `Dispositivos`, `Notificaciones`, `HistorialEventos` — se cortaron para el demo, no aparecen en ninguna pantalla del front. Se agregan después si el proyecto crece más allá de la simulación.
- Sesiones JWT (stateless vs. persistidas) — sin definir aún.
- Política de retención de `ubicaciones` en Mongo (crece rápido, valorar TTL index).
- Validación manual de integridad MySQL ↔ Mongo (borrado en cascada, existencia de `id_usuario`) — responsabilidad del backend, no de la BD.
