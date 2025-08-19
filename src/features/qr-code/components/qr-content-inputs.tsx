"use client";

import React, { memo } from "react";
import { Input } from "@/features/shared/ui/input";
import { Textarea } from "@/features/shared/ui/textarea";
import { Checkbox } from "@/features/shared/ui/checkbox";

interface EmailDataProps {
  emailData: { to: string; subject: string; body: string };
  setEmailData: (data: { to: string; subject: string; body: string }) => void;
}

export const EmailInput = memo(
  ({ emailData, setEmailData }: EmailDataProps) => (
    <div className="space-y-2">
      <Input
        value={emailData.to}
        onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
        placeholder="recipient@example.com"
      />
      <Input
        value={emailData.subject}
        onChange={(e) =>
          setEmailData({ ...emailData, subject: e.target.value })
        }
        placeholder="Subject"
      />
      <Textarea
        value={emailData.body}
        onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
        placeholder="Message body..."
        className="h-16"
      />
    </div>
  ),
);
EmailInput.displayName = "EmailInput";

interface SmsDataProps {
  smsData: { phone: string; message: string };
  setSmsData: (data: { phone: string; message: string }) => void;
}

export const SmsInput = memo(({ smsData, setSmsData }: SmsDataProps) => (
  <div className="space-y-2">
    <Input
      value={smsData.phone}
      onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })}
      placeholder="Phone number"
    />
    <Textarea
      value={smsData.message}
      onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
      placeholder="Message (optional)"
      className="h-16"
    />
  </div>
));
SmsInput.displayName = "SmsInput";

interface WifiDataProps {
  wifiData: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  };
  setWifiData: (data: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden: boolean;
  }) => void;
}

export const WifiInput = memo(({ wifiData, setWifiData }: WifiDataProps) => (
  <div className="space-y-2">
    <Input
      value={wifiData.ssid}
      onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
      placeholder="Network name (SSID)"
    />
    <Input
      type="password"
      value={wifiData.password}
      onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
      placeholder="Password"
    />
    <div className="flex items-center gap-4">
      <select
        value={wifiData.security}
        onChange={(e) =>
          setWifiData({
            ...wifiData,
            security: e.target.value as "WPA" | "WEP" | "nopass",
          })
        }
        className="h-9 px-3 rounded-lg border border-border bg-white/10 backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMS41TDYgNi41TDExIDEuNSIgc3Ryb2tlPSIlMjM5OTkiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')] bg-[position:right_0.75rem_center] bg-no-repeat pr-10"
      >
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">No password</option>
      </select>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox
          checked={wifiData.hidden}
          onCheckedChange={(checked) =>
            setWifiData({
              ...wifiData,
              hidden: checked as boolean,
            })
          }
        />
        Hidden network
      </label>
    </div>
  </div>
));
WifiInput.displayName = "WifiInput";

interface VCardDataProps {
  vcardData: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    title: string;
  };
  setVcardData: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    organization: string;
    title: string;
  }) => void;
}

export const VCardInput = memo(
  ({ vcardData, setVcardData }: VCardDataProps) => (
    <div className="grid grid-cols-2 gap-2">
      <Input
        value={vcardData.firstName}
        onChange={(e) =>
          setVcardData({ ...vcardData, firstName: e.target.value })
        }
        placeholder="First name"
      />
      <Input
        value={vcardData.lastName}
        onChange={(e) =>
          setVcardData({ ...vcardData, lastName: e.target.value })
        }
        placeholder="Last name"
      />
      <Input
        value={vcardData.phone}
        onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
        placeholder="Phone"
      />
      <Input
        value={vcardData.email}
        onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
        placeholder="Email"
      />
      <Input
        value={vcardData.organization}
        onChange={(e) =>
          setVcardData({ ...vcardData, organization: e.target.value })
        }
        placeholder="Organization"
      />
      <Input
        value={vcardData.title}
        onChange={(e) => setVcardData({ ...vcardData, title: e.target.value })}
        placeholder="Job title"
      />
    </div>
  ),
);
VCardInput.displayName = "VCardInput";
