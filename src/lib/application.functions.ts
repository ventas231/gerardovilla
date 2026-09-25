import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const applicationSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  marca: z.string().trim().max(120).optional().default(""),
  vende_amazon: z.string().trim().max(20),
  productos_activos: z.string().trim().max(40).optional().default(""),
  corre_ppc: z.string().trim().max(20).optional().default(""),
  campanas_ppc: z.string().trim().max(60).optional().default(""),
  inversion_mensual: z.string().trim().max(60).optional().default(""),
  marketplaces: z.string().trim().max(200).optional().default(""),
  tiene_claude: z.string().trim().max(40).optional().default(""),
  tiene_helium10: z.string().trim().max(40).optional().default(""),
  correo: z.string().trim().email().max(255),
  telefono: z.string().trim().min(6).max(40),
  comparte_resena: z.string().trim().max(40).optional().default(""),
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
