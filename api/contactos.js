import { neon } from "@neondatabase/serverless";
import { isIP } from "node:net";

const ALLOWED_ORIGINS = new Set([
  "https://r6952957-cmyk.github.io",
  "https://servihouse.vercel.app"
]);

function setCors(req, res) {
  const origin = req.headers.origin;
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (origin && !ALLOWED_ORIGINS.has(origin)) return false;
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  return true;
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export default async function handler(req, res) {
  if (!setCors(req, res)) {
    return res.status(403).json({ ok: false, error: "Origen no autorizado." });
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({
      ok: false,
      error: "La base de datos todavía no está configurada."
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

    // Campo trampa para bots: responde correctamente, pero no guarda nada.
    if (clean(body.website, 200)) {
      return res.status(200).json({ ok: true });
    }

    const nombre = clean(body.nombre, 100);
    const equipo = clean(body.equipo, 100);
    const problema = clean(body.problema, 2000);
    const sector = clean(body.sector, 200);
    const consentimiento = body.consentimiento === true;

    if (!nombre || !equipo || !consentimiento) {
      return res.status(400).json({
        ok: false,
        error: "Completa el nombre, el equipo y acepta el aviso de privacidad."
      });
    }

    // Vercel sobrescribe este encabezado con la IP pública del cliente.
    // No se acepta una IP enviada en el cuerpo del formulario.
    const ipHeader = req.headers["x-real-ip"];
    const ip = Array.isArray(ipHeader) ? ipHeader[0] : ipHeader;

    if (!ip || isIP(ip) === 0) {
      return res.status(503).json({
        ok: false,
        error: "No fue posible obtener la IP desde el servidor."
      });
    }

    const sql = neon(process.env.DATABASE_URL);
    const userAgent = clean(req.headers["user-agent"] || "", 500);
    const origin = clean(req.headers.origin || "", 300);

    // Máximo 5 registros por IP en una ventana de 10 minutos.
    const rows = await sql`
      INSERT INTO contactos_web
        (nombre, equipo, problema, sector, ip, user_agent, origen, consentimiento)
      SELECT
        ${nombre}, ${equipo}, ${problema}, ${sector},
        ${ip}::inet, ${userAgent}, ${origin}, ${consentimiento}
      WHERE (
        SELECT COUNT(*)
        FROM contactos_web
        WHERE ip = ${ip}::inet
          AND creado_en > NOW() - INTERVAL '10 minutes'
      ) < 5
      RETURNING id, creado_en
    `;

    if (!rows.length) {
      return res.status(429).json({
        ok: false,
        error: "Se alcanzó el límite temporal de solicitudes. Intenta nuevamente más tarde."
      });
    }

    return res.status(201).json({ ok: true, id: rows[0].id });
  } catch (error) {
    // No registrar datos personales ni credenciales en los logs.
    return res.status(500).json({
      ok: false,
      error: "No se pudo guardar la solicitud. Intenta nuevamente."
    });
  }
}
