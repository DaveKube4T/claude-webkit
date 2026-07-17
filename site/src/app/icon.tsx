import { ImageResponse } from "next/og"
import fs from "fs"
import path from "path"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  // Leer el PNG del icono y embebirlo en base64
  const iconPath = path.join(process.cwd(), "public", "icon-mark.png")
  const iconData = fs.readFileSync(iconPath)
  const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          background: "#0B1220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconBase64}
          alt=""
          style={{ width: 48, height: 48, objectFit: "contain" }}
        />
      </div>
    ),
    { ...size }
  )
}
