import Image from "next/image";

interface GradientBackgroundProps {
  opacity?: number;
  enhanced?: boolean;
}

export function GradientBackground({ 
  opacity = 0.58, 
  enhanced = false 
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
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: enhanced
            ? "linear-gradient(to top, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 20%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0) 60%)"
            : "transparent",
        }}
      />
      {!enhanced && (
        <div
          className="dark:block hidden fixed inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 18%, rgba(0,0,0,0.50) 36%, rgba(0,0,0,0.24) 60%, rgba(0,0,0,0) 80%)",
          }}
        />
      )}
      {enhanced && (
        <div
          className="dark:block hidden fixed inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 18%, rgba(0,0,0,0.65) 36%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.08) 80%)",
          }}
        />
      )}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.10) 22%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.02) 68%, rgba(255,255,255,0.00) 85%)",
        }}
      />
    </div>
  );
}