"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  VisuallyHidden,
} from "@/features/shared/ui/dialog";
import { GlassSurface } from "@/features/shared/ui/glass-surface";
import { Button } from "@/features/shared/ui/button";
import { Textarea } from "@/features/shared/ui/textarea";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Send, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import posthog from "posthog-js";
import { Input } from "@/features/shared/ui/input";

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
    [errors],
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-sm sm:max-w-md h-[90vh] sm:h-auto max-h-[600px] p-1 sm:p-2"
        showCloseButton
      >
        <VisuallyHidden>
          <DialogTitle>{t("title")}</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col h-full gap-3">
          {/* Header */}
          <div className="pt-1 pb-2 px-3">
            <div className="flex justify-start items-center gap-3">
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
              <div className="p-3">
                <div className="space-y-3">
                  <label htmlFor="message" className="text-sm font-medium">
                    {t("form.message")} <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder={t("form.messagePlaceholder")}
                    rows={4}
                    className={cn(
                      "py-2.5 text-sm",
                      errors.message &&
                        "border-red-500/50 focus-visible:ring-red-500/50",
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
              <div className="p-3">
                <div className="space-y-3">
                  <label htmlFor="email" className="text-sm font-medium">
                    {t("form.email")}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder={t("form.emailPlaceholder")}
                    className={cn(
                      errors.email
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-white/20",
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
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="action"
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send />
                {t("actions.submit")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
