"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { StarField } from "@/components/astro/StarField";
import {
  Lock,
  Users,
  RefreshCw,
  MapPin,
  Globe,
  ShieldAlert,
  Calendar,
} from "lucide-react";

interface SubmissionRecord {
  timestamp: string;
  name?: string;
  identifier: string;
  city?: string;
  country?: string;
  age: number | null;
  birthdayDisplay: string;
  fullBirthday: string;
  timeKnown: boolean;
  gender?: "male" | "female";
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  locationAndIp: string;
  ip?: string;
  ipLocation?: string;
}

function fmtOrNone(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "None";
  if (typeof v === "string" && v.trim() === "") return "None";
  return String(v);
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function AdminDashboard() {
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [records, setRecords] = useState<SubmissionRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/collect?token=${encodeURIComponent(token)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not load submissions.");
        setRecords(null);
      } else {
        setRecords(data.records || []);
      }
    } catch {
      setError("Network error while loading submissions.");
      setRecords(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
    else {
      setLoading(false);
      setError("Missing token. Add ?token=YOUR_TOKEN to the URL.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sorted = records
    ? [...records].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : null;

  return (
    <main className="relative min-h-screen bg-[#0a0618] text-white overflow-hidden">
      <StarField />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-300/30 bg-amber-300/[0.08] flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif">Submissions</h1>
              <p className="text-xs text-white/40">
                {sorted ? `${sorted.length} total` : "Loading..."}
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/[0.06] p-5 mb-6">
            <ShieldAlert className="h-5 w-5 text-rose-300 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-rose-200 font-medium">{error}</p>
              {!token && (
                <p className="text-xs text-white/40 mt-1">
                  Example: <code className="text-amber-300/80">/admin?token=your-secret-token</code>
                </p>
              )}
            </div>
          </div>
        )}

        {loading && !error && (
          <div className="flex items-center justify-center py-24 text-white/40 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Loading submissions...
          </div>
        )}

        {!loading && sorted && sorted.length === 0 && !error && (
          <div className="text-center py-24 text-white/40 text-sm">
            No submissions yet.
          </div>
        )}

        {!loading && sorted && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((r, i) => (
              <motion.div
                key={`${r.timestamp}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 sm:p-5"
              >
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <p className="text-base font-medium text-white">
                      {fmtOrNone(r.name)}
                      {r.gender && (
                        <span className="ml-2 text-xs text-white/40 capitalize">
                          {r.gender}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-white/40 flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3" />
                      {fmtTime(r.timestamp)}
                    </p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {r.sunSign && (
                      <span className="rounded-full border border-amber-300/25 bg-amber-300/[0.06] px-2.5 py-1 text-[11px] text-amber-200/90">
                        ☀ {r.sunSign}
                      </span>
                    )}
                    {r.moonSign && (
                      <span className="rounded-full border border-indigo-300/25 bg-indigo-300/[0.06] px-2.5 py-1 text-[11px] text-indigo-200/90">
                        ☾ {r.moonSign}
                      </span>
                    )}
                    {r.risingSign && (
                      <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.06] px-2.5 py-1 text-[11px] text-emerald-200/90">
                        ↑ {r.risingSign}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-white/30 mb-0.5">Age</p>
                    <p className="text-white/80">{fmtOrNone(r.age)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-0.5">Birthday</p>
                    <p className="text-white/80">{fmtOrNone(r.fullBirthday)}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-0.5">Time known</p>
                    <p className="text-white/80">{r.timeKnown ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <p className="text-white/30 mb-0.5">IP address</p>
                    <p className="text-white/80 font-mono text-[11px]">{fmtOrNone(r.ip)}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/30 mb-0.5">Location they typed</p>
                      <p className="text-white/80">
                        {fmtOrNone(r.city && r.country ? `${r.city}, ${r.country}` : r.city)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Globe className="h-3.5 w-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white/30 mb-0.5">Real IP location</p>
                      <p
                        className={
                          r.ipLocation &&
                          r.city &&
                          !r.ipLocation.toLowerCase().includes(r.city.toLowerCase()) &&
                          !(r.country && r.ipLocation.toLowerCase().includes(r.country.toLowerCase()))
                            ? "text-rose-300"
                            : "text-white/80"
                        }
                      >
                        {fmtOrNone(r.ipLocation)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0a0618] flex items-center justify-center text-white/40 text-sm">
          <Lock className="h-4 w-4 mr-2" />
          Loading...
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
