-- Esquema de la base de datos del catálogo
-- Motor: PostgreSQL

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                CHECK (rol IN ('usuario', 'admin')),
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id             SERIAL PRIMARY KEY,
  nombre         VARCHAR(120)  NOT NULL,
  descripcion    TEXT          NOT NULL,
  categoria      VARCHAR(60)   NOT NULL,
  precio         NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  creado_en      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Un favorito relaciona un usuario con un producto.
-- La clave primaria compuesta impide duplicados.
-- ON DELETE CASCADE: si se elimina un producto (o un usuario),
-- sus favoritos se eliminan automáticamente y los datos quedan consistentes.
CREATE TABLE IF NOT EXISTS favoritos (
  usuario_id  INTEGER     NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
  producto_id INTEGER     NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (usuario_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (LOWER(categoria));
