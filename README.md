# Catálogo de productos con favoritos y acceso por roles

API REST construida con **Node.js**, **Express** y **PostgreSQL** que gestiona un catálogo de productos y los favoritos personales de cada usuario. Usa **JWT** para la autenticación y **roles** (`usuario` y `admin`) para la autorización.

## Integrante

| Nombre | Rol en el proyecto |
|---|---|
| German Riera Rebolledo | Desarrollo completo: base de datos, API, autenticación, pruebas y documentación |

> Trabajo realizado de forma individual.

## Propósito

- Cualquier persona puede consultar el catálogo y filtrarlo por categoría.
- Solo el administrador puede crear, actualizar y eliminar productos.
- Cada usuario autenticado gestiona su propia lista de favoritos y no puede ver ni modificar la de otros.

## Elección de base de datos: PostgreSQL

Se eligió PostgreSQL con el paquete `pg` porque los datos son **relacionales** (usuarios ↔ favoritos ↔ productos) y la base de datos puede garantizar las reglas por sí misma:

- `UNIQUE` en el correo evita usuarios duplicados.
- La **clave primaria compuesta** `(usuario_id, producto_id)` impide favoritos duplicados.
- `CHECK (precio > 0)` y `CHECK (rol IN (...))` refuerzan la validación del servidor.
- Las **claves foráneas** con `ON DELETE CASCADE` mantienen la consistencia al eliminar un producto.
- Las consultas parametrizadas (`$1, $2...`) protegen contra inyección SQL.

## Requisitos

- Node.js 18 o superior (probado con Node 22)
- PostgreSQL 14 o superior
- Postman (para ejecutar la colección manualmente) — opcional, las pruebas también corren con `npm test`

## Estructura del proyecto

```
catalogo-api/
├── database/
│   ├── schema.sql          # Tablas, restricciones y relaciones
│   └── seed.sql            # 6 productos de ejemplo (datos ficticios)
├── postman/
│   ├── Catalogo_API.postman_collection.json
│   └── Catalogo_API.postman_environment.json   # Entorno de ejemplo sin secretos
├── scripts/
│   ├── init-db.js          # Crea tablas y carga productos
│   ├── crear-admin.js      # Crea el administrador desde .env
│   ├── token-vencido.js    # Genera un JWT vencido para la prueba de 401
│   └── run-tests.js        # Ejecuta la colección con Newman
├── src/
│   ├── config/             # Variables de entorno y conexión a PostgreSQL
│   ├── controllers/        # Lógica de cada endpoint
│   ├── middlewares/        # verificarToken, permitirRoles, manejo de errores
│   ├── models/             # Acceso a datos (consultas SQL)
│   ├── routes/             # Definición de rutas
│   ├── utils/              # Validaciones y clase HttpError
│   ├── app.js              # Configuración de Express
│   └── server.js           # Punto de entrada
├── .env.example
└── package.json
```

Flujo de una petición: **Postman → ruta → middleware (token/rol) → controlador (validación) → modelo (SQL) → PostgreSQL → respuesta JSON**.

## Modelo de datos

| Tabla | Campos | Reglas |
|---|---|---|
| `usuarios` | id, nombre, correo, password_hash, rol, creado_en | correo único; rol `usuario` o `admin`; la contraseña se guarda con bcrypt |
| `productos` | id, nombre, descripcion, categoria, precio, creado_en, actualizado_en | precio > 0 |
| `favoritos` | usuario_id, producto_id, creado_en | PK compuesta (sin duplicados); FK con `ON DELETE CASCADE` |

**¿Qué pasa con los favoritos al eliminar un producto?** Se eliminan automáticamente gracias a `ON DELETE CASCADE`. Así ningún favorito apunta a un producto que ya no existe.

## Instalación

```bash
git clone https://github.com/<tu-usuario>/catalogo-api.git
cd catalogo-api
npm install
```

Crear la base de datos en PostgreSQL:

```bash
createdb -U postgres catalogo_db
# o desde psql:  CREATE DATABASE catalogo_db;
```

## Variables de entorno

Copiar `.env.example` como `.env` y completar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | *(la tuya)* |
| `DB_NAME` | Nombre de la base de datos | `catalogo_db` |
| `JWT_SECRET` | Secreto para firmar los tokens (largo y aleatorio) | *(no compartir)* |
| `JWT_EXPIRES_IN` | Vencimiento del token | `1h` |
| `ADMIN_NOMBRE` | Nombre del administrador | `Administrador` |
| `ADMIN_CORREO` | Correo del administrador | `admin@catalogo.test` |
| `ADMIN_PASSWORD` | Contraseña del administrador (mín. 6) | *(no compartir)* |

Para generar un secreto aleatorio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Inicialización de datos y del administrador

```bash
npm run db:init        # crea las tablas y carga 6 productos de ejemplo
npm run admin:crear    # crea el administrador con los datos de ADMIN_* del .env
```

- `npm run db:reset` borra todas las tablas y las vuelve a crear (útil para empezar de cero).
- El rol `admin` **solo** se obtiene con `npm run admin:crear`. El registro público siempre crea usuarios con rol `usuario`, aunque el cliente envíe `"rol": "admin"`.

## Comandos de ejecución

| Comando | Acción |
|---|---|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia el servidor con recarga automática (nodemon) |
| `npm test` | Ejecuta la colección de Postman con Newman (servidor encendido) |
| `npm run test:persistencia` | Ejecuta solo las pruebas de persistencia (después de reiniciar) |
| `npm run token:vencido` | Imprime un JWT vencido para pegarlo en Postman |

La API queda disponible en `http://localhost:3000/api`.

## Rutas de la API

Todas las rutas usan el prefijo `/api`. Las rutas protegidas requieren el encabezado:
`Authorization: Bearer <token>`

| Método y ruta | Acceso | Cuerpo | Respuesta exitosa |
|---|---|---|---|
| `POST /auth/registro` | Público | `{ "nombre", "correo", "password" }` | 201 + usuario (sin contraseña) |
| `POST /auth/login` | Público | `{ "correo", "password" }` | 200 + `token`, `expiraEn`, usuario |
| `GET /productos` | Público | — (opcional `?categoria=Hogar`) | 200 + lista |
| `GET /productos/:id` | Público | — | 200 + producto |
| `POST /productos` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | 201 + producto |
| `PUT /productos/:id` | Admin | `{ "nombre", "descripcion", "categoria", "precio" }` | 200 + producto |
| `DELETE /productos/:id` | Admin | — | 204 sin cuerpo |
| `GET /favoritos` | Autenticado | — | 200 + favoritos del usuario |
| `POST /favoritos` | Autenticado | `{ "productoId": 3 }` | 201 + favorito |
| `DELETE /favoritos/:productoId` | Autenticado | — | 204 sin cuerpo |

### Formato de respuestas

Éxito:

```json
{ "ok": true, "mensaje": "Producto creado", "data": { "id": 7, "nombre": "Mouse Gamer M5", "precio": 29.99 } }
```

Error:

```json
{ "ok": false, "mensaje": "Datos inválidos", "errores": ["El precio debe ser un número mayor que cero"] }
```

### Ejemplos de cuerpos

Registro:

```json
{ "nombre": "Ana Pérez", "correo": "ana@correo.test", "password": "ClaveSegura123" }
```

Crear o actualizar producto (`PUT` reemplaza todos los campos, por eso los exige todos):

```json
{ "nombre": "Mouse Gamer M5", "descripcion": "Mouse óptico de 16000 DPI", "categoria": "Electrónica", "precio": 29.99 }
```

### Códigos de estado y criterio

| Código | Cuándo |
|---|---|
| 200 | Consultas y actualizaciones exitosas |
| 201 | Creación (registro, producto, favorito) |
| 204 | Eliminación exitosa |
| 400 | Datos inválidos: campos vacíos, correo mal formado, precio ≤ 0, id no numérico, JSON mal formado |
| 401 | Sin token, token inválido/alterado, token vencido o credenciales incorrectas |
| 403 | Usuario autenticado sin el rol necesario (usuario intentando modificar el catálogo) |
| 404 | Producto inexistente, ruta inexistente o favorito que no pertenece al usuario |
| 409 | Correo ya registrado o favorito duplicado |
| 500 | Error inesperado (sin detalles internos en la respuesta) |

**Criterio 400 vs 422:** se usa **400** para todos los errores de validación de datos de entrada, porque en todos los casos la petición no cumple el formato o las reglas que el servidor exige. No se usa 422 para mantener un único código fácil de probar y documentar.

**Favoritos ajenos:** si el usuario B intenta quitar un favorito de A, recibe **404**, porque para B ese favorito no existe. Así no se revela información de otros usuarios.

## Seguridad aplicada

- Contraseñas con **bcrypt** (10 rondas); nunca se devuelven ni la contraseña ni su hash.
- JWT firmado con `HS256`; `jwt.verify` comprueba **firma y expiración** antes de dar acceso.
- La identidad del usuario se toma **solo del token verificado**, nunca del body o la URL.
- Todas las consultas de favoritos filtran por `usuario_id` del token.
- Consultas parametrizadas en todos los accesos a la base de datos.
- Mensaje genérico en el login (no se indica si falló el correo o la contraseña).
- Secretos en `.env` (excluido del repositorio con `.gitignore`).

## Pruebas

La colección `postman/Catalogo_API.postman_collection.json` tiene **50 peticiones con 102 aserciones**, organizadas en carpetas:

1. Autenticación (registro, duplicado 409, datos inválidos, intento de rol admin, login correcto e incorrecto)
2. Catálogo público (listar, filtrar por categoría, consultar, inexistente 404, id inválido 400)
3. Seguridad (sin token 401, token vencido 401, token alterado 401, rol usuario 403)
4. Validaciones (precio 0 o negativo, campos vacíos, JSON mal formado)
5. CRUD de productos como administrador
6. Favoritos (crear, duplicado 409, inexistente 404, listar)
7. Aislamiento entre usuarios A y B
8. Consistencia al eliminar un producto (cascada)
9. Persistencia (después de reiniciar el servidor)

### Opción 1: desde la terminal (Newman)

```bash
npm start                    # en una terminal
npm test                     # en otra terminal: carpetas 01 a 09
# detener el servidor (Ctrl + C) y volver a iniciarlo
npm start
npm run test:persistencia    # comprueba que los datos siguen ahí
```

`npm test` toma las credenciales del administrador del `.env` y genera solo el token vencido.

### Opción 2: desde Postman

1. Importar la colección y el entorno de la carpeta `postman/`.
2. Seleccionar el entorno **Catálogo API - Local**.
3. En el entorno, completar el *Current value* de `adminPassword` (el de tu `.env`).
4. Ejecutar `npm run token:vencido` y pegar el resultado en `tokenVencido`.
5. Abrir el **Runner** y ejecutar las carpetas 01 a 08 en orden.
6. Reiniciar el servidor y ejecutar la carpeta 09.

Cada ejecución crea usuarios nuevos con correos únicos, así que la colección se puede ejecutar varias veces sin reiniciar la base de datos.

## Herramientas y recursos de apoyo

- Documentación oficial de [Express](https://expressjs.com/), [node-postgres](https://node-postgres.com/), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) y [bcryptjs](https://github.com/dcodeIO/bcrypt.js).
- [Newman](https://github.com/postmanlabs/newman) para ejecutar la colección de Postman desde la terminal.
- Se usó un asistente de IA (Claude) como apoyo para estructurar el proyecto y revisar el código; todo el código fue revisado, probado y explicado por el autor.
