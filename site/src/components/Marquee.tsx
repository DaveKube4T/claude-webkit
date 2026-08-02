const items = [
  "Automatización con IA",
  "Chatbots inteligentes",
  "Landing pages de conversión",
  "CRM y embudos",
  "Marketing automatizado",
  "Dashboards y reportes",
]

export default function Marquee() {
  const doubled = [...items, ...items]
  return (
    <div aria-hidden="true" className="border-y border-[#334155]/50 bg-[#0F1A2B]/70 backdrop-blur-sm overflow-hidden">
      <div className="marquee-track flex gap-12 py-5 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-medium text-[#94A3B8]">
            <span className="grad-text font-bold">●</span> {item}
          </span>
        ))}
      </div>
    </div>
  )
}
