import React, { useState } from 'react';
import { savingAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';

const SavingsWithdrawals = ({ savings, onSavingsChanged }) => {
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);
  const withdrawals = savings
    .filter((s) => s.type === 'WITHDRAWAL')
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentWithdrawals = withdrawals.slice(0, 3);

  if (withdrawals.length === 0) return null;

  const totalWithdrawn = withdrawals.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this withdrawal? The amount will return to your savings.')) return;
    try {
      await savingAPI.delete(id);
      onSavingsChanged();
    } catch (err) {
      console.error('Failed to delete withdrawal:', err);
    }
  };

  return (
    <div className="glass-card rounded-3xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold">Paid from Savings</h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            Showing the latest {Math.min(withdrawals.length, 3)} of {withdrawals.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs font-medium">Total withdrawn</p>
          <p className="text-lg font-bold text-red-400">-{formatCurrency(totalWithdrawn)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {(showAllWithdrawals ? withdrawals : recentWithdrawals).map((s) => (
          <div
            key={s.id}
            className="group flex items-start sm:items-center gap-2.5 sm:gap-3 bg-zinc-950/60 hover:bg-zinc-800/60 p-3 sm:p-3.5 rounded-2xl border border-zinc-800 transition-colors duration-150"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5">
                  <p className="font-semibold text-white text-sm truncate">{s.destination}</p>
                  <span className="text-red-400 font-bold text-sm sm:text-base whitespace-nowrap">-{formatCurrency(parseFloat(s.amount || 0))}</span>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <p className="text-zinc-500 text-xs truncate">{s.note || 'Withdrawal'}</p>
                  <span className="text-zinc-600 text-xs whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDelete(s.id)}
              className="min-w-10 min-h-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all duration-150 p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
              aria-label="Delete withdrawal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        ))}
        {withdrawals.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllWithdrawals((showAll) => !showAll)}
            className="w-full py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {showAllWithdrawals ? 'Show less' : `View all ${withdrawals.length} paid-from-savings transactions`}
          </button>
        )}
      </div>
    </div>
  );
};

export default SavingsWithdrawals;