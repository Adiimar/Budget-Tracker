import React from 'react';
import { savingAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';

const SavingsWithdrawals = ({ savings, onSavingsChanged }) => {
  const withdrawals = savings
    .filter((s) => s.type === 'WITHDRAWAL')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
          <p className="text-zinc-500 text-sm mt-0.5">Expenses deducted from your savings</p>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-xs font-medium">Total withdrawn</p>
          <p className="text-lg font-bold text-red-400">-{formatCurrency(totalWithdrawn)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {withdrawals.map((s) => (
          <div
            key={s.id}
            className="bg-zinc-950/60 border border-zinc-800 rounded-2xl px-3 sm:px-4 py-3 flex items-start sm:items-center justify-between gap-2 sm:gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{s.destination}</p>
                <p className="text-zinc-500 text-sm truncate">{s.note || 'Withdrawal'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-right">
                <p className="font-bold text-red-400">-{formatCurrency(parseFloat(s.amount || 0))}</p>
                <p className="text-zinc-600 text-xs">{new Date(s.date).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="min-w-10 min-h-10 flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavingsWithdrawals;