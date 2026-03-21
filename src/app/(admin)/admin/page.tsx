"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

interface Stats {
  totals: { users: number; cases: number; claims: number };
  casesByStatus: Record<string, number>;
  casesByCategory: Record<string, number>;
  recentUsers: { id: string; alias: string; role: string; created_at: string }[];
  recentCases: {
    id: string;
    title: string;
    status: string;
    category: string;
    created_at: string;
    profiles: { alias: string } | null;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  recruiting: "Reclutando afectados",
  open: "Abierto",
  closed: "Cerrado",
  rejected: "Rechazado",
};

const CATEGORY_LABELS: Record<string, string> = {
  tax_claims: "Reclamaciones tributarias",
  admin_claims: "Reclamaciones a la Administración",
  consumer_competition: "Consumo & Competencia",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-surface-500">Cargando estadisticas...</p>
        </div>
      </AdminShell>
    );
  }

  if (!stats) {
    return (
      <AdminShell>
        <p className="text-red-600">Error al cargar las estadisticas.</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold text-surface-950 mb-8">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard label="Total usuarios" value={stats.totals.users} color="brand" />
        <StatCard label="Total casos" value={stats.totals.cases} color="blue" />
        <StatCard label="Total afectados inscritos" value={stats.totals.claims} color="green" />
      </div>

      {/* Cases breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-10">
        {/* By status */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Casos por estado</h2>
          <div className="space-y-3">
            {Object.entries(stats.casesByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-surface-600">
                  {STATUS_LABELS[status] || status}
                </span>
                <span className="text-sm font-semibold text-surface-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.casesByStatus).length === 0 && (
              <p className="text-sm text-surface-400">Sin casos aun</p>
            )}
          </div>
        </div>

        {/* By category */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Casos por categoria</h2>
          <div className="space-y-3">
            {Object.entries(stats.casesByCategory).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-surface-600">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <span className="text-sm font-semibold text-surface-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.casesByCategory).length === 0 && (
              <p className="text-sm text-surface-400">Sin casos aun</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Ultimos registros</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">{u.alias}</p>
                  <p className="text-xs text-surface-400">
                    {new Date(u.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : u.role === "supervisor"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-surface-100 text-surface-600"
                  }`}
                >
                  {u.role}
                </span>
              </div>
            ))}
            {stats.recentUsers.length === 0 && (
              <p className="text-sm text-surface-400">Sin usuarios aun</p>
            )}
          </div>
        </div>

        {/* Recent cases */}
        <div className="rounded-xl border border-surface-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-surface-700 mb-4">Ultimos casos</h2>
          <div className="space-y-3">
            {stats.recentCases.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-surface-900">{c.title}</p>
                  <p className="text-xs text-surface-400">
                    por {c.profiles?.alias || "Desconocido"} -{" "}
                    {new Date(c.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs font-medium text-surface-600">
                  {STATUS_LABELS[c.status] || c.status}
                </span>
              </div>
            ))}
            {stats.recentCases.length === 0 && (
              <p className="text-sm text-surface-400">Sin casos aun</p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6">
      <p className="text-sm text-surface-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-surface-950">
        {value.toLocaleString("es-ES")}
      </p>
      <div className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}>
        Total
      </div>
    </div>
  );
}
