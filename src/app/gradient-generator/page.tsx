import dynamic from "next/dynamic";

const GradientGenerator = dynamic(
  () =>
    import("@/features/gradient-generator/components/gradient-generator").then(
      (mod) => mod.GradientGenerator,
    ),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-muted-foreground">
          Loading gradient generator...
        </div>
      </div>
    ),
  },
);

export default function GradientGeneratorPage() {
  return <GradientGenerator />;
}

export const metadata = {
  title: "Gradient Generator - Online Utilities",
  description: "Generate beautiful, ChatGPT-inspired CSS gradients",
};
