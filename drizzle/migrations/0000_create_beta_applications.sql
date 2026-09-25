CREATE TABLE public.beta_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nombre TEXT NOT NULL,
  marca TEXT,
  vende_amazon TEXT NOT NULL,
  productos_activos TEXT,
  corre_ppc TEXT,
  campanas_ppc TEXT,
  inversion_mensual TEXT,
  marketplaces TEXT,
  tiene_claude TEXT,
  tiene_helium10 TEXT,
  correo TEXT NOT NULL,
  telefono TEXT NOT NULL,
  comparte_resena TEXT
);

GRANT INSERT ON public.beta_applications TO anon;
GRANT INSERT, SELECT ON public.beta_applications TO authenticated;
GRANT ALL ON public.beta_applications TO service_role;

ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
ON public.beta_applications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
