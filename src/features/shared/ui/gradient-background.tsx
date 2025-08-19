import Image from "next/image";

interface GradientBackgroundProps {
  opacity?: number;
  enhanced?: boolean;
}

export function GradientBackground({
  opacity = 0.58,
  enhanced = false,
}: GradientBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Image
        src="/gradient-backgrounds/image.png"
        alt=""
        fill
        priority
        quality={50}
        sizes="100vw"
        className="object-cover [filter:blur(60px)_brightness(1.1)] dark:[filter:blur(60px)_brightness(0.55)]"
        style={{
          transform: "scale(1.08)",
          opacity,
        }}
      />
      
      {/* Enhanced hard overlay for light mode - strong white background */}
      {enhanced && (
        <div
          className="fixed inset-0 pointer-events-none dark:hidden bg-white/50"
        />
      )}
      
      {/* Standard overlay for light mode when not enhanced */}
      {!enhanced && (
        <div
          className="fixed inset-0 pointer-events-none dark:hidden"
          style={{
            background: "linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 20%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0) 60%)",
          }}
        />
      )}
      
      {/* Enhanced hard overlay for dark mode - strong black background */}
      {enhanced && (
        <div
          className="fixed inset-0 pointer-events-none hidden dark:block bg-black/60"
        />
      )}
      
      {/* Standard overlay for dark mode when not enhanced */}
      {!enhanced && (
        <div
          className="fixed inset-0 pointer-events-none hidden dark:block"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.50) 36%, rgba(0,0,0,0.24) 60%, rgba(0,0,0,0) 80%)",
          }}
        />
      )}
      
      {/* Subtle top highlight overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.10) 22%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.02) 68%, rgba(255,255,255,0.00) 85%)",
        }}
      />
    </div>
  );
}
