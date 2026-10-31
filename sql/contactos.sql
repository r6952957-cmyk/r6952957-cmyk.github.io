-- Ejecutar una sola vez en el SQL Editor de Neon.
CREATE TABLE IF NOT EXISTS contactos_web (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  equipo VARCHAR(100) NOT NULL,
  problema TEXT NOT NULL DEFAULT '',
  sector VARCHAR(200) NOT NULL DEFAULT '',
  ip INET NOT NULL,
  user_agent VARCHAR(500) NOT NULL DEFAULT '',
  origen VARCHAR(300) NOT NULL DEFAULT '',
  consentimiento BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contactos_web_ip_creado_idx
  ON contactos_web (ip, creado_en DESC);
