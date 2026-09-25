import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

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

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => applicationSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const id = crypto.randomUUID();
    const { error } = await supabase.from("beta_applications").insert({ ...data, id });
    if (error) throw new Error(error.message);

    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("new-application", "cursos@summaproducts.com", {
        templateData: data,
        idempotencyKey: `new-application-${id}`,
      });
    } catch (err) {
      console.error("Email notification failed", err);
    }


    return { ok: true };
  });
