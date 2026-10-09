import React, { useState } from 'react';
import { expenseAPI } from '../api/api';
import { SAVINGS_PRESETS } from '../utils/SavingsDestination';

const ExpenseForm = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0],
    source: 'BALANCE',
    savingsDestination: '',
    savingsDestinationType: '',
  });
  const [isCustomSavingsDestination, setIsCustomSavingsDestination] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Shopping', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value,
    }));
  };

  const handleSourceChange = (source) => {
    setFormData((prev) => ({
      ...prev,
      source,
      savingsDestination: source === 'BALANCE' ? '' : prev.savingsDestination,
      savingsDestinationType: source === 'BALANCE' ? '' : prev.savingsDestinationType,
    }));
    if (source === 'BALANCE') setIsCustomSavingsDestination(false);
  };

  const handleSavingsDestinationSelect = (e) => {
    const { value } = e.target;
    if (value === '__custom__') {
      setIsCustomSavingsDestination(true);
      setFormData((prev) => ({ ...prev, savingsDestination: '', savingsDestinationType: 'CUSTOM' }));
    } else {
      const preset = SAVINGS_PRESETS.find((p) => p.name === value);
      setIsCustomSavingsDestination(false);
      setFormData((prev) => ({
        ...prev,
        savingsDestination: value,
        savingsDestinationType: preset?.type || 'CUSTOM',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.source === 'SAVINGS' && !formData.savingsDestination) {
      setError('Please choose which savings destination to deduct from');
      return;
    }

    setLoading(true);

    try {
      await expenseAPI.create(formData);
      setFormData({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0],
        source: 'BALANCE',
        savingsDestination: '',
        savingsDestinationType: '',
      });
      setIsCustomSavingsDestination(false);
      onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'min-h-11 w-full min-w-0 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Amount (₱)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">₱</span>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            placeholder="0.00"
            className={`${inputClasses} pl-8`}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={inputClasses}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What did you spend on?"
          className={inputClasses}
          required
        />
      </div>

      <div>
        <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className={`${inputClasses} [color-scheme:dark]`}
          required
        />
      </div>

      {/* Deduct from: Balance or Savings */}
      <div>
        <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Deduct from</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSourceChange('BALANCE')}
            className={`min-h-11 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              formData.source === 'BALANCE'
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Remaining Balance
          </button>
          <button
            type="button"
            onClick={() => handleSourceChange('SAVINGS')}
            className={`min-h-11 py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
              formData.source === 'SAVINGS'
                ? 'bg-blue-500/15 border-blue-500 text-blue-400'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            Savings
          </button>
        </div>

        {formData.source === 'SAVINGS' && (
          <div className="mt-3">
            {!isCustomSavingsDestination ? (
              <select
                value={formData.savingsDestination}
                onChange={handleSavingsDestinationSelect}
                className={inputClasses}
                required
              >
                <option value="" disabled>Which savings account?</option>
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
                  placeholder="Enter destination name"
                  value={formData.savingsDestination}
                  onChange={(e) => setFormData((prev) => ({ ...prev, savingsDestination: e.target.value }))}
                  className={inputClasses}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomSavingsDestination(false);
                    setFormData((prev) => ({ ...prev, savingsDestination: '', savingsDestinationType: '' }));
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Back to preset destinations
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
        {loading ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
};

export default ExpenseForm;