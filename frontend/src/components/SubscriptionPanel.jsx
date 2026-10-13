import React, { useMemo, useState } from 'react';
import { subscriptionAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const parseDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const SubscriptionPanel = ({ subscriptions, onSubscriptionsChanged }) => {
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', monthlyAmount: '', nextDueDate: today() });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const sortedSubscriptions = useMemo(
    () => [...subscriptions].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate)),
    [subscriptions]
  );
  const monthlyTotal = subscriptions.reduce(
    (total, subscription) => total + Number(subscription.monthlyAmount || 0),
    0
  );

  const resetForm = () => {
    setFormData({ name: '', monthlyAmount: '', nextDueDate: today() });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const beginEdit = (subscription) => {
    setFormData({
      name: subscription.name,
      monthlyAmount: String(subscription.monthlyAmount),
      nextDueDate: subscription.nextDueDate,
    });
    setEditingId(subscription.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        monthlyAmount: Number(formData.monthlyAmount),
        nextDueDate: formData.nextDueDate,
      };
      if (editingId) {
        await subscriptionAPI.update(editingId, payload);
      } else {
        await subscriptionAPI.create(payload);
      }
      resetForm();
      onSubscriptionsChanged();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this subscription.');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async (subscription) => {
    setBusy(true);
    setError('');
    try {
      await subscriptionAPI.markPaid(subscription.id);
      onSubscriptionsChanged();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the due date.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (subscription) => {
    if (!window.confirm(`Delete ${subscription.name}?`)) return;
    setBusy(true);
    setError('');
    try {
      await subscriptionAPI.delete(subscription.id);
      onSubscriptionsChanged();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this subscription.');
    } finally {
      setBusy(false);
    }
  };

  const dueStatus = (dueDate) => {
    const daysUntilDue = Math.ceil((parseDate(dueDate) - parseDate(today())) / 86400000);
    if (daysUntilDue < 0) return { label: 'Overdue', color: 'text-red-400' };
    if (daysUntilDue <= 3) {
      return {
        label: daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
        color: 'text-amber-300',
      };
    }
    return { label: `Due ${parseDate(dueDate).toLocaleDateString()}`, color: 'text-zinc-500' };
  };

  return (
    <section className="glass-tile min-w-0 rounded-2xl border border-zinc-800 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-zinc-100">Monthly subscriptions</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatCurrency(monthlyTotal)} / month
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="min-h-9 flex-shrink-0 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
          >
            + Add
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-3 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-2.5">
          <input
            aria-label="Subscription name"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
            placeholder="Subscription name"
            maxLength="120"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label="Monthly amount"
              className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Monthly ₱"
              value={formData.monthlyAmount}
              onChange={(event) => setFormData({ ...formData, monthlyAmount: event.target.value })}
              required
            />
            <input
              aria-label="Next due date"
              className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-2 text-xs text-white [color-scheme:dark] focus:border-blue-500 focus:outline-none"
              type="date"
              value={formData.nextDueDate}
              onChange={(event) => setFormData({ ...formData, nextDueDate: event.target.value })}
              required
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="min-h-9 flex-1 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
              {busy ? 'Saving…' : editingId ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={resetForm} className="min-h-9 rounded-lg bg-zinc-800 px-3 text-xs font-semibold text-zinc-300 hover:bg-zinc-700">
              Cancel
            </button>
          </div>
        </form>
      )}

      {sortedSubscriptions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 px-3 py-4 text-center text-xs text-zinc-500">
          No subscriptions yet. Add one to track its monthly cost and due date.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedSubscriptions.map((subscription) => {
            const status = dueStatus(subscription.nextDueDate);
            return (
              <article key={subscription.id} className="flex min-w-[260px] flex-1 flex-col justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 px-3 py-2.5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-100">{subscription.name}</p>
                    <p className="text-xs text-zinc-500">{formatCurrency(subscription.monthlyAmount)} / month</p>
                  </div>
                  <span className={`flex-shrink-0 text-right text-xs font-medium ${status.color}`}>{status.label}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <button type="button" disabled={busy} onClick={() => handleMarkPaid(subscription)} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
                    Mark paid
                  </button>
                  <button type="button" disabled={busy} onClick={() => beginEdit(subscription)} className="text-xs text-zinc-400 hover:text-white disabled:opacity-50">
                    Edit
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleDelete(subscription)} className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SubscriptionPanel;
