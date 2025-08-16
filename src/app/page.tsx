import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { WelcomeHeading } from "@/features/home/components/welcome-heading";
import { SearchInterface } from "@/features/search/components/search-interface";
import { utilities } from "@/constants";
import Link from "next/link";
import { GradientBackground } from "@/features/shared/ui/gradient-background";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-40 space-y-8">
      <GradientBackground />
      {/* Clean Introduction */}
      <div className="text-center space-y-8">
        <WelcomeHeading />
      </div>

      {/* Glassmorphism Search Input */}
      <SearchInterface />

      {/* Utility Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {utilities.map((utility) => {
          const IconComponent = utility.icon;
          return (
            <Link key={utility.id} href={utility.href} className="group">
              <GlassSurface className="aspect-square cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ease-out rounded-2xl">
                <div className="relative w-full h-full p-4 flex flex-col">
                  {/* Icon - Top Left */}
                  <div className="absolute top-4 left-4">
                    <div className="p-2 rounded-lg bg-foreground/5 backdrop-blur-sm">
                      <IconComponent className="w-5 h-5 text-foreground/70" />
                    </div>
                  </div>

                  {/* Text - Bottom Right */}
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="font-medium text-sm text-foreground/90 leading-tight">
                      {utility.name}
                    </h3>
                  </div>
                </div>
              </GlassSurface>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
