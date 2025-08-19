"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { GradientBackground } from "@/features/shared/ui/gradient-background";
import { Button } from "@/features/shared/ui/button";
import { Input } from "@/features/shared/ui/input";
import { Separator } from "@/features/shared/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Download,
  Upload,
  Palette,
  Link2,
  Mail,
  Phone,
  Wifi,
  MessageSquare,
  CreditCard,
  Image as ImageIcon,
  X,
  Type,
} from "lucide-react";
import { ColorPickerButton } from "@/features/qr-code/components/color-picker-button";
import {
  EmailInput,
  SmsInput,
  WifiInput,
  VCardInput,
} from "@/features/qr-code/components/qr-content-inputs";

type DotType =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";
type CornerSquareType = "square" | "extra-rounded" | "dot";
type CornerDotType = "dot" | "square";
type FileType = "png" | "svg" | "jpeg" | "webp";
type ContentType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard";

interface WifiData {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  title: string;
}

// Custom SVG Icons for QR patterns - memoized
const SquareIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="12" height="12" />
  </svg>
));
SquareIcon.displayName = "SquareIcon";

const DotsIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="5" />
  </svg>
));
DotsIcon.displayName = "DotsIcon";

const RoundedIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="12" height="12" rx="2" />
  </svg>
));
RoundedIcon.displayName = "RoundedIcon";

const ExtraRoundedIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="2" y="2" width="12" height="12" rx="4" />
  </svg>
));
ExtraRoundedIcon.displayName = "ExtraRoundedIcon";

const ClassyIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 2 L14 8 L8 14 L2 8 Z" />
  </svg>
));
ClassyIcon.displayName = "ClassyIcon";

const ClassyRoundedIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path
      d="M8 3 L13 8 L8 13 L3 8 Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
));
ClassyRoundedIcon.displayName = "ClassyRoundedIcon";

// Define type for QRCodeStyling instance
type QRCodeStylingInstance = {
  append: (element: HTMLElement) => void;
  download: (options?: {
    name?: string;
    extension?: FileType;
  }) => Promise<void>;
};

const QRCodeGeneratorComponent = () => {
  const [qrCode, setQrCode] = useState<QRCodeStylingInstance | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content Type and Data
  const [contentType, setContentType] = useState<ContentType>("url");
  const [urlData, setUrlData] = useState("https://example.com");
  const [textData, setTextData] = useState("Hello, World!");
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" });
  const [phoneData, setPhoneData] = useState("");
  const [smsData, setSmsData] = useState({ phone: "", message: "" });
  const [wifiData, setWifiData] = useState<WifiData>({
    ssid: "",
    password: "",
    security: "WPA",
    hidden: false,
  });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    title: "",
  });

  // Size options
  const [size, setSize] = useState(280);
  const [margin, setMargin] = useState(10);
  const [borderRadius, setBorderRadius] = useState(0);

  // Dots options
  const [dotsType, setDotsType] = useState<DotType>("square");
  const [dotsColor, setDotsColor] = useState("#000000");

  // Background options
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

  // Corner Square options
  const [cornerSquareType, setCornerSquareType] =
    useState<CornerSquareType>("square");
  const [cornerSquareColor, setCornerSquareColor] = useState("#000000");

  // Corner Dot options
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>("dot");
  const [cornerDotColor, setCornerDotColor] = useState("#000000");

  // Logo options
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.3);
  const [logoMargin] = useState(5);
  const [logoRemoveBg, setLogoRemoveBg] = useState(true);

  // Error correction level
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<
    "L" | "M" | "Q" | "H"
  >("M");

  // UI State
  const [downloadFormat, setDownloadFormat] = useState<FileType>("png");

  // Generate QR data based on content type - memoized
  const generateQRData = useCallback(() => {
    switch (contentType) {
      case "url":
        return urlData || "https://example.com";
      case "text":
        return textData || "Hello, World!";
      case "email":
        return `mailto:${emailData.to}?subject=${encodeURIComponent(
          emailData.subject,
        )}&body=${encodeURIComponent(emailData.body)}`;
      case "phone":
        return `tel:${phoneData}`;
      case "sms":
        return `sms:${smsData.phone}${
          smsData.message ? `?body=${encodeURIComponent(smsData.message)}` : ""
        }`;
      case "wifi":
        return `WIFI:T:${wifiData.security};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden};`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcardData.firstName} ${vcardData.lastName}
N:${vcardData.lastName};${vcardData.firstName};;;
TEL:${vcardData.phone}
EMAIL:${vcardData.email}
ORG:${vcardData.organization}
TITLE:${vcardData.title}
END:VCARD`;
      default:
        return "https://example.com";
    }
  }, [
    contentType,
    urlData,
    textData,
    emailData,
    phoneData,
    smsData,
    wifiData,
    vcardData,
  ]);

  // Debounce QR generation for text inputs
  const [debouncedData, setDebouncedData] = useState(() => generateQRData());

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedData(generateQRData());
    }, 300);

    return () => clearTimeout(timer);
  }, [generateQRData]);

  // Initialize QR Code
  useEffect(() => {
    const currentRef = qrRef.current;

    // Lazy load QRCodeStyling
    import("qr-code-styling").then((module) => {
      const QRCodeStyling = module.default;
      const options = {
        width: size,
        height: size,
        margin,
        type: "canvas" as const,
        data: debouncedData,
        image: logoImage || undefined,
        dotsOptions: {
          color: dotsColor,
          type: dotsType,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          color: cornerSquareColor,
          type: cornerSquareType,
        },
        cornersDotOptions: {
          color: cornerDotColor,
          type: cornerDotType,
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: logoMargin,
          imageSize: logoSize,
          hideBackgroundDots: logoRemoveBg,
        },
        qrOptions: {
          errorCorrectionLevel,
        },
      };

      const qr = new QRCodeStyling(options);
      setQrCode(qr);

      if (currentRef) {
        currentRef.innerHTML = "";
        qr.append(currentRef);
      }
    });

    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, [
    debouncedData,
    size,
    margin,
    dotsType,
    dotsColor,
    backgroundColor,
    cornerSquareType,
    cornerSquareColor,
    cornerDotType,
    cornerDotColor,
    logoImage,
    logoSize,
    logoMargin,
    logoRemoveBg,
    errorCorrectionLevel,
  ]);

  const handleDownload = useCallback(() => {
    if (qrCode) {
      qrCode.download({
        name: "qr-code",
        extension: downloadFormat,
      });
    }
  }, [qrCode, downloadFormat]);

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const removeLogo = useCallback(() => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const contentTabs = useMemo(
    () => [
      { id: "url", icon: Link2, label: "URL" },
      { id: "text", icon: Type, label: "Text" },
      { id: "email", icon: Mail, label: "Email" },
      { id: "phone", icon: Phone, label: "Phone" },
      { id: "sms", icon: MessageSquare, label: "SMS" },
      { id: "wifi", icon: Wifi, label: "WiFi" },
      { id: "vcard", icon: CreditCard, label: "vCard" },
    ],
    [],
  );

  const dotStyles = useMemo(
    () => [
      { id: "square", icon: SquareIcon },
      { id: "dots", icon: DotsIcon },
      { id: "rounded", icon: RoundedIcon },
      { id: "extra-rounded", icon: ExtraRoundedIcon },
      { id: "classy", icon: ClassyIcon },
      { id: "classy-rounded", icon: ClassyRoundedIcon },
    ],
    [],
  );

  const cornerSquareStyles = useMemo(
    () => [
      { id: "square", icon: SquareIcon },
      { id: "extra-rounded", icon: ExtraRoundedIcon },
      { id: "dot", icon: DotsIcon },
    ],
    [],
  );

  const cornerDotStyles = useMemo(
    () => [
      { id: "dot", icon: DotsIcon },
      { id: "square", icon: SquareIcon },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      <GradientBackground />

      {/* Compact Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground font-[family-name:var(--font-eb-garamond)]">
          QR Code Generator
        </h1>
        <p className="text-sm text-muted-foreground">
          Create customizable QR codes with various styles and formats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Content Input */}
        <div className="lg:col-span-2 space-y-4">
          {/* Content Type Tabs */}
          <GlassSurface className="rounded-xl p-4">
            <div className="flex flex-wrap gap-2">
              {contentTabs.map(({ id, icon: Icon, label }) => (
                <Button
                  key={id}
                  size="sm"
                  variant="outline"
                  onClick={() => setContentType(id as ContentType)}
                  className={cn(
                    "flex items-center gap-1.5 transition-all",
                    contentType === id &&
                      "bg-primary/20 text-primary border-primary/50 backdrop-blur-sm",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Content Input Fields */}
            <div className="space-y-3">
              {contentType === "url" && (
                <Input
                  value={urlData}
                  onChange={(e) => setUrlData(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full"
                />
              )}

              {contentType === "text" && (
                <textarea
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                  placeholder="Enter your text here..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-white/10 backdrop-blur-sm resize-none"
                />
              )}

              {contentType === "email" && (
                <EmailInput emailData={emailData} setEmailData={setEmailData} />
              )}

              {contentType === "phone" && (
                <Input
                  value={phoneData}
                  onChange={(e) => setPhoneData(e.target.value)}
                  placeholder="+1234567890"
                />
              )}

              {contentType === "sms" && (
                <SmsInput smsData={smsData} setSmsData={setSmsData} />
              )}

              {contentType === "wifi" && (
                <WifiInput wifiData={wifiData} setWifiData={setWifiData} />
              )}

              {contentType === "vcard" && (
                <VCardInput vcardData={vcardData} setVcardData={setVcardData} />
              )}
            </div>
          </GlassSurface>

          {/* Style Options */}
          <GlassSurface className="rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </h3>

            {/* Dots Style */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">
                Pattern
              </span>
              <div className="flex gap-1">
                {dotStyles.map(({ id, icon: Icon }) => (
                  <Button
                    key={id}
                    size="sm"
                    variant="ghost"
                    onClick={() => setDotsType(id as DotType)}
                    className={cn(
                      "h-9 w-9 p-0 flex items-center justify-center transition-all",
                      dotsType === id &&
                        "bg-primary/20 text-primary backdrop-blur-sm",
                    )}
                    title={id}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
            </div>

            {/* Corner Styles */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16">
                Corners
              </span>
              <div className="flex gap-1">
                {cornerSquareStyles.map(({ id, icon: Icon }) => (
                  <Button
                    key={id}
                    size="sm"
                    variant="ghost"
                    onClick={() => setCornerSquareType(id as CornerSquareType)}
                    className={cn(
                      "h-9 w-9 p-0 flex items-center justify-center transition-all",
                      cornerSquareType === id &&
                        "bg-primary/20 text-primary backdrop-blur-sm",
                    )}
                    title={`Corner square: ${id}`}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex gap-1">
                {cornerDotStyles.map(({ id, icon: Icon }) => (
                  <Button
                    key={id}
                    size="sm"
                    variant="ghost"
                    onClick={() => setCornerDotType(id as CornerDotType)}
                    className={cn(
                      "h-9 w-9 p-0 flex items-center justify-center transition-all",
                      cornerDotType === id &&
                        "bg-primary/20 text-primary backdrop-blur-sm",
                    )}
                    title={`Corner dot: ${id}`}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <ColorPickerButton
                color={dotsColor}
                label="Pattern Color"
                onChange={setDotsColor}
              />
              <ColorPickerButton
                color={backgroundColor}
                label="Background"
                onChange={setBackgroundColor}
              />
              <ColorPickerButton
                color={cornerSquareColor}
                label="Corner Square"
                onChange={setCornerSquareColor}
              />
              <ColorPickerButton
                color={cornerDotColor}
                label="Corner Dot"
                onChange={setCornerDotColor}
              />
            </div>

            {/* Size and Quality */}
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground block">
                  Size
                </label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value) || 280)}
                  min={100}
                  max={1000}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground block">
                  Margin
                </label>
                <Input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(parseInt(e.target.value) || 0)}
                  min={0}
                  max={50}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground block">
                  Radius
                </label>
                <Input
                  type="number"
                  value={borderRadius}
                  onChange={(e) =>
                    setBorderRadius(parseInt(e.target.value) || 0)
                  }
                  min={0}
                  max={50}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground block">
                  Quality
                </label>
                <GlassSurface asChild>
                  <select
                    value={errorCorrectionLevel}
                    onChange={(e) =>
                      setErrorCorrectionLevel(
                        e.target.value as "L" | "M" | "Q" | "H",
                      )
                    }
                    className="w-full h-9 px-3 rounded-lg text-sm appearance-none"
                  >
                    <option value="L">Low</option>
                    <option value="M">Mid</option>
                    <option value="Q">High</option>
                    <option value="H">Max</option>
                  </select>
                </GlassSurface>
              </div>
            </div>
          </GlassSurface>

          {/* Logo Section */}
          <GlassSurface className="rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Logo
              </h4>
              {logoImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />

            {logoImage ? (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-20 h-20 border-2 border-border overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoImage}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Size: {(logoSize * 100).toFixed(0)}%
                    </label>
                    <Slider
                      value={[logoSize]}
                      onValueChange={(value) => setLogoSize(value[0])}
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      className="w-full h-2"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={logoRemoveBg}
                      onCheckedChange={(checked) =>
                        setLogoRemoveBg(checked as boolean)
                      }
                    />
                    Clear background dots
                  </label>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-9 text-xs"
              >
                <Upload className="h-3.5 w-3.5 mr-1" />
                Upload Logo
              </Button>
            )}
          </GlassSurface>
        </div>

        {/* Right Column - Preview & Download */}
        <div className="space-y-4">
          <GlassSurface className="rounded-xl p-4 sticky top-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Preview</h3>

              <div
                className="flex justify-center p-6 bg-white/5 rounded-lg"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <div
                  ref={qrRef}
                  className="qr-code-container"
                  style={{
                    borderRadius: `${borderRadius}px`,
                    overflow: "hidden",
                  }}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Format
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["png", "svg", "jpeg", "webp"] as FileType[]).map(
                      (format) => (
                        <Button
                          key={format}
                          size="sm"
                          variant="outline"
                          onClick={() => setDownloadFormat(format)}
                          className={cn(
                            "h-8 text-xs uppercase transition-all flex items-center justify-center",
                            downloadFormat === format &&
                              "bg-primary/20 text-primary border-primary/50 backdrop-blur-sm",
                          )}
                        >
                          {format}
                        </Button>
                      ),
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  variant="action"
                  className="w-full"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download QR Code</span>
                </Button>
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>
    </div>
  );
};

export const QRCodeGenerator = memo(QRCodeGeneratorComponent);
QRCodeGenerator.displayName = "QRCodeGenerator";
