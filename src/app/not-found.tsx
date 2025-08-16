import { GradientBackground } from "@/features/shared/ui/gradient-background";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto p-6 pt-20">
      <GradientBackground />
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold font-[family-name:var(--font-eb-garamond)] text-foreground/80">
            404
          </h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved to another location.
          </p>
        </div>
      </div>
    </div>
  );
}
