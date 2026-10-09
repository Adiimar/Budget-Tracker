import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI, budgetAPI, savingAPI } from '../api/api';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BudgetSummary from '../components/BudgetSummary';
import Charts from '../components/Charts';
import SavingsSection from '../components/SavingsSection';
import SavingsChart from '../components/SavingsChart';
import { formatCurrency } from '../utils/currency';
import SavingsWithdrawals from '../components/SavingsWithdrawals';

const Dashboard = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [statisticsView, setStatisticsView] = useState('category');
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const userName = localStorage.getItem('userName');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // allSettled: if one request fails, the others still load
      const [expenseRes, budgetRes, savingsRes] = await Promise.allSettled([
        expenseAPI.getAll(),
        budgetAPI.getAll(),
        savingAPI.getAll(),
      ]);

      if (expenseRes.status === 'fulfilled') setExpenses(expenseRes.value.data);
      if (budgetRes.status === 'fulfilled') setBudgets(budgetRes.value.data);
      if (savingsRes.status === 'fulfilled') setSavings(savingsRes.value.data);

      [expenseRes, budgetRes, savingsRes].forEach((r) => {
        if (r.status === 'rejected') {
          console.error('Fetch failed:', r.reason);
          const status = r.reason?.response?.status;
          if (status === 401 || status === 403) {
            navigate('/login');
          }
        }
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  const handleExpenseAdded = () => {
    setShowExpenseForm(false);
    fetchData();
  };
  
  // Expenses paid from savings must not reduce the remaining balance
  const balanceExpenses = expenses.filter((e) => e.source !== 'SAVINGS');
  const totalSpent = balanceExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limitAmount || 0), 0);
  
  // Money moved into savings leaves the balance (withdrawals don't touch it)
  const totalMovedToSavings = savings
    .filter((s) => s.type !== 'WITHDRAWAL')
    .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
  
  const remaining = totalBudget - totalSpent - totalMovedToSavings;
  const totalSavings = savings.reduce(
    (sum, s) => sum + (s.type === 'WITHDRAWAL' ? -parseFloat(s.amount || 0) : parseFloat(s.amount || 0)),
    0
  );

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentExpenses = sortedExpenses.slice(0, 3);
  const filteredExpenses = filterDate
    ? sortedExpenses.filter((e) => {
        const expenseDate = new Date(e.date).toISOString().split('T')[0];
        return expenseDate === filterDate;
      })
    : sortedExpenses;
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-zinc-800 border-t-emerald-500 rounded-full animate-spin" />
          <div className="text-zinc-400 font-medium">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-900 sticky top-0 z-10 bg-zinc-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-2.5 shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Budget Tracker</h1>
              <p className="text-zinc-500 text-sm">Welcome back, {userName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <nav aria-label="Main navigation" className="grid w-full grid-cols-3 gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1 sm:w-auto">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'savings', label: 'Savings' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  aria-current={activeView === item.id ? 'page' : undefined}
                  className={`min-h-11 rounded-lg px-2 sm:px-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="min-h-11 self-end sm:self-auto bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium py-2 px-3 sm:px-4 rounded-xl transition-colors duration-150 flex items-center gap-2 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
        {activeView === 'dashboard' ? (
          <>
        {/* Hero balance card */}
        <div className="glass-card rounded-3xl border p-4 sm:p-8 mb-5 sm:mb-6">
          <p className="text-zinc-400 text-sm font-medium">Remaining</p>
          <p
            className={`text-3xl sm:text-5xl font-bold mt-1 tracking-tight break-words ${
              remaining < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {formatCurrency(remaining)}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-5 sm:mt-6">
            <div className="glass-tile border rounded-2xl px-3 sm:px-4 py-3">
              <p className="text-zinc-500 text-xs font-medium">Total Budget</p>
              <p className="text-sm sm:text-lg font-bold mt-0.5 break-words">{formatCurrency(totalBudget)}</p>
            </div>
            <div className="glass-tile border rounded-2xl px-3 sm:px-4 py-3">
              <p className="text-zinc-500 text-xs font-medium">Total Spent</p>
              <p className="text-sm sm:text-lg font-bold mt-0.5 break-words">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="glass-tile border rounded-2xl px-3 sm:px-4 py-3">
              <p className="text-zinc-500 text-xs font-medium">Expenses Logged</p>
              <p className="text-sm sm:text-lg font-bold mt-0.5">{expenses.length}</p>
            </div>
            <div className="glass-tile border rounded-2xl px-3 sm:px-4 py-3">
              <p className="text-zinc-500 text-xs font-medium">Savings</p>
              <p className="text-sm sm:text-lg font-bold mt-0.5 break-words">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-5 sm:mb-6">
          {/* Add Expense Section */}
          <div className="glass-card rounded-3xl border p-4 sm:p-6">
            <button
              onClick={() => setShowExpenseForm(!showExpenseForm)}
              className={`w-full font-semibold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                showExpenseForm
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white'
              }`}
            >
              {showExpenseForm ? (
                'Cancel'
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Expense
                </>
              )}
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showExpenseForm ? 'max-h-[1200px] opacity-100 mt-5' : 'max-h-0 opacity-0'
              }`}
            >
              <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
          </div>

          <BudgetSummary
            budgets={budgets}
            onBudgetDeleted={fetchData}
            showOverview={false}
          />
        </div>

        {/* Recent Transactions */}
        <div className="glass-card rounded-3xl border p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold">Recent Transactions</h2>
              <p className="text-zinc-500 text-sm mt-0.5">Showing the latest {Math.min(expenses.length, 3)} of {expenses.length}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('transactions')}
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View all
            </button>
          </div>
          {recentExpenses.length > 0 ? (
            <ExpenseList expenses={recentExpenses} onExpenseDeleted={fetchData} />
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-800 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-zinc-400 font-medium">No transactions yet</p>
              <p className="text-zinc-600 text-sm mt-1">Add an expense to see it here.</p>
            </div>
          )}
        </div>
          </>
        ) : activeView === 'savings' ? (
          <>
            <div className="glass-card rounded-3xl border p-4 sm:p-8 mb-5 sm:mb-6 flex flex-wrap items-end justify-between gap-4 sm:gap-5">
              <div>
                <p className="text-zinc-400 text-sm font-medium">Total Savings</p>
                <p className="text-3xl sm:text-5xl font-bold mt-1 tracking-tight text-blue-400 break-words">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <div className="glass-tile border rounded-2xl px-4 py-3 w-full sm:w-auto sm:min-w-[180px]">
                <p className="text-zinc-500 text-xs font-medium">Available to save</p>
                <p className={`text-lg font-bold mt-0.5 ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
              <div className="xl:col-span-2 space-y-4 sm:space-y-6">
                <SavingsSection savings={savings} remaining={remaining} onSavingsChanged={fetchData} />
                <SavingsWithdrawals savings={savings} onSavingsChanged={fetchData} />
              </div>
              <div className="glass-card rounded-3xl border p-4 sm:p-6">
                <h2 className="text-lg font-bold mb-4 text-blue-400">Savings Trend</h2>
                <SavingsChart savings={savings} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <BudgetSummary
                budgets={budgets}
                onBudgetDeleted={fetchData}
                showAddBudget={false}
              />
            </div>
            {expenses.length > 0 && (
              <section className="glass-card rounded-3xl border p-4 sm:p-6 mb-5 sm:mb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div>
                    <h2 className="text-lg font-bold">Statistics</h2>
                    <p className="text-zinc-400 text-sm mt-0.5">Your spending at a glance</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
                      {[
                        { id: 'category', label: 'Category' },
                        { id: 'trend', label: 'Trend' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStatisticsView(item.id)}
                          aria-pressed={statisticsView === item.id}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            statisticsView === item.id
                              ? 'bg-zinc-800 text-white'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <p className="hidden text-sm text-zinc-400 sm:block">
                      {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
                    </p>
                  </div>
                </div>
                <Charts expenses={expenses} view={statisticsView} compact />
              </section>
            )}
            <div className="glass-card rounded-3xl border p-4 sm:p-8 mb-5 sm:mb-6">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">Transaction history</p>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-1">All transactions</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs font-medium">Transactions</p>
                    <p className="text-lg font-bold mt-0.5">{filteredExpenses.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs font-medium">Total shown</p>
                    <p className="text-lg font-bold mt-0.5">{formatCurrency(filteredTotal)}</p>
                  </div>
                </div>
              </div>
            </div>

            <section className="glass-card rounded-3xl border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-5 sm:mb-6">
                <div>
                  <h2 className="text-lg font-bold">Browse transactions</h2>
                  <p className="text-zinc-500 text-sm mt-0.5">
                    {showAllTransactions ? 'Grouped by month, newest first' : `Latest ${Math.min(filteredExpenses.length, 5)} of ${filteredExpenses.length}, newest first`}
                  </p>
                </div>
                <div className="flex w-full sm:w-auto items-center gap-2">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <input
                      type="date"
                      aria-label="Filter transactions by date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="min-h-11 w-full sm:w-auto min-w-0 pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                  {filterDate && (
                    <button
                      onClick={() => setFilterDate('')}
                      className="min-h-11 shrink-0 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-xl transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              {filteredExpenses.length > 0 ? (
                <div className="space-y-8">
                  {Object.entries(
                    (showAllTransactions ? filteredExpenses : filteredExpenses.slice(0, 5)).reduce((groups, expense) => {
                      const month = new Date(expense.date).toLocaleString(undefined, { month: 'long', year: 'numeric' });
                      if (!groups[month]) groups[month] = [];
                      groups[month].push(expense);
                      return groups;
                    }, {})
                  ).map(([month, monthExpenses]) => (
                    <section key={month} aria-label={month}>
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <h3 className="text-sm font-semibold text-zinc-300">{month}</h3>
                        <p className="text-xs text-zinc-500">
                          {formatCurrency(monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0))}
                        </p>
                      </div>
                      <ExpenseList expenses={monthExpenses} onExpenseDeleted={fetchData} />
                    </section>
                  ))}
                  {filteredExpenses.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTransactions((showAll) => !showAll)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 px-4 py-3 text-sm font-semibold text-emerald-400 transition-colors"
                    >
                      {showAllTransactions ? 'Show less' : `View all ${filteredExpenses.length} transactions`}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-400 font-medium">
                    {filterDate ? 'No transactions on this date' : 'No transactions yet'}
                  </p>
                  <p className="text-zinc-600 text-sm mt-1">
                    {filterDate ? 'Try another date or clear the filter.' : 'Add an expense to start building your history.'}
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;