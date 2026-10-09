import React, { useState } from 'react';
import { savingAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';
import { SAVINGS_PRESETS, getDestinationStyle } from '../utils/SavingsDestination';

const SavingsSection = ({ savings, remaining, onSavingsChanged }) => {
  const [showForm, setShowForm] = useState(false);
  const [isCustomDestination, setIsCustomDestination] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    destination: '',
    destinationType: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Withdrawals (expenses paid from savings) are shown in their own card
  const deposits = savings.filter((s) => s.type !== 'WITHDRAWAL');

  const inputClasses =
    'min-h-11 w-full min-w-0 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-sm transition-all';

  const openForm = () => {
    setFormData((prev) => ({
      ...prev,
      amount: remaining > 0 ? remaining.toFixed(2) : '',
    }));
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    // allow empty string, digits, an optional single decimal point, up to 2 decimal places
    if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
      setFormData((prev) => ({ ...prev, amount: val }));
    }
  };

  const handleDestinationSelect = (e) => {
    const { value } = e.target;
    if (value === '__custom__') {
      setIsCustomDestination(true);
      setFormData((prev) => ({ ...prev, destination: '', destinationType: 'CUSTOM' }));
    } else {
      const preset = SAVINGS_PRESETS.find((p) => p.name === value);
      setIsCustomDestination(false);
      setFormData((prev) => ({ ...prev, destination: value, destinationType: preset?.type || 'CUSTOM' }));
    }
  };

  const resetForm = () => {
    setFormData({ amount: '', destination: '', destinationType: '', note: '', date: new Date().toISOString().split('T')[0] });
    setIsCustomDestination(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await savingAPI.create({
        amount: parseFloat(formData.amount),
        destination: formData.destination,
        destinationType: formData.destinationType || 'CUSTOM',
        note: formData.note,
        date: formData.date,
      });
      resetForm();
      onSavingsChanged();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add savings entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this savings entry?')) {
      try {
        await savingAPI.delete(id);
        onSavingsChanged();
      } catch (err) {
        alert('Failed to delete savings entry');
      }
    }
  };

  return (
    <div className="glass-card rounded-3xl border p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold">Savings</h2>
        {!showForm && (
          <button
            onClick={openForm}
            className="min-h-11 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white text-sm font-semibold py-2 px-3.5 rounded-xl transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Move to Savings
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-5 space-y-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Amount (₱)</label>
            <input
              type="text"
              inputMode="decimal"
              name="amount"
              value={formData.amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Where to?</label>
            {!isCustomDestination ? (
              <select
                value={formData.destination}
                onChange={handleDestinationSelect}
                className={inputClasses}
                required
              >
                <option value="" disabled>Select destination</option>
                {SAVINGS_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.type === 'BANK' ? 'Bank' : 'E-wallet'})
                  </option>
                ))}
                <option value="__custom__">+ Custom destination...</option>
              </select>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  name="destination"
                  placeholder="Enter destination name"
                  value={formData.destination}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomDestination(false);
                    setFormData((prev) => ({ ...prev, destination: '', destinationType: '' }));
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Back to preset destinations
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Note (optional)</label>
            <input
              type="text"
              name="note"
              placeholder="e.g. Emergency fund"
              value={formData.note}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`${inputClasses} [color-scheme:dark]`}
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {deposits.length === 0 ? (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <p className="text-zinc-400 font-medium text-sm">No savings tracked yet</p>
          <p className="text-zinc-600 text-xs mt-1">Move some of your remaining balance into savings!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {deposits.map((s) => {
            const style = getDestinationStyle(s.destinationType);
            return (
              <div
                key={s.id}
                className="group flex items-start sm:items-center gap-2.5 sm:gap-3 bg-zinc-950/60 hover:bg-zinc-800/60 p-3 sm:p-3.5 rounded-2xl border border-zinc-800 transition-colors duration-150"
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-md`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {style.icon}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5">
                    <p className="font-semibold text-white text-sm truncate">{s.destination}</p>
                    <span className="text-blue-400 font-bold text-sm sm:text-base whitespace-nowrap">{formatCurrency(s.amount)}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <p className="text-zinc-500 text-xs truncate">{s.note || 'Savings'}</p>
                    <span className="text-zinc-600 text-xs whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="min-w-10 min-h-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all duration-150 p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                  aria-label="Delete savings entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavingsSection;