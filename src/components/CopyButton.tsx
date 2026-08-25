"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  disabled?: boolean;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "",
  disabled = false,
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
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled || !value}
      className={`inline-flex items-center justify-center rounded-full bg-accent px-3.5 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-muted ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
