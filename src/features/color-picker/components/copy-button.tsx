import React, { useState, useCallback } from "react";
import { Button } from "@/features/shared/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/features/shared/ui/tooltip";
import { Copy } from "lucide-react";

interface CopyButtonProps {
  value: string;
  format?: string;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onClick?: (e: React.MouseEvent) => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  format,
  className = "h-8 w-8",
  size = "icon",
  variant = "ghost",
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    onClick?.(e);
    
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setIsOpen(true);
      
      setTimeout(() => {
        setIsCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        setIsCopied(true);
        setIsOpen(true);
        setTimeout(() => {
          setIsCopied(false);
          setIsOpen(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
    }
  }, [value, onClick]);
  
  const tooltipText = isCopied ? "Copied!" : format ? `Copy ${format}` : "Copy";
  
  return (
    <Tooltip open={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger asChild>
        <Button
          size={size}
          variant={variant}
          onClick={handleCopy}
          className={className}
          aria-label={tooltipText}
        >
          <Copy className="w-3 h-3" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};