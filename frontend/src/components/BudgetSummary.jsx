import React, { useState } from 'react';
import { budgetAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';

const BudgetSummary = ({ budgets, onBudgetDeleted, showOverview = true, showAddBudget = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: '',
    startDate: '',
    endDate: '',
  });
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetCategories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Health', 'Shopping', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'limitAmount' ? parseFloat(value) : value,
    }));
  };

  const handleCategorySelect = (e) => {
    const { value } = e.target;
    if (value === '__custom__') {
      setIsCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: '' }));
    } else {
      setIsCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      await budgetAPI.create(formData);
      setFormData({ category: '', limitAmount: '', startDate: '', endDate: '' });
      setIsCustomCategory(false);
      setShowForm(false);
      onBudgetDeleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this budget?')) {
      try {
        await budgetAPI.delete(id);
        onBudgetDeleted();
      } catch (err) {
        alert('Failed to delete budget');
      }
    }
  };

  const inputClasses =
    'w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 text-sm transition-all';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {showOverview && (
        <section className="glass-card rounded-3xl border p-6">
        <div className="flex items-center justify-between gap-3">
        <div>
            <h2 className="text-lg font-bold">Budget Overview</h2>
            <p className="text-zinc-500 text-sm mt-1">
              {budgets.length === 0 ? 'No budgets set yet' : `${budgets.length} ${budgets.length === 1 ? 'budget' : 'budgets'} tracked`}
            </p>
        </div>
          <button
            type="button"
            onClick={() => setIsExpanded((expanded) => !expanded)}
            aria-expanded={isExpanded}
            aria-controls="budget-list"
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-300 transition-colors"
          >
            {isExpanded ? 'Hide budgets' : 'Show budgets'}
          </button>
        </div>

        {isExpanded && (
          <div id="budget-list" className="mt-5">
          {budgets.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium text-sm">No budgets set</p>
              <p className="text-zinc-600 text-xs mt-1">Create one to track limits!</p>
            </div>
          )}

          {budgets.map((budget) => {
            const percentUsed = (budget.spent / budget.limitAmount) * 100;
            const isOverBudget = budget.spent > budget.limitAmount;
            const barColor = isOverBudget ? 'bg-red-500' : 'bg-emerald-600';

            return (
              <div key={budget.id} className="mb-3 p-4 bg-zinc-950/60 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2.5">
                  <div>
                    <p className="font-semibold text-white text-sm">{budget.category}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.limitAmount)}
                    </p>
                    {budget.startDate && budget.endDate && (
                      <p className="text-xs text-zinc-600 mt-0.5">
                        {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                    aria-label="Delete budget"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-400 font-medium mt-1.5">Over budget!</p>
                )}
              </div>
            );
          })}
          </div>
        )}
        </section>
      )}

      {showAddBudget && (
        <section className="glass-card rounded-3xl border p-6">
          <button
            type="button"
            onClick={() => setShowForm((visible) => !visible)}
            className={`w-full font-semibold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
              showForm
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            {showForm ? (
              'Cancel'
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Budget
              </>
            )}
          </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}
            {!isCustomCategory ? (
              <select
                name="categorySelect"
                value={formData.category}
                onChange={handleCategorySelect}
                className={inputClasses}
                required
              >
                <option value="" disabled>Select category</option>
                {presetCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__custom__">+ Custom category...</option>
              </select>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="text"
                  name="category"
                  placeholder="Enter custom category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomCategory(false);
                    setFormData((prev) => ({ ...prev, category: '' }));
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ← Back to preset categories
                </button>
              </div>
            )}
            <input
              type="number"
              name="limitAmount"
              placeholder="Budget Limit (₱)"
              value={formData.limitAmount}
              onChange={handleChange}
              step="0.01"
              className={inputClasses}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-zinc-500 text-xs font-medium mb-1">Start date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`${inputClasses} [color-scheme:dark]`}
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs font-medium mb-1">End date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || undefined}
                  className={`${inputClasses} [color-scheme:dark]`}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg text-sm disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setIsCustomCategory(false);
                }}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-2 px-3 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        </section>
      )}
    </>
  );
};

export default BudgetSummary;