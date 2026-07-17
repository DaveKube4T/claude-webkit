import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  // Recorte propio para favicon: icon-mark-v2.jpeg con su encuadre completo
  // se ve como un punto diminuto a 16px (tamaño real de pestaña). Este PNG
  // recorta más cerca de las flechas para que siga siendo legible ahí.
  const iconPath = path.join(process.cwd(), "public", "icon-mark-v2-favicon.png")
  const iconData = fs.readFileSync(iconPath)
  const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconBase64}
          alt=""
          style={{ width: 64, height: 64, objectFit: "cover" }}
        />
      </div>
    ),
    { ...size }
  )
}
