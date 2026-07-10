"use client";
import { useState } from "react";

const BACKEND = "http://localhost:8000";

export default function AnalyticsSection({ user }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND}/student/${user?.student_id || "demo_user"}/progress`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const maxProb = data ? Math.max(...data.history.map((h) => h.placement_probability), 1) : 100;

  return (
    <section id="analytics" className="py-24 px-6 border-t border-gray-100 bg-gray-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Step 03</p>
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900" style={{ letterSpacing: "-0.02em" }}>
            Progress Analytics
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl">
            Track how your placement probability evolves over multiple practice sessions.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={load}
            disabled={loading || !user?.student_id}
            className="px-6 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "…" : "Load"}
          </button>
        </div>

        {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

        {data && data.history.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-sm text-gray-400">No interview sessions recorded yet.</p>
          </div>
        )}

        {data && data.history.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
                Placement Probability — {data.name}
              </p>
              <div className="flex items-end gap-3 h-40">
                {data.history.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-gray-400">{h.placement_probability}%</span>
                    <div
                      className="w-full bg-gray-900 rounded-t-lg transition-all duration-700"
                      style={{ height: `${(h.placement_probability / maxProb) * 120}px`, minHeight: "4px" }}
                    />
                    <span className="text-xs text-gray-300">W{h.week_number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Session Log</p>
              {[...data.history].reverse().map((h, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-gray-500">Week {h.week_number}</span>
                    <span className="text-sm font-semibold text-gray-900">{h.placement_probability}%</span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: "DSA", val: h.dsa_score },
                      { label: "Aptitude", val: h.aptitude_score },
                      { label: "Comms", val: h.communication_score },
                    ].map((m) => (
                      <div key={m.label} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-14">{m.label}</span>
                        <div className="flex-1 h-0.5 bg-gray-100 rounded-full">
                          <div className="h-0.5 bg-gray-700 rounded-full" style={{ width: `${m.val}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(m.val)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-300 mt-2">{new Date(h.recorded_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
