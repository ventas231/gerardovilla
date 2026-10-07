import { z } from "zod";

import { SHEETS_WEBAPP_URL } from "./sheets-config";

const applicationSchema = z
  .object({
    nombre: z.string().trim().min(1, "Escribe tu nombre").max(120),
    marca: z.string().trim().min(1, "Escribe tu marca").max(120),
    vende_amazon: z.string().trim().min(1, "Indica si vendes en Amazon").max(20),
    productos_activos: z.string().trim().max(40),
    corre_ppc: z.string().trim().max(20),
    campanas_ppc: z.string().trim().max(60),
    inversion_mensual: z.string().trim().max(60),
    marketplaces: z.string().trim().max(200),
    tiene_claude: z.string().trim().max(40),
    tiene_helium10: z.string().trim().max(40),
    correo: z.string().trim().email("Correo no válido").max(255),
    telefono: z.string().trim().min(6, "Escribe tu teléfono").max(40),
    comparte_resena: z.string().trim().max(40),
  })
  .superRefine((data, ctx) => {
    if (data.vende_amazon === "No") return;

    const obligatorias: Array<[keyof typeof data, string]> = [
      ["productos_activos", "Productos activos"],
      ["corre_ppc", "Campañas de publicidad"],
      ["marketplaces", "Tiendas de Amazon"],
      ["tiene_claude", "Claude"],
      ["tiene_helium10", "Helium 10"],
      ["comparte_resena", "Reseña"],
    ];

    for (const [key, label] of obligatorias) {
      if (!data[key].trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${label} es obligatorio`,
        });
      }
    }

    if (data.corre_ppc === "Sí") {
      if (!data.campanas_ppc.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["campanas_ppc"],
          message: "El número de campañas es obligatorio",
        });
      }
      if (!data.inversion_mensual.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["inversion_mensual"],
          message: "El gasto mensual es obligatorio",
        });
      }
    }
  });

export type ApplicationInput = z.infer<typeof applicationSchema>;

// Envía la aplicación a Google Apps Script (apps-script/Codigo.gs), que la guarda
// en Google Sheets y avisa por correo. Se llama desde el navegador: el sitio es estático.
export async function submitApplication({ data }: { data: unknown }) {
  const parsed = applicationSchema.parse(data);
  if (!SHEETS_WEBAPP_URL) throw new Error("SHEETS_WEBAPP_URL no configurada");
  // text/plain evita la petición previa de CORS que Apps Script no responde.
  const res = await fetch(SHEETS_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "aplicacion", ...parsed }),
  });
  const result = (await res.json()) as { ok: boolean; error?: string };
  if (!result.ok) throw new Error(result.error || "No se pudo guardar");
  return { ok: true };
}
