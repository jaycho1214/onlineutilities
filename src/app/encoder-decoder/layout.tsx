import { Metadata } from "next";
import { EncoderDecoderProvider } from "@/features/encoder-decoder/lib/encoder-decoder-context";
import { EncoderDecoderLayoutContent } from "@/features/encoder-decoder/components/encoder-decoder-layout-content";
import { GradientBackground } from "@/features/shared/ui/gradient-background";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Encoder/Decoder",
    description: "Encode and decode text with Base64, URL, HTML entities, Hex, ASCII, Binary, Unicode, and more formats",
    openGraph: {
      title: "Encoder/Decoder | OnlineUtilities",
      description: "Powerful encoder/decoder tool supporting Base64, URL encoding, HTML entities, hexadecimal, ASCII, binary, Unicode escape sequences, Punycode, Base58, ROT13, Morse code, and web-specific formats. Features auto-detection, history, and instant conversion.",
      type: "website",
    },
  };
}

interface EncoderDecoderLayoutProps {
  children: React.ReactNode;
}

export default function EncoderDecoderLayout({ children }: EncoderDecoderLayoutProps) {
  return (
    <EncoderDecoderProvider>
      <GradientBackground enhanced={true} />
      <EncoderDecoderLayoutContent>{children}</EncoderDecoderLayoutContent>
    </EncoderDecoderProvider>
  );
}