export default function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="hero-video-poster-fallback absolute inset-0" />
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover"
        src="/hero-loop.mp4"
        poster="/hero-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="hero-video-glow absolute inset-0" />
      <div className="hero-video-overlay absolute inset-0" />
    </div>
  )
}
