import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from '@react-email/components'
import type { TemplateEntry } from './registry'

type Props = Record<string, string | undefined>

const FIELDS: [string, string][] = [
  ['nombre', 'Nombre'],
  ['marca', 'Marca'],
  ['vende_amazon', '¿Vende en Amazon?'],
  ['productos_activos', 'Productos activos'],
  ['corre_ppc', '¿Corre PPC?'],
  ['campanas_ppc', 'Campañas PPC'],
  ['inversion_mensual', 'Inversión mensual'],
  ['marketplaces', 'Marketplaces'],
  ['tiene_claude', 'Claude'],
  ['tiene_helium10', 'Helium 10'],
  ['correo', 'Correo'],
  ['telefono', 'Teléfono / WhatsApp'],
  ['comparte_resena', '¿Compartiría reseña?'],
]

const Email = (props: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Nueva aplicación beta de {props['nombre'] || 'un seller'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>GRUPO BETA · NUEVA APLICACIÓN</Text>
        <Heading style={h1}>{props['nombre'] || 'Nueva aplicación'}</Heading>
        <Hr style={hr} />
        {FIELDS.map(([key, label]) => (
          <Section key={key} style={row}>
            <Text style={labelStyle}>{label}</Text>
            <Text style={value}>{props[key] || '—'}</Text>
          </Section>
        ))}
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) =>
    `Nueva aplicación beta — ${d['nombre'] || 'Seller'}${d['marca'] ? ` (${d['marca']})` : ''}`,
  displayName: 'Nueva aplicación beta',
  to: 'cursos@summaproducts.com',
  previewData: {
    nombre: 'Ana López', marca: 'Casa Verde', vende_amazon: 'Sí', productos_activos: '4-10',
    corre_ppc: 'Sí', campanas_ppc: '12', inversion_mensual: '$3,000 USD', marketplaces: 'Amazon US, Amazon MX',
    tiene_claude: 'Sí, lo uso', tiene_helium10: 'Sí', correo: 'ana@ejemplo.com', telefono: '+52 55 1234 5678',
    comparte_resena: 'Sí',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '28px 24px', maxWidth: '560px' }
const eyebrow = { fontSize: '11px', letterSpacing: '2px', color: '#a8842f', margin: 0 }
const h1 = { fontSize: '24px', color: '#141319', margin: '8px 0 0' }
const hr = { borderColor: '#e4cd93', margin: '20px 0' }
const row = { borderBottom: '1px solid #eee', padding: '4px 0' }
const labelStyle = { fontSize: '12px', color: '#777', margin: '4px 0 0' }
const value = { fontSize: '15px', color: '#141319', fontWeight: 'bold' as const, margin: '2px 0 6px' }
