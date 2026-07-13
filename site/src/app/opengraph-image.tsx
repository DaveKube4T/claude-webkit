import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Optima Technology — Automatización con IA para pymes'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  // logo.png es 332x111 px (aspect 3:1)
  const logo = await readFile(join(process.cwd(), 'public/logo.png'))
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '80px',
          background: 'linear-gradient(135deg, #0B1220 0%, #152033 100%)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={332} height={111} alt="" />
        <div
          style={{
            marginTop: 56,
            fontSize: 68,
            fontWeight: 700,
            color: '#F1F5F9',
            lineHeight: 1.1,
            display: 'flex',
          }}
        >
          Automatiza hoy. Escala mañana.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 34,
            color: '#94A3B8',
            display: 'flex',
          }}
        >
          Automatización con IA para pymes
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 26,
            color: '#FF9800',
            display: 'flex',
          }}
        >
          www.optima-tech.co
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
