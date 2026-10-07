/**
 * Recibe las aplicaciones de la encuesta (encuesta.gerardovilla.mx): guarda cada
 * respuesta en esta hoja de Google Sheets y avisa por correo a cursos@summaproducts.com.
 * Reemplaza a la base de datos y al correo del servidor anterior.
 *
 * Instalación (una vez):
 * 1. Crear una hoja de Google Sheets nueva ("Respuestas encuesta beta").
 * 2. En esa hoja: Extensiones → Apps Script → pegar este archivo → Guardar.
 * 3. Implementar → Nueva implementación → Aplicación web.
 *    Ejecutar como: Yo. Quién tiene acceso: Cualquier usuario.
 * 4. Copiar la URL que termina en /exec y ponerla en src/lib/sheets-config.ts.
 */
const AVISO_A = "cursos@summaproducts.com";
const CAMPOS = [
  ["nombre", "Nombre"],
  ["marca", "Marca"],
  ["vende_amazon", "¿Vende en Amazon?"],
  ["productos_activos", "Productos activos"],
  ["corre_ppc", "¿Maneja campañas de publicidad?"],
  ["campanas_ppc", "Campañas"],
  ["inversion_mensual", "Gasto mensual en publicidad"],
  ["marketplaces", "Tiendas de Amazon"],
  ["tiene_claude", "¿Tiene Claude?"],
  ["tiene_helium10", "¿Helium 10 activo?"],
  ["correo", "Correo"],
  ["telefono", "Teléfono / WhatsApp"],
  ["comparte_resena", "¿Compartiría una reseña?"],
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function doPost(e) {
  let result;
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const body = JSON.parse(e.postData.contents || "{}");
    result = body.action === "aplicacion" ? guardar(body) : { ok: false, error: "unknown_action" };
  } catch (err) {
    console.error(err);
    result = { ok: false, error: "request_failed" };
  } finally {
    lock.releaseLock();
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function guardar(body) {
  const d = {};
  CAMPOS.forEach(([k]) => (d[k] = String(body[k] || "").trim().slice(0, 255)));
  if (!d.nombre || !d.marca || !d.vende_amazon || !EMAIL_RE.test(d.correo) || d.telefono.length < 6) {
    return { ok: false, error: "invalid" };
  }
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Fecha"].concat(CAMPOS.map(([, label]) => label)));
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date()].concat(CAMPOS.map(([k]) => d[k])));

  try {
    const asunto = "Nueva aplicación beta — " + (d.nombre || "Seller") + (d.marca ? " (" + d.marca + ")" : "");
    const filas = CAMPOS.map(([k, label]) =>
      "<p style='margin:4px 0 0;font-size:12px;color:#777'>" + label + "</p>" +
      "<p style='margin:2px 0 8px;font-size:15px;font-weight:bold;color:#141319'>" + escapar(d[k] || "—") + "</p>"
    ).join("");
    MailApp.sendEmail({
      to: AVISO_A,
      subject: asunto,
      replyTo: d.correo,
      htmlBody: "<div style='font-family:Arial,sans-serif;max-width:560px'><p style='font-size:11px;letter-spacing:2px;color:#a8842f'>NUEVA APLICACIÓN</p>" +
        "<h1 style='font-size:22px;color:#141319'>" + escapar(d.nombre) + "</h1>" + filas + "</div>",
    });
  } catch (err) {
    console.error("Aviso por correo falló", err);
  }
  return { ok: true };
}

function escapar(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
