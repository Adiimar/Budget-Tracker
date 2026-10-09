import React from 'react';
import { expenseAPI } from '../api/api';
import { formatCurrency } from '../utils/currency';
import { getCategoryStyle } from '../utils/categoryIcons';

const ExpenseList = ({ expenses, onExpenseDeleted }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(id);
        onExpenseDeleted();
      } catch (err) {
        alert('Failed to delete expense');
      }
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-2.5">
      {sortedExpenses.map((expense) => {
        const style = getCategoryStyle(expense.category);
        return (
          <div
            key={expense.id}
            className="group flex items-start sm:items-center gap-2.5 sm:gap-3 bg-zinc-950/60 hover:bg-zinc-800/60 p-3 sm:p-3.5 rounded-2xl border border-zinc-800 transition-colors duration-150"
          >
            <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-inner flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${style.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {style.icon}
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5">
                <p className="font-semibold text-white text-sm truncate">{expense.category}</p>
                <span className="text-white font-bold text-sm sm:text-base whitespace-nowrap">{formatCurrency(expense.amount)}</span>
              </div>
              <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-0.5 mt-0.5">
                <p className="text-zinc-500 text-xs truncate">{expense.description}</p>
                <span className="text-zinc-600 text-xs whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(expense.id)}
              className="min-w-10 min-h-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all duration-150 p-2 rounded-lg hover:bg-red-500/10 flex-shrink-0"
              aria-label="Delete expense"
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
  );
};

export default ExpenseList;