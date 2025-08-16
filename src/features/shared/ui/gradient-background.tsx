import Image from "next/image";

// SSR-friendly static background component. Always uses image.png.
// Theme-specific overlays handled via CSS variables (light/dark) without client hooks.
export function GradientBackground({ opacity = 0.58 }: { opacity?: number }) {
  // We can't read theme on server; rely on prefers-color-scheme via CSS media.
  return (
    <div
      id="cgpt-ambient-bg"
      className="fixed inset-0 -z-10 pointer-events-none"
    >
      <Image
        src="/gradient-backgrounds/image.png"
        alt="Background"
        fill
        priority
        quality={50}
        sizes="100vw"
        className="fixed inset-0 -z-10 pointer-events-none object-cover [filter:blur(60px)_brightness(1.1)] dark:[filter:blur(60px)_brightness(0.55)]"
        style={{
          transform: "scale(1.08)",
          opacity,
          willChange: "transform, filter",
          zIndex: 0,
        }}
      />
      <div
        className="overlay fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `linear-gradient(to top, var(--bg-gradient-stops))`,
        }}
      />
      <div
        className="haze absolute inset-0 pointer-events-none"
        style={{
          zIndex: 2,
          background: `linear-gradient(
            to bottom,
            rgba(255,255,255,0.16) 0%,
            rgba(255,255,255,0.10) 22%,
            rgba(255,255,255,0.06) 45%,
            rgba(255,255,255,0.02) 68%,
            rgba(255,255,255,0.00) 85%
          )`,
        }}
      />
      <style
        // Inline CSS variables for gradients (light/dark support via media query)
        dangerouslySetInnerHTML={{
          __html: `
            #cgpt-ambient-bg { --bg-gradient-stops: rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 20%, rgba(0,0,0,0) 40%; }
            @media (prefers-color-scheme: dark) {
              #cgpt-ambient-bg { --bg-gradient-stops: rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.50) 36%, rgba(0,0,0,0.24) 60%, rgba(0,0,0,0) 80%; }
            }
          `,
        }}
      />
    </div>
  );
}
