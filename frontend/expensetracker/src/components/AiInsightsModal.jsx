import React from "react";

const AiInsightsModal = ({ isOpen, onClose, loading, insights, mode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-4 border border-slate-200 dark:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {insights?.title || "Insights"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mode: {mode || "offline"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>

        {loading ? (
          <p className="text-slate-600 dark:text-slate-300">Generating insights...</p>
        ) : !insights ? (
          <p className="text-slate-600 dark:text-slate-300">No insights available.</p>
        ) : (
          <div className="space-y-5">
            {insights.disclaimer && (
              <div className="text-xs rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                {insights.disclaimer}
              </div>
            )}

            {insights.warning && (
              <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-800 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
                <span className="font-semibold">Warning:</span> {insights.warning}
              </div>
            )}

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Observations</h4>
              <ul className="list-disc pl-5 text-slate-700 dark:text-slate-200 space-y-1">
                {(insights.observations || []).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Suggestions</h4>
              <ul className="list-disc pl-5 text-slate-700 dark:text-slate-200 space-y-1">
                {(insights.suggestions || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiInsightsModal;

