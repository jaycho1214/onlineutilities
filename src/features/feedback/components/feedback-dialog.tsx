"use client";

import React from "react";
import { Dialog, DialogContent } from "@/features/shared/ui/dialog";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Send, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import posthog from "posthog-js";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeedbackFormData {
  message: string;
  email: string;
}

interface FormErrors {
  message?: string;
  email?: string;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const t = useTranslations("Feedback");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FeedbackFormData>({
    message: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Check if form has any content
  const hasFormContent = formData.message.trim() || formData.email.trim();

  const handleClear = useCallback(() => {
    setFormData({
      message: "",
      email: "",
    });
    setErrors({});
  }, []);

  // Handle dialog close with confirmation if needed
  const handleClose = useCallback(() => {
    if (hasFormContent) {
      if (confirm(t("notifications.confirmClose"))) {
        handleClear();
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  }, [hasFormContent, onOpenChange, handleClear, t]);

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      // Small delay to ensure dialog is fully closed before resetting
      setTimeout(() => {
        setFormData({
          message: "",
          email: "",
        });
        setErrors({});
      }, 200);
    }
  }, [open]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = t("notifications.messageRequired");
    } else if (formData.message.trim().length < 10) {
      newErrors.message = t("validation.messageMin");
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = t("validation.messageMax");
    }

    // Email validation (optional but must be valid if provided)
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = t("validation.emailInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error(t("notifications.required"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to PostHog
      posthog.capture("survey sent", {
        $survey_id: "0198b6d1-0a9d-0000-b708-dc09bc03472e",
        "$survey_response_014657b5-1e17-407b-a301-093b89914e81":
          formData.message.trim(),
        "$survey_response_9de8c785-c02b-40aa-97fe-6b04c0daa452":
          formData.email.trim(),
      });

      toast.success(t("notifications.success"));

      // Reset form
      setFormData({
        message: "",
        email: "",
      });
      setErrors({});

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error(t("notifications.error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, t, onOpenChange, validateForm]);

  const handleInputChange = useCallback(
    (field: keyof FeedbackFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-sm sm:max-w-md h-[90vh] sm:h-auto max-h-[600px] p-2 sm:p-3"
        showCloseButton={false}
      >
        {/* Custom Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col h-full gap-3">
          {/* Header */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{t("title")}</h2>
                <p className="text-sm text-foreground/70">{t("description")}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-3">
            {/* Message */}
            <GlassSurface className="shadow-lg">
              <div className="p-4">
                <div className="space-y-3">
                  <label htmlFor="message" className="text-sm font-medium">
                    {t("form.message")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder={t("form.messagePlaceholder")}
                    rows={4}
                    className={cn(
                      "w-full px-3 py-2.5 text-sm bg-white/5 border rounded-lg resize-none",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                      "backdrop-blur-sm transition-colors",
                      errors.message
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-white/20"
                    )}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    {errors.message && (
                      <p className="text-xs text-red-400">{errors.message}</p>
                    )}
                    <p className="text-xs text-foreground/50 ml-auto">
                      {formData.message.length}/1000
                    </p>
                  </div>
                </div>
              </div>
            </GlassSurface>

            {/* Email */}
            <GlassSurface className="shadow-lg">
              <div className="p-4">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t("form.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t("form.emailPlaceholder")}
                    className={cn(
                      "w-full px-3 py-2.5 text-sm bg-white/5 border rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50",
                      "backdrop-blur-sm transition-colors",
                      errors.email
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-white/20"
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email}</p>
                  )}
                  <p className="text-xs text-foreground/60">
                    {t("form.emailDescription")}
                  </p>
                </div>
              </div>
            </GlassSurface>
          </div>

          {/* Footer */}
          <GlassSurface className="shadow-lg">
            <div className="p-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full px-4 py-3 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {t("actions.submit")}
                  </>
                )}
              </button>
            </div>
          </GlassSurface>
        </div>
      </DialogContent>
    </Dialog>
  );
}
