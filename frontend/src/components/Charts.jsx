import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils/currency';

const Charts = ({ expenses, view = 'all', compact = false }) => {
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += parseFloat(expense.amount);
    } else {
      acc.push({ name: expense.category, value: parseFloat(expense.amount) });
    }
    return acc;
  }, []);

  const dateData = expenses
    .reduce((acc, expense) => {
      const date = new Date(expense.date).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.amount += parseFloat(expense.amount);
      } else {
        acc.push({ date, amount: parseFloat(expense.amount) });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const PIE_COLORS = ['#93c5fd', '#bfdbfe', '#60a5fa', '#a5d8ff', '#7dd3fc', '#bae6fd', '#dbeafe'];

  const tooltipStyle = {
    backgroundColor: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '13px',
  };

  const tooltipItemStyle = {
    color: '#fff',
  };

  const tooltipLabelStyle = {
    color: '#fff',
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 px-2">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-zinc-400">
              {entry.value}: <span className="text-zinc-200 font-medium">{formatCurrency(categoryData[index]?.value || 0)}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const showCategory = view === 'all' || view === 'category';
  const showTrend = (view === 'all' || view === 'trend') && dateData.length > 0;

  return (
    <div className={`grid grid-cols-1 ${view === 'all' ? 'xl:grid-cols-2' : ''} gap-8`}>
      {showCategory && <div>
        <h3 className="font-semibold text-sm mb-4 text-zinc-400">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={compact ? 190 : 280}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="45%"
              outerRadius={compact ? 65 : 80}
              fill="#93c5fd"
              dataKey="value"
              stroke="#09090b"
              strokeWidth={2}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value)}
              contentStyle={tooltipStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
            />
            <Legend content={renderLegend} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>}

      {showTrend && (
        <div>
          <h3 className="font-semibold text-sm mb-4 text-zinc-400">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={compact ? 190 : 250}>
            <LineChart data={dateData}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={tooltipStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;