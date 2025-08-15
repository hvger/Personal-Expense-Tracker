import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, DollarSign, PoundSterling, ShoppingCart, Utensils, Car, RefreshCw, BarChart3, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Monthly Calendar Picker Component
const MonthlyCalendar = ({ value, onChange, availableMonths, onClose }) => {
  const currentDate = new Date();
  const [viewYear, setViewYear] = useState(
    value === 'current' 
      ? currentDate.getFullYear() 
      : parseInt(value.split('-')[0]) || currentDate.getFullYear()
  );

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const handleMonthSelect = (monthIndex) => {
    const monthKey = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange(monthKey);
    onClose();
  };

  const handleCurrentMonth = () => {
    onChange('current');
    onClose();
  };

  const isMonthAvailable = (monthIndex) => {
    const monthKey = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return availableMonths.some(month => month.value === monthKey);
  };

  const isCurrentMonth = (monthIndex) => {
    return value === 'current' && 
           viewYear === currentDate.getFullYear() && 
           monthIndex === currentDate.getMonth();
  };

  const isSelectedMonth = (monthIndex) => {
    if (value === 'current') return false;
    const monthKey = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    return value === monthKey;
  };

  return (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]">
      {/* Year Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewYear(viewYear - 1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800">{viewYear}</h3>
        <button
          onClick={() => setViewYear(viewYear + 1)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Current Month Button */}
      <button
        onClick={handleCurrentMonth}
        className={`w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          value === 'current'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Current Month
      </button>

      {/* Months Grid */}
      <div className="grid grid-cols-3 gap-2">
        {months.map((month, index) => {
          const isAvailable = isMonthAvailable(index);
          const isCurrent = isCurrentMonth(index);
          const isSelected = isSelectedMonth(index);
          
          return (
            <button
              key={month}
              onClick={() => isAvailable && handleMonthSelect(index)}
              disabled={!isAvailable}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isCurrent
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : isAvailable
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isReimbursement: false,
    reimbursementAmount: ''
  });

  const [showChart, setShowChart] = useState(false);
  const [chartMode, setChartMode] = useState('total'); // 'total' or 'net'
  const [chartPeriod, setChartPeriod] = useState('recent'); // 'recent' or specific month like '2025-08'
  
  // New state for grocery chart
  const [showGroceryChart, setShowGroceryChart] = useState(false);
  const [groceryChartPeriod, setGroceryChartPeriod] = useState('recent'); // 'recent' or specific month
  const [groceryChartMode, setGroceryChartMode] = useState('breakdown'); // 'breakdown' or 'total'
  
  // New state for summary period selection
  const [summaryPeriod, setSummaryPeriod] = useState('current'); // 'current' or specific month like '2025-08'

  // Calendar dropdown states
  const [showSummaryCalendar, setShowSummaryCalendar] = useState(false);
  const [showChartCalendar, setShowChartCalendar] = useState(false);
  const [showGroceryCalendar, setShowGroceryCalendar] = useState(false);

  // Refs for click outside detection
  const summaryCalendarRef = useRef(null);
  const chartCalendarRef = useRef(null);
  const groceryCalendarRef = useRef(null);

  const categories = [
    { value: 'Groceries', icon: ShoppingCart, color: 'bg-green-500' },
    { value: 'Dining', icon: Utensils, color: 'bg-blue-500' },
    { value: 'Small Shop', icon: ShoppingCart, color: 'bg-teal-500' },
    { value: 'Car - Fuel', icon: Car, color: 'bg-red-500' },
    { value: 'Car - Maintenance', icon: Car, color: 'bg-orange-500' },
    { value: 'Fuel Reimbursement', icon: RefreshCw, color: 'bg-purple-500' }
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (summaryCalendarRef.current && !summaryCalendarRef.current.contains(event.target)) {
        setShowSummaryCalendar(false);
      }
      if (chartCalendarRef.current && !chartCalendarRef.current.contains(event.target)) {
        setShowChartCalendar(false);
      }
      if (groceryCalendarRef.current && !groceryCalendarRef.current.contains(event.target)) {
        setShowGroceryCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load expenses from backend
  const loadExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Add new expense
  const addExpense = async () => {
    if (!formData.description || !formData.amount || !formData.category) return;

    const newExpense = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      isReimbursement: formData.isReimbursement,
      reimbursementAmount: formData.reimbursementAmount ? parseFloat(formData.reimbursementAmount) : 0
    };

    try {
      const response = await fetch("/api/expenses", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExpense)
      });

      if (response.ok) {
        const savedExpense = await response.json();
        setExpenses([savedExpense, ...expenses]);
        setFormData({
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          isReimbursement: false,
          reimbursementAmount: ''
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Calculate totals with reimbursement logic
  const fuelExpenses = expenses.filter(expense => expense.category === 'Car - Fuel');
  const fuelReimbursements = expenses.filter(expense => expense.category === 'Fuel Reimbursement');
  
  const totalFuelSpent = fuelExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalFuelReimbursements = fuelReimbursements.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate NET expenses (total expenses minus all reimbursements)
  const totalReimbursements = expenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
  const netExpenses = expenses.reduce((sum, expense) => {
    return expense.category === 'Fuel Reimbursement' ? sum - expense.amount : sum + expense.amount;
  }, 0) - totalReimbursements;

  const monthlyExpenses = expenses.filter(expense => {
    if (summaryPeriod === 'current') {
      // Current month logic
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      // Selected month logic
      const expenseMonth = new Date(expense.date);
      const [selectedYear, selectedMonth] = summaryPeriod.split('-');
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === summaryPeriod;
    }
  }).reduce((sum, expense) => {
    return expense.category === 'Fuel Reimbursement' ? sum - expense.amount : sum + expense.amount;
  }, 0) - expenses.filter(expense => {
    if (summaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === summaryPeriod;
    }
  }).reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);

  // Grocery-specific calculations
  const groceryExpenses = expenses.filter(expense => 
    expense.category === 'Groceries' || expense.category === 'Dining' || expense.category === 'Small Shop'
  );
  const totalGrocerySpent = groceryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const weeklyGroceryExpenses = groceryExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    return expenseDate >= weekStart;
  }).reduce((sum, expense) => sum + expense.amount, 0);
  
  const monthlyGroceryExpenses = groceryExpenses.filter(expense => {
    if (summaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === summaryPeriod;
    }
  }).reduce((sum, expense) => sum + expense.amount, 0);

  // Car-specific calculations
  const carExpenses = expenses.filter(expense => 
    expense.category === 'Car - Fuel' || expense.category === 'Car - Maintenance'
  );
  const totalCarSpent = carExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCarReimbursements = carExpenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
  const netCarExpenses = totalCarSpent - totalCarReimbursements - totalFuelReimbursements;

  // Helper function to get available months from expenses
  const getAvailableMonths = () => {
    const months = new Set();
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });
    
    return Array.from(months)
      .sort((a, b) => new Date(a + '-01') - new Date(b + '-01'))
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          value: monthKey,
          label: date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
        };
      });
  };

  // Helper function to get period display name
  const getPeriodDisplayName = (period, availableMonths) => {
    if (period === 'current') {
      return 'This Month';
    }
    const month = availableMonths.find(m => m.value === period);
    return month ? month.label : period;
  };

  const categoryTotals = categories.map(cat => {
    const categoryExpenses = expenses.filter(expense => expense.category === cat.value);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const reimbursements = categoryExpenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
    
    return {
      ...cat,
      total,
      reimbursements,
      net: total - reimbursements,
      count: categoryExpenses.length,
      isReimbursement: cat.value === 'Fuel Reimbursement'
    };
  }).filter(item => item.count > 0);

  // Fuel chart data function
  const getFuelChartData = () => {
    const periods = {};
    const fuelExpenses = expenses.filter(expense => expense.category === 'Car - Fuel');
    const fuelReimbursements = expenses.filter(expense => expense.category === 'Fuel Reimbursement');
    
    // Filter by selected period if not 'recent'
    const filteredFuelExpenses = chartPeriod === 'recent' ? fuelExpenses : 
      fuelExpenses.filter(expense => {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === chartPeriod;
      });
      
    const filteredFuelReimbursements = chartPeriod === 'recent' ? fuelReimbursements :
      fuelReimbursements.filter(expense => {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === chartPeriod;
      });
    
    // Group fuel expenses by period
    filteredFuelExpenses.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey, periodLabel;
      
      if (chartPeriod === 'recent') {
        // Weekly view for recent data
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        periodLabel = weekStart.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short' 
        });
      } else {
        // Daily view for specific month
        periodKey = date.toISOString().split('T')[0];
        periodLabel = date.getDate().toString();
      }
      
      if (!periods[periodKey]) {
        periods[periodKey] = { period: periodKey, total: 0, directReimbursements: 0, periodLabel };
      }
      periods[periodKey].total += expense.amount;
    });
    
    // Group fuel reimbursements by period
    filteredFuelReimbursements.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey, periodLabel;
      
      if (chartPeriod === 'recent') {
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        periodLabel = weekStart.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short' 
        });
      } else {
        periodKey = date.toISOString().split('T')[0];
        periodLabel = date.getDate().toString();
      }
      
      if (!periods[periodKey]) {
        periods[periodKey] = { period: periodKey, total: 0, directReimbursements: 0, periodLabel };
      }
      periods[periodKey].directReimbursements += expense.amount;
    });
    
    let sortedPeriods = Object.values(periods).sort((a, b) => new Date(a.period) - new Date(b.period));
    
    // Apply limit only for recent data
    if (chartPeriod === 'recent') {
      sortedPeriods = sortedPeriods.slice(-8); // Last 8 weeks
    }
    
    return sortedPeriods.map(period => ({
      ...period,
      net: period.total - period.directReimbursements
    }));
  };

  // New function for grocery chart data
  const getGroceryChartData = () => {
    const periods = {};
    const groceryExpenses = expenses.filter(expense => 
      expense.category === 'Groceries' || expense.category === 'Dining' || expense.category === 'Small Shop'
    );
    
    // Filter by selected period if not 'recent'
    const filteredGroceryExpenses = groceryChartPeriod === 'recent' ? groceryExpenses :
      groceryExpenses.filter(expense => {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === groceryChartPeriod;
      });
    
    // Group grocery, dining, and small shop expenses by period
    filteredGroceryExpenses.forEach(expense => {
      const date = new Date(expense.date);
      let periodKey, periodLabel;
      
      if (groceryChartPeriod === 'recent') {
        // Weekly view for recent data
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        periodKey = weekStart.toISOString().split('T')[0];
        periodLabel = weekStart.toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short' 
        });
      } else {
        // Daily view for specific month
        periodKey = date.toISOString().split('T')[0];
        periodLabel = date.getDate().toString();
      }
      
      if (!periods[periodKey]) {
        periods[periodKey] = { 
          period: periodKey, 
          groceries: 0, 
          dining: 0, 
          smallShop: 0,
          total: 0, 
          periodLabel 
        };
      }
      
      if (expense.category === 'Groceries') {
        periods[periodKey].groceries += expense.amount;
      } else if (expense.category === 'Dining') {
        periods[periodKey].dining += expense.amount;
      } else if (expense.category === 'Small Shop') {
        periods[periodKey].smallShop += expense.amount;
      }
      periods[periodKey].total += expense.amount;
    });
    
    let sortedPeriods = Object.values(periods).sort((a, b) => new Date(a.period) - new Date(b.period));
    
    // Apply limit only for recent data
    if (groceryChartPeriod === 'recent') {
      sortedPeriods = sortedPeriods.slice(-8); // Last 8 weeks
    }
    
    return sortedPeriods;
  };

  const chartData = getFuelChartData();
  const groceryChartData = getGroceryChartData();
  const availableMonths = getAvailableMonths();

  const showReimbursementFields = formData.category === 'Car - Fuel' || formData.category === 'Car - Maintenance';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <DollarSign className="text-blue-600" size={40} />
            Personal Expense Tracker
          </h1>
          <p className="text-gray-600">Track your groceries, dining, and car expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6 mb-8">
          {/* Overall Summary */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Overall Summary</h2>
              <div className="relative" ref={summaryCalendarRef}>
                <button
                  onClick={() => setShowSummaryCalendar(!showSummaryCalendar)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} />
                  {getPeriodDisplayName(summaryPeriod, availableMonths)}
                </button>
                {showSummaryCalendar && (
                  <MonthlyCalendar
                    value={summaryPeriod}
                    onChange={setSummaryPeriod}
                    availableMonths={availableMonths}
                    onClose={() => setShowSummaryCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Expenses (All)</p>
                    <p className="text-2xl font-bold text-purple-600">£{netExpenses.toFixed(2)}</p>
                  </div>
                  <PoundSterling className="text-purple-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(summaryPeriod, availableMonths)} (All)
                    </p>
                    <p className="text-2xl font-bold text-gray-900">£{monthlyExpenses.toFixed(2)}</p>
                  </div>
                  <ShoppingCart className="text-orange-500" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Grocery Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingCart className="text-green-600" size={20} />
              Grocery, Dining & Small Shop Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">£{totalGrocerySpent.toFixed(2)}</p>
                  </div>
                  <ShoppingCart className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-blue-600">£{weeklyGroceryExpenses.toFixed(2)}</p>
                  </div>
                  <Utensils className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(summaryPeriod, availableMonths)}
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">£{monthlyGroceryExpenses.toFixed(2)}</p>
                  </div>
                  <DollarSign className="text-indigo-500" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Car Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Car className="text-red-600" size={20} />
              Car Expenses Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Car Spent</p>
                    <p className="text-2xl font-bold text-gray-900">£{totalCarSpent.toFixed(2)}</p>
                  </div>
                  <Car className="text-red-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fuel Spent</p>
                    <p className="text-2xl font-bold text-orange-600">£{totalFuelSpent.toFixed(2)}</p>
                  </div>
                  <Car className="text-orange-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reimbursements</p>
                    <p className="text-2xl font-bold text-green-600">£{(totalCarReimbursements + totalFuelReimbursements).toFixed(2)}</p>
                  </div>
                  <RefreshCw className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Car Expenses</p>
                    <p className="text-2xl font-bold text-purple-600">£{netCarExpenses.toFixed(2)}</p>
                  </div>
                  <PoundSterling className="text-purple-500" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fuel Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="text-red-600" size={24} />
                  {chartPeriod === 'recent' ? 'Recent Fuel Spending' : `Fuel Spending - ${getPeriodDisplayName(chartPeriod, availableMonths)}`}
                </h3>
                <div className="flex gap-2">
                  <div className="relative" ref={chartCalendarRef}>
                    <button
                      onClick={() => setShowChartCalendar(!showChartCalendar)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Calendar size={16} />
                      {chartPeriod === 'recent' ? 'Last 8 Weeks' : getPeriodDisplayName(chartPeriod, availableMonths)}
                    </button>
                    {showChartCalendar && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]">
                        <button
                          onClick={() => {
                            setChartPeriod('recent');
                            setShowChartCalendar(false);
                          }}
                          className={`w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chartPeriod === 'recent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 8 Weeks
                        </button>
                        <MonthlyCalendar
                          value={chartPeriod}
                          onChange={(value) => {
                            setChartPeriod(value);
                            setShowChartCalendar(false);
                          }}
                          availableMonths={availableMonths}
                          onClose={() => setShowChartCalendar(false)}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowChart(!showChart)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {showChart ? 'Hide' : 'Show'}
                  </button>
                  {showChart && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setChartMode('total')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          chartMode === 'total' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Total
                      </button>
                      <button
                        onClick={() => setChartMode('net')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          chartMode === 'net' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Net
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {showChart && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodLabel" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`£${value.toFixed(2)}`, name]}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Legend />
                      {chartMode === 'total' ? (
                        <>
                          <Bar 
                            dataKey="total" 
                            fill="#ef4444" 
                            name="Total Spent"
                          />
                          <Bar 
                            dataKey="directReimbursements" 
                            fill="#06c42f" 
                            name="Fuel Reimbursements"
                          />
                        </>
                      ) : (
                        <Bar 
                          dataKey="net" 
                          fill="#6366f1" 
                          name="Net Spending"
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Grocery Chart */}
          {groceryChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="text-green-600" size={24} />
                  {groceryChartPeriod === 'recent' ? 'Recent Grocery & Dining' : `Grocery & Dining - ${getPeriodDisplayName(groceryChartPeriod, availableMonths)}`}
                </h3>
                <div className="flex gap-2">
                  <div className="relative" ref={groceryCalendarRef}>
                    <button
                      onClick={() => setShowGroceryCalendar(!showGroceryCalendar)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Calendar size={16} />
                      {groceryChartPeriod === 'recent' ? 'Last 8 Weeks' : getPeriodDisplayName(groceryChartPeriod, availableMonths)}
                    </button>
                    {showGroceryCalendar && (
                      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]">
                        <button
                          onClick={() => {
                            setGroceryChartPeriod('recent');
                            setShowGroceryCalendar(false);
                          }}
                          className={`w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            groceryChartPeriod === 'recent'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 8 Weeks
                        </button>
                        <MonthlyCalendar
                          value={groceryChartPeriod}
                          onChange={(value) => {
                            setGroceryChartPeriod(value);
                            setShowGroceryCalendar(false);
                          }}
                          availableMonths={availableMonths}
                          onClose={() => setShowGroceryCalendar(false)}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowGroceryChart(!showGroceryChart)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {showGroceryChart ? 'Hide' : 'Show'}
                  </button>
                  {showGroceryChart && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setGroceryChartMode('breakdown')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          groceryChartMode === 'breakdown' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Breakdown
                      </button>
                      <button
                        onClick={() => setGroceryChartMode('total')}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          groceryChartMode === 'total' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Total
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {showGroceryChart && (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groceryChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodLabel" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`£${value.toFixed(2)}`, name]}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Legend />
                      {groceryChartMode === 'breakdown' ? (
                        <>
                          <Bar 
                            dataKey="groceries" 
                            fill="#10b981" 
                            name="Groceries"
                          />
                          <Bar 
                            dataKey="dining" 
                            fill="#3b82f6" 
                            name="Dining"
                          />
                          <Bar 
                            dataKey="smallShop" 
                            fill="#14b8a6" 
                            name="Small Shop"
                          />
                        </>
                      ) : (
                        <Bar 
                          dataKey="total" 
                          fill="#6366f1" 
                          name="Total Spending"
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="text-blue-600" size={24} />
                Add Expense
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekly groceries, Gas fill-up"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {showReimbursementFields && (
                  <>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reimbursement"
                        checked={formData.isReimbursement}
                        onChange={(e) => setFormData({...formData, isReimbursement: e.target.checked})}
                        className="mr-2"
                      />
                      <label htmlFor="reimbursement" className="text-sm font-medium text-gray-700">
                        Work-related (reimbursable)
                      </label>
                    </div>

                    {formData.isReimbursement && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reimbursement Amount (£)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.reimbursementAmount}
                          onChange={(e) => setFormData({...formData, reimbursementAmount: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={addExpense}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <PlusCircle size={20} />
                  Add Expense
                </button>
              </div>
            </div>

            {/* Category Breakdown */}
            {categoryTotals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Summary</h3>
                <div className="space-y-3">
                  {categoryTotals.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div key={item.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${item.color}`}>
                            <IconComponent className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.value}</p>
                            <p className="text-sm text-gray-600">{item.count} entries</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {item.isReimbursement ? '+' : '-'}£{item.total.toFixed(2)}
                          </p>
                          {item.reimbursements > 0 && (
                            <p className="text-sm text-green-600">+£{item.reimbursements.toFixed(2)}</p>
                          )}
                          {(item.reimbursements > 0 || item.isReimbursement) && (
                            <p className="text-sm font-medium text-purple-600">
                              £{item.isReimbursement ? item.total.toFixed(2) : item.net.toFixed(2)} net
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
                <button
                  onClick={loadExpenses}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No expenses found. Add your first expense!</p>
                  </div>
                ) : (
                  expenses.map(expense => {
                    const category = categories.find(cat => cat.value === expense.category);
                    const IconComponent = category?.icon || DollarSign;
                    const netAmount = expense.amount - (expense.reimbursementAmount || 0);
                    const isReimbursement = expense.category === 'Fuel Reimbursement';
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${category?.color || 'bg-gray-500'}`}>
                            <IconComponent className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{expense.description}</p>
                            <p className="text-sm text-gray-500">{expense.category} • {expense.date}</p>
                            {expense.reimbursementAmount > 0 && (
                              <p className="text-sm text-green-600">Reimbursable: £{expense.reimbursementAmount.toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-lg font-semibold ${isReimbursement ? 'text-green-600' : 'text-red-600'}`}>
                              {isReimbursement ? '+' : '-'}£{expense.amount.toFixed(2)}
                            </span>
                            {expense.reimbursementAmount > 0 && (
                              <p className="text-sm font-medium text-purple-600">
                                £{netAmount.toFixed(2)} net
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;