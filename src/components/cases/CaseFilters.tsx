"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "", label: "Todas las categorías" },
  { value: "investment_fraud", label: "Fraude de inversión" },
  { value: "romance_scam", label: "Estafa romántica" },
  { value: "phishing", label: "Phishing" },
  { value: "ecommerce_fraud", label: "Fraude en compras" },
  { value: "rental_fraud", label: "Fraude de alquiler" },
  { value: "other", label: "Otro" },
];

export function CaseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/cases?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-900/30"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por empresa o descripción..."
          defaultValue={searchParams.get("q") || ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm text-surface-950 placeholder:text-surface-900/30 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
        />
      </div>

      {/* Category */}
      <select
        value={searchParams.get("category") || ""}
        onChange={(e) => updateParam("category", e.target.value)}
        className="rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-900/70 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
