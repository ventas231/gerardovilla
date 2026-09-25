import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { submitApplication } from "@/lib/application.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Acceso beta por invitación | Herramientas de IA para sellers de Amazon" },
      {
        name: "description",
        content:
          "Un grupo cerrado de sellers de Amazon probará antes que nadie herramientas de IA para PPC, listings e inventario. Aplica al grupo beta.",
      },
      {
        property: "og:title",
        content: "Acceso beta por invitación | Herramientas de IA para sellers de Amazon",
      },
      {
        property: "og:description",
        content:
          "Cupo limitado: acceso completo y gratuito durante la fase de prueba a herramientas de IA para PPC, listings e inventario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PRODUCTOS = ["1-3", "4-10", "11-25", "+25"];
const MARKETPLACES = ["Amazon US", "Amazon MX", "Amazon CA", "Amazon EU", "Otro"];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0c.7 6.9 3.2 9.5 12 12-8.8 2.5-11.3 5.1-12 12-.7-6.9-3.2-9.5-12-12C8.8 9.5 11.3 6.9 12 0Z" />
    </svg>
  );
}

function AmazonMark({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex flex-col items-center leading-none " + className}>
      <span className="font-sans font-extrabold tracking-[-0.035em]">amazon</span>
      <svg viewBox="0 0 100 11" className="mt-[0.1em] w-[105%]" fill="none" aria-hidden="true">
        <path
          d="M3 3.4C24 9.6 76 9.6 92 3.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path d="M85 0.4l13 1.8-8.4 7.2z" fill="currentColor" />
      </svg>
    </span>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

function Choice({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active
                ? "border-gold bg-gold/15 text-gold-light"
                : "border-border bg-surface-raised text-muted-foreground hover:border-gold/50"
            }`}
            data-name={name}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

const emptyForm = {
  nombre: "",
  marca: "",
  vende_amazon: "",
  productos_activos: "",
  corre_ppc: "",
  campanas_ppc: "",
  inversion_mensual: "",
  marketplaces: [] as string[],
  tiene_claude: "",
  tiene_helium10: "",
  correo: "",
  telefono: "",
  comparte_resena: "",
};

function Landing() {
  const send = useServerFn(submitApplication);
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleMarket = (m: string) =>
    setForm((f) => ({
      ...f,
      marketplaces: f.marketplaces.includes(m)
        ? f.marketplaces.filter((x) => x !== m)
        : [...f.marketplaces, m],
    }));

  const noVende = form.vende_amazon === "No";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (noVende) return;
    if (!form.nombre.trim() || !form.correo.trim() || !form.telefono.trim()) {
      toast.error("Completa nombre, correo y teléfono.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      toast.error("Revisa tu correo electrónico.");
      return;
    }
    if (!form.vende_amazon) {
      toast.error("Indícanos si vendes en Amazon.");
      return;
    }
    setSending(true);
    try {
      await send({
        data: {
          ...form,
          marketplaces: form.marketplaces.join(", "),
        },
      });
      setDone(true);
      toast.success("Aplicación enviada. Revisaremos tu caso.");
    } catch {
      toast.error("No se pudo enviar. Intenta de nuevo en un momento.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(70%_100%_at_50%_0%,color-mix(in_oklab,var(--gold)_20%,transparent),transparent)]" />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-10">
        {/* Encabezado */}
        <header className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
            <Sparkle className="h-3.5 w-3.5 shrink-0 text-gold" />
            <span className="eyebrow rounded-full border border-gold/35 bg-surface/40 px-4 py-2">
              Acceso solo por invitación
            </span>
            <span className="hidden h-4 w-px bg-gold/25 sm:block" />
            <AmazonMark className="shrink-0 text-[0.95rem] font-extrabold text-foreground/90 sm:text-[1.15rem]" />
          </div>

          <h1 className="mx-auto mt-8 max-w-6xl text-[clamp(1.95rem,8.3vw,5.4rem)] leading-[0.92] uppercase">
            Un grupo cerrado de sellers va a probar esto
            <span className="block text-gold-light">antes que nadie</span>
          </h1>

          <div className="gold-rule mx-auto mt-9 w-40 opacity-50" />

          <p className="mx-auto mt-8 max-w-3xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-base">
            <span className="font-semibold text-gold">Gerardo Villa</span> vende en Amazon desde
            2019 y acumula más de $4.6M USD en ventas. Está preparando un lanzamiento no público de
            herramientas de inteligencia artificial para PPC, listings e inventario, y abre un cupo
            reducido para probarlas primero.
          </p>
          <a href="#aplicar" className="btn-gold mt-10">
            Aplicar al grupo beta →
          </a>
        </header>

        <div className="gold-rule my-16 opacity-40" />

        {/* Quién construye esto */}
        <section>
          <Eyebrow>Quién construye esto</Eyebrow>
          <h2 className="mt-3 text-2xl sm:text-3xl">Un seller, no una agencia</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="panel p-7 text-center">
              <p className="font-display text-4xl text-gold-light">2019</p>
              <p className="mt-2 text-sm text-muted-foreground">Vendiendo en Amazon desde</p>
            </div>
            <div className="panel p-7 text-center">
              <p className="font-display text-4xl text-gold-light">$4.6M+ USD</p>
              <p className="mt-2 text-sm text-muted-foreground">En ventas acumuladas</p>
            </div>
          </div>
        </section>

        {/* Qué incluye */}
        <section className="mt-16">
          <Eyebrow>Qué incluye el acceso</Eyebrow>
          <h2 className="mt-3 text-2xl sm:text-3xl">Las herramientas que vas a probar</h2>
          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            {[
              {
                t: "Optimización de PPC con IA",
                d: "Análisis de campañas, pujas y términos de búsqueda con recomendaciones accionables.",
              },
              {
                t: "Generación y auditoría de listings",
                d: "Títulos, bullets y backend keywords creados y revisados con IA.",
              },
              {
                t: "Seguimiento de inventario con IA",
                d: "Alertas de quiebre de stock y proyecciones de reorden.",
              },
              {
                t: "Acceso completo gratis durante la prueba",
                d: "Sin costo mientras dure la fase beta cerrada.",
              },
            ].map((item, i) => (
              <div
                key={item.t}
                className={"panel flex gap-5 p-6" + (i === 3 ? " lg:col-span-2" : "")}
              >
                <span className="font-mono text-sm text-gold/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold">{item.t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Para calificar */}
        <section className="mt-16">
          <Eyebrow>Para calificar</Eyebrow>
          <h2 className="mt-3 text-2xl sm:text-3xl">Requisitos del grupo</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="panel p-7">
              <p className="eyebrow">Requisito</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Vender hoy en Amazon con cuenta activa",
                  "Tener Claude ya en uso",
                  "Tener Helium 10 activo",
                ].map((r) => (
                  <li key={r} className="flex gap-3">
                    <span className="text-gold">◆</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel p-7">
              <p className="eyebrow">Ayuda a tu caso</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {["Varios productos activos", "PPC corriendo"].map((r) => (
                  <li key={r} className="flex gap-3">
                    <span className="text-gold/60">◇</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section id="aplicar" className="mt-16 scroll-mt-8">
          <div className="panel mx-auto max-w-6xl p-6 sm:p-10">
            <Eyebrow>Aplicación</Eyebrow>
            <h2 className="mt-3 text-2xl sm:text-3xl">Cuéntanos de tu operación</h2>

            {done ? (
              <div className="mt-8 text-center">
                <p className="font-display text-2xl text-gold-light">Aplicación recibida</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Revisaremos tu caso y te contactaremos si entras al grupo de prueba.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nombre">
                    <input
                      className="field-input"
                      maxLength={120}
                      value={form.nombre}
                      onChange={(e) => set("nombre", e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </Field>
                  <Field label="Marca">
                    <input
                      className="field-input"
                      maxLength={120}
                      value={form.marca}
                      onChange={(e) => set("marca", e.target.value)}
                      placeholder="Nombre de tu marca"
                    />
                  </Field>
                </div>

                <Field label="¿Vendes en Amazon?">
                  <Choice
                    name="vende_amazon"
                    options={["Sí", "No"]}
                    value={form.vende_amazon}
                    onChange={(v) => set("vende_amazon", v)}
                  />
                </Field>

                {noVende ? (
                  <div className="panel-raised border-gold/30 p-6 text-sm leading-relaxed text-muted-foreground">
                    Este grupo de prueba es exclusivamente para sellers con una cuenta de Amazon
                    activa. Gracias por tu interés.
                  </div>
                ) : (
                  <>
                    <Field label="Productos activos">
                      <Choice
                        name="productos_activos"
                        options={PRODUCTOS}
                        value={form.productos_activos}
                        onChange={(v) => set("productos_activos", v)}
                      />
                    </Field>

                    <Field label="¿Corres PPC?">
                      <Choice
                        name="corre_ppc"
                        options={["Sí", "No"]}
                        value={form.corre_ppc}
                        onChange={(v) => set("corre_ppc", v)}
                      />
                    </Field>

                    {form.corre_ppc === "Sí" && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="¿Cuántas campañas?">
                          <input
                            className="field-input"
                            maxLength={60}
                            value={form.campanas_ppc}
                            onChange={(e) => set("campanas_ppc", e.target.value)}
                            placeholder="Ej. 12"
                          />
                        </Field>
                        <Field label="¿Cuánto inviertes al mes?">
                          <input
                            className="field-input"
                            maxLength={60}
                            value={form.inversion_mensual}
                            onChange={(e) => set("inversion_mensual", e.target.value)}
                            placeholder="Ej. $3,000 USD"
                          />
                        </Field>
                      </div>
                    )}

                    <Field label="Marketplace(s)" hint="Puedes elegir varios">
                      <div className="flex flex-wrap gap-2">
                        {MARKETPLACES.map((m) => {
                          const active = form.marketplaces.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              aria-pressed={active}
                              onClick={() => toggleMarket(m)}
                              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                                active
                                  ? "border-gold bg-gold/15 text-gold-light"
                                  : "border-border bg-surface-raised text-muted-foreground hover:border-gold/50"
                              }`}
                            >
                              {m}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="¿Tienes Claude y ya lo usas?">
                      <Choice
                        name="tiene_claude"
                        options={["Sí, lo uso", "Lo tengo, no lo uso", "No, pero lo contrataría", "No tengo y no estoy dispuesto a contratarlo"]}
                        value={form.tiene_claude}
                        onChange={(v) => set("tiene_claude", v)}
                      />
                    </Field>

                    <Field label="¿Helium 10 activo?">
                      <Choice
                        name="tiene_helium10"
                        options={["Sí", "No, pero lo contrataría", "No tengo y no estoy dispuesto a contratarlo"]}
                        value={form.tiene_helium10}
                        onChange={(v) => set("tiene_helium10", v)}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Correo">
                        <input
                          type="email"
                          className="field-input"
                          maxLength={255}
                          value={form.correo}
                          onChange={(e) => set("correo", e.target.value)}
                          placeholder="tucorreo@dominio.com"
                          required
                        />
                      </Field>
                      <Field label="Teléfono / WhatsApp">
                        <input
                          className="field-input"
                          maxLength={40}
                          value={form.telefono}
                          onChange={(e) => set("telefono", e.target.value)}
                          placeholder="+52 ..."
                          required
                        />
                      </Field>
                    </div>

                    <Field label="¿Compartirías una reseña si te funciona?">
                      <Choice
                        name="comparte_resena"
                        options={["Sí", "Tal vez", "No"]}
                        value={form.comparte_resena}
                        onChange={(v) => set("comparte_resena", v)}
                      />
                    </Field>

                    <button type="submit" className="btn-gold w-full" disabled={sending}>
                      {sending ? "Enviando..." : "Enviar aplicación"}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </section>

        <footer className="mt-16 space-y-2 text-center text-xs leading-relaxed text-muted-foreground/70">
          <p>El cupo es real y limitado: esta es una fase de prueba, no un lanzamiento abierto.</p>
          <p>Programa cerrado. Esto no es una oferta del curso.</p>
        </footer>
      </div>
    </main>
  );
}
