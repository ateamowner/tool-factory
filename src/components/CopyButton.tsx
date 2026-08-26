"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  showStatus?: boolean;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
  disabled = false,
  variant = "primary",
  showStatus = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!value || disabled) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <span className="inline-flex items-center gap-3">
      {showStatus && copied ? (
        <span className="text-sm font-medium text-mint" aria-live="polite">
          {copiedLabel}
        </span>
      ) : null}
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled || !value}
        className={`${variant === "secondary" ? "btn-secondary" : "btn-primary"} ${className}`}
      >
        {showStatus ? label : copied ? copiedLabel : label}
      </button>
    </span>
  );
}
