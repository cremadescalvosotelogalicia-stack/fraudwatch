"use client";

import { useState } from "react";

interface ShareLinkProps {
  caseId: string;
  privateToken: string;
}

export function ShareLink({ caseId, privateToken }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const joinUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/cases/${caseId}/join?token=${privateToken}`
      : `/cases/${caseId}/join?token=${privateToken}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="rounded-2xl border border-brand-200/60 bg-brand-50/50 p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-900">
            Caso privado
          </p>
          <p className="text-xs text-brand-700/60 mt-0.5">
            Comparte este enlace solo con afectados de confianza
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 min-w-0 rounded-xl border border-brand-200 bg-white px-3 py-2">
          <p className="text-xs text-surface-900/50 truncate font-mono">{joinUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            copied
              ? "bg-emerald-600 text-white"
              : "bg-brand-700 text-white hover:bg-brand-800"
          }`}
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
