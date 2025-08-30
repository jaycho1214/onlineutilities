import Image from "next/image";
import { cn } from "@/lib/utils";

interface GitHubIconProps {
  className?: string;
}

export function GitHubIcon({ className }: GitHubIconProps) {
  return (
    <Image
      src="/icons/github.svg"
      alt="GitHub"
      width={20}
      height={20}
      className={cn("dark:invert", className)}
    />
  );
}
