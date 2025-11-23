import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, PlusCircle, Trash2,CreditCard, Wrench, Wifi, House, DollarSign, PoundSterling, ShoppingCart, Utensils, Car, RefreshCw, BarChart3, Calendar, ChevronLeft, ChevronRight,  CheckCircle, XCircle, Info, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, LineChart, Line } from 'recharts';


const sampleExpenses = [
  {
    id: '1',
    description: 'Weekly Groceries',
    amount: 85.50,
    category: 'Groceries',
    date: '2024-01-15',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    description: 'Fuel Fill-up',
    amount: 65.00,
    category: 'Car - Fuel',
    date: '2024-01-14',
    isReimbursement: true,
    reimbursementAmount: 45.00,
    timestamp: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    description: 'Dinner at Restaurant',
    amount: 42.75,
    category: 'Dining',
    date: '2024-01-13',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2024-01-13T19:45:00Z'
  },
  {
    id: '4',
    description: 'Monthly Rent',
    amount: 1200.00,
    category: 'Rent and Council Tax',
    date: '2024-01-01',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2024-01-01T09:00:00Z'
  },
  // Add more sample data from previous months
  {
    id: '5',
    description: 'December Groceries',
    amount: 92.30,
    category: 'Groceries',
    date: '2023-12-10',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2023-12-10T11:20:00Z'
  },
  {
    id: '6',
    description: 'Car Maintenance',
    amount: 120.00,
    category: 'Car - Other',
    date: '2023-12-05',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2023-12-05T14:00:00Z'
  },
  {
    id: '7',
    description: 'November Rent',
    amount: 1200.00,
    category: 'Rent and Council Tax',
    date: '2023-11-01',
    isReimbursement: false,
    reimbursementAmount: 0,
    timestamp: '2023-11-01T09:00:00Z'
  }
];
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
  const [expenses, setExpenses] = useState(sampleExpenses);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isReimbursement: false,
    reimbursementAmount: ''
  });

   // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Toast functions
  const addToast = (message, type = 'info') => {
    const id = Date.now().toString();
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Toast component
  const Toast = ({ toast }) => {
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[toast.type];

    const IconComponent = {
      success: CheckCircle,
      error: XCircle,
      info: Info
    }[toast.type];

    return (
      <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg mb-2 flex items-center justify-between min-w-80 max-w-md transform transition-transform duration-300 translate-x-0`}>
        <div className="flex items-center gap-2">
          <IconComponent size={20} />
          <span>{toast.message}</span>
        </div>
        <button
          onClick={() => removeToast(toast.id)}
          className="text-white hover:text-gray-200 ml-4"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  

  // Separate periods for donut charts
  const [donutCarPeriod, setDonutCarPeriod] = useState('recent');
  const [donutGroceryPeriod, setDonutGroceryPeriod] = useState('recent');

  // Separate calendar visibility states for donut charts
  const [showDonutCarCalendar, setShowDonutCarCalendar] = useState(false);
  const [showDonutGroceryCalendar, setShowDonutGroceryCalendar] = useState(false);

  // Separate refs for donut chart calendars
  const donutCarCalendarRef = useRef(null);
  const donutGroceryCalendarRef = useRef(null);
  
  const [showCarBarChart, setShowCarBarChart] = useState(false);
  const [showCarPieChart, setShowCarPieChart] = useState(false);
  const [chartMode, setChartMode] = useState('total'); // 'total' or 'net'
  const [chartPeriod, setChartPeriod] = useState('recent'); // 'recent' or specific month like '2025-08'

  // Trend chart states
  const [showTrendChart, setShowTrendChart] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState('6'); // 3, 6, 12, all
  const [trendChartData, setTrendChartData] = useState([]);
  
  // New state for grocery chart
  const [showGroceryBarChart, setShowGroceryBarChart] = useState(false);
  const [showGroceryPieChart, setShowGroceryPieChart] = useState(false);
  const [groceryChartPeriod, setGroceryChartPeriod] = useState('recent'); // 'recent' or specific month
  const [groceryChartMode, setGroceryChartMode] = useState('breakdown'); // 'breakdown' or 'total'
  
  // New state for summary period selection - separate for each section
  const [grocerySummaryPeriod, setGrocerySummaryPeriod] = useState('current'); // 'current' or specific month like '2025-08'
  const [carSummaryPeriod, setCarSummaryPeriod] = useState('current'); // 'current' or specific month like '2025-08'
  const [housingSummaryPeriod, setHousingSummaryPeriod] = useState('current'); // Added missing state
  
  // New state for transaction modal
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [modalTransactions, setModalTransactions] = useState([]);
  const [modalTitle, setModalTitle] = useState('');

  const [totalSummaryPeriod, setTotalSummaryPeriod] = useState('current');
  const [showTotalSummaryCalendar, setShowTotalSummaryCalendar] = useState(false);
  const totalSummaryCalendarRef = useRef(null);

  // Calendar dropdown states
  const [showOverallSummaryCalendar, setShowOverallSummaryCalendar] = useState(false);
  const [showGrocerySummaryCalendar, setShowGrocerySummaryCalendar] = useState(false);
  const [showCarSummaryCalendar, setShowCarSummaryCalendar] = useState(false);
  const [showHousingSummaryCalendar, setShowHousingSummaryCalendar] = useState(false); // Added missing state
  const [showChartCalendar, setShowChartCalendar] = useState(false);
  const [showGroceryCalendar, setShowGroceryCalendar] = useState(false);

  const [showExpensesList, setShowExpensesList] = useState(false);

  // Add these state variables to your component
  const [lastMonthSummaryPeriod, setLastMonthSummaryPeriod] = useState(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  });

 const [showLastMonthSummaryCalendar, setShowLastMonthSummaryCalendar] = useState(false);
 const lastMonthSummaryCalendarRef = useRef(null);
  

  // Refs for click outside detection
  const overallSummaryCalendarRef = useRef(null);
  const grocerySummaryCalendarRef = useRef(null);
  const carSummaryCalendarRef = useRef(null);
  const housingSummaryCalendarRef = useRef(null); // Added missing ref
  const chartCalendarRef = useRef(null);
  const groceryCalendarRef = useRef(null);

   const categories = [
    { value: 'Groceries', icon: ShoppingCart, color: 'bg-green-500' },
    { value: 'Dining', icon: Utensils, color: 'bg-blue-500' },
    { value: 'Small Shop', icon: ShoppingCart, color: 'bg-teal-500' },
    { value: 'Car - Fuel', icon: Car, color: 'bg-red-500' },
    { value: 'Car - Other', icon: Car, color: 'bg-orange-500' },
    { value: 'Fuel Reimbursement', icon: RefreshCw, color: 'bg-purple-500' },
    { value: 'Rent and Council Tax', icon: House, color: 'bg-indigo-500' },
    { value: 'Utilities', icon: Wrench, color: 'bg-yellow-500' },
    { value: 'Internet', icon: Wifi, color: 'bg-pink-500' }
  ];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (overallSummaryCalendarRef.current && !overallSummaryCalendarRef.current.contains(event.target)) {
        setShowOverallSummaryCalendar(false);
      }
      if (grocerySummaryCalendarRef.current && !grocerySummaryCalendarRef.current.contains(event.target)) {
        setShowGrocerySummaryCalendar(false);
      }
      if (carSummaryCalendarRef.current && !carSummaryCalendarRef.current.contains(event.target)) {
        setShowCarSummaryCalendar(false);
      }
      if (housingSummaryCalendarRef.current && !housingSummaryCalendarRef.current.contains(event.target)) {
        setShowHousingSummaryCalendar(false);
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

  useEffect(() => {
    if (showTrendChart) {
      calculateTrendData();
    }
  }, [expenses, trendPeriod, showTrendChart]);


  // Load expenses
  const loadExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        addToast('Expenses loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      addToast('Failed to load expenses', 'error');
    }
  };

  // Add new expense
  const addExpense = async () => {
    if (!formData.description || !formData.amount || !formData.category) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

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
        addToast('Expense added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      addToast('Failed to add expense', 'error');
    }
  };

  // Delete expense with confirmation
  const confirmDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirm(true);
  };

  const deleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
        addToast('Expense deleted successfully', 'success');
      } else {
        addToast('Failed to delete expense', 'error');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      addToast('Failed to delete expense', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
    }
  };

  // Edit expense
  const editExpense = async (expenseData) => {
    try {
      const response = await fetch(`/api/expenses/${expenseData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        await response.json();
        loadExpenses();
        setShowEditModal(false);
        setEditingExpense(null);
        addToast('Expense updated successfully!', 'success');
      } else {
        addToast('Failed to update expense', 'error');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      addToast('Failed to update expense', 'error');
    }
  };

  // Handle edit click
  const handleEditClick = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      isReimbursement: expense.isReimbursement || false,
      reimbursementAmount: expense.reimbursementAmount ? expense.reimbursementAmount.toString() : ''
    });
    setShowEditModal(true);
  };

  // Duplicate expense
  const duplicateExpense = async (expenseData) => {
    try {
      const newExpense = {
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date,
        isReimbursement: expenseData.isReimbursement,
        reimbursementAmount: expenseData.reimbursementAmount
      };

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
        setShowDuplicateModal(false);
        setEditingExpense(null);
        addToast('Expense duplicated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error duplicating expense:', error);
      addToast('Failed to duplicate expense', 'error');
    }
  };

  // Handle duplicate click with info toast
  const handleDuplicateClick = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description + ' (Copy)',
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date().toISOString().split('T')[0],
      isReimbursement: expense.isReimbursement || false,
      reimbursementAmount: expense.reimbursementAmount ? expense.reimbursementAmount.toString() : ''
    });
    setShowDuplicateModal(true);
    addToast('Expense copied to form', 'info');
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

  // Calculate trend data
  const calculateTrendData = () => {
    const periods = [];
    const currentDate = new Date();
    const monthCount = trendPeriod === 'all' ? 24 : parseInt(trendPeriod); // Show up to 24 months for "all"
    
    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      
      // Calculate totals for this month
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return expenseMonthKey === monthKey;
      });

      // Housing expenses
      const housingTotal = monthlyExpenses
        .filter(expense => ['Rent and Council Tax', 'Utilities', 'Internet'].includes(expense.category))
        .reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);

      // Grocery & Dining expenses
      const groceryTotal = monthlyExpenses
        .filter(expense => ['Groceries', 'Dining', 'Small Shop'].includes(expense.category))
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Car expenses (net)
      const carTotal = monthlyExpenses
        .filter(expense => ['Car - Fuel', 'Car - Other', 'Fuel Reimbursement'].includes(expense.category))
        .reduce((sum, expense) => {
          if (expense.category === 'Fuel Reimbursement') {
            return sum - expense.amount;
          }
          return sum + expense.amount - (expense.reimbursementAmount || 0);
        }, 0);

      const total = housingTotal + groceryTotal + carTotal;

      periods.push({
        month: monthKey,
        monthName,
        housing: housingTotal,
        grocery: groceryTotal,
        car: Math.max(0, carTotal), // Ensure car expenses don't go negative
        total
      });
    }

    setTrendChartData(periods);
  };

  const monthlyExpenses = expenses.filter(expense => {
    if (grocerySummaryPeriod === 'current') {
      // Current month logic
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      // Selected month logic
      const expenseMonth = new Date(expense.date);
      const [selectedYear, selectedMonth] = grocerySummaryPeriod.split('-');
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === grocerySummaryPeriod;
    }
  }).reduce((sum, expense) => {
    return expense.category === 'Fuel Reimbursement' ? sum - expense.amount : sum + expense.amount;
  }, 0) - expenses.filter(expense => {
    if (grocerySummaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === grocerySummaryPeriod;
    }
  }).reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);

  // Grocery-specific calculations
  const groceryExpenses = expenses.filter(expense => 
    expense.category === 'Groceries' || expense.category === 'Dining' || expense.category === 'Small Shop'
  );
  const totalGrocerySpent = groceryExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Grocery-specific calculations by category
  const getMonthlyGroceriesByCategory = (category) => {
    return groceryExpenses.filter(expense => {
      const matchesCategory = expense.category === category;
      if (!matchesCategory) return false;
      
      if (grocerySummaryPeriod === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === grocerySummaryPeriod;
      }
    }).reduce((sum, expense) => sum + expense.amount, 0);
  };

  const monthlyGroceries = getMonthlyGroceriesByCategory('Groceries');
  const monthlyDining = getMonthlyGroceriesByCategory('Dining');
  const monthlySmallShop = getMonthlyGroceriesByCategory('Small Shop');

  const monthlyGroceryExpenses = groceryExpenses.filter(expense => {
    if (grocerySummaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === grocerySummaryPeriod;
    }
  }).reduce((sum, expense) => sum + expense.amount, 0);

  // Car-specific calculations
  const carExpenses = expenses.filter(expense => 
    expense.category === 'Car - Fuel' || expense.category === 'Car - Other'
  );
  const totalCarSpent = carExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCarReimbursements = carExpenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
  const netCarExpenses = totalCarSpent - totalCarReimbursements - totalFuelReimbursements;

  // Monthly car calculations by category
  const getMonthlyCarByCategory = (category) => {
    return expenses.filter(expense => {
      const matchesCategory = expense.category === category;
      if (!matchesCategory) return false;
      
      if (carSummaryPeriod === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === carSummaryPeriod;
      }
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);
  };

  const monthlyCarFuel = getMonthlyCarByCategory('Car - Fuel');
  const monthlyCarOther = getMonthlyCarByCategory('Car - Other');

  // Calculate monthly fuel reimbursements
  const monthlyFuelReimbursements = expenses.filter(expense => {
    const matchesCategory = expense.category === 'Fuel Reimbursement';
    if (!matchesCategory) return false;
    
    if (carSummaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === carSummaryPeriod;
    }
  }).reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate monthly car reimbursements (both direct reimbursements and fuel reimbursements)
  const monthlyCarReimbursements = expenses.filter(expense => {
    if (carSummaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === carSummaryPeriod;
    }
  }).reduce((sum, expense) => {
    // Include fuel reimbursements and direct reimbursements from car expenses
    if (expense.category === 'Fuel Reimbursement') {
      return sum + expense.amount;
    }
    if (expense.category === 'Car - Fuel' || expense.category === 'Car - Other') {
      return sum + (expense.reimbursementAmount || 0);
    }
    return sum;
  }, 0);

  const monthlyNetCarExpenses = monthlyCarFuel + monthlyCarOther - monthlyFuelReimbursements;

  // Housing-specific calculations by category - 
  const getMonthlyHousingByCategory = (category) => {
    return expenses.filter(expense => {
      const matchesCategory = expense.category === category;
      if (!matchesCategory) return false;
      
      if (housingSummaryPeriod === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === housingSummaryPeriod;
      }
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);
  };

  const monthlyRentCouncil = getMonthlyHousingByCategory('Rent and Council Tax');
  const monthlyUtilities = getMonthlyHousingByCategory('Utilities');
  const monthlyInternet = getMonthlyHousingByCategory('Internet');

  // Calculate total monthly housing expenses
  const monthlyHousingExpenses = expenses.filter(expense => {
    const isHousingCategory = ['Rent and Council Tax', 'Utilities', 'Internet'].includes(expense.category);
    if (!isHousingCategory) return false;
    
    if (housingSummaryPeriod === 'current') {
      const expenseMonth = new Date(expense.date).getMonth();
      const currentMonth = new Date().getMonth();
      const expenseYear = new Date(expense.date).getFullYear();
      const currentYear = new Date().getFullYear();
      return expenseMonth === currentMonth && expenseYear === currentYear;
    } else {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === housingSummaryPeriod;
    }
  }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);

  const monthlyNetTotal = monthlyHousingExpenses;

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



  // NEW: Calculate comparison month total using existing logic
  const getComparisonMonthTotal = () => {
    // Get month name from the period
    const [year, month] = lastMonthSummaryPeriod.split('-');
    const comparisonDate = new Date(parseInt(year), parseInt(month) - 1);
    const comparisonMonthName = comparisonDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    
    // Use lastMonthSummaryPeriod directly in filtering logic instead of modifying state
    
    // Calculate grocery expenses for comparison month
    const lastMonthGroceryExpenses = groceryExpenses.filter(expense => {
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === lastMonthSummaryPeriod;
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate car expenses for comparison month
    const lastMonthCarExpenses = expenses.filter(expense => {
      const matchesCategory = ['Car - Fuel', 'Car - Other'].includes(expense.category);
      if (!matchesCategory) return false;
      
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === lastMonthSummaryPeriod;
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);
    
    // Calculate fuel reimbursements for comparison month
    const lastMonthFuelReimbursements = expenses.filter(expense => {
      const matchesCategory = expense.category === 'Fuel Reimbursement';
      if (!matchesCategory) return false;
      
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === lastMonthSummaryPeriod;
    }).reduce((sum, expense) => sum + expense.amount, 0);
    
    const lastMonthNetCarExpenses = lastMonthCarExpenses - lastMonthFuelReimbursements;
    
    // Calculate housing expenses for comparison month
    const lastMonthHousingExpenses = expenses.filter(expense => {
      const isHousingCategory = ['Rent and Council Tax', 'Utilities', 'Internet'].includes(expense.category);
      if (!isHousingCategory) return false;
      
      const expenseMonth = new Date(expense.date);
      const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === lastMonthSummaryPeriod;
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);
    
    return {
      total: lastMonthGroceryExpenses + lastMonthNetCarExpenses + lastMonthHousingExpenses,
      monthName: comparisonMonthName
    };
  };
  
  // Calculate monthly totals using totalSummaryPeriod for the main summary
  const getMonthlyTotalsByPeriod = (period) => {
    // Housing expenses for the selected period
    const housingExpensesForPeriod = expenses.filter(expense => {
      const isHousingCategory = ['Rent and Council Tax', 'Utilities', 'Internet'].includes(expense.category);
      if (!isHousingCategory) return false;
      
      if (period === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === period;
      }
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);

    // Grocery expenses for the selected period
    const groceryExpensesForPeriod = groceryExpenses.filter(expense => {
      if (period === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === period;
      }
    }).reduce((sum, expense) => sum + expense.amount, 0);

    // Car expenses for the selected period
    const carExpensesForPeriod = expenses.filter(expense => {
      const matchesCategory = ['Car - Fuel', 'Car - Other'].includes(expense.category);
      if (!matchesCategory) return false;
      
      if (period === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === period;
      }
    }).reduce((sum, expense) => sum + expense.amount - (expense.reimbursementAmount || 0), 0);

    // Fuel reimbursements for the selected period
    const fuelReimbursementsForPeriod = expenses.filter(expense => {
      const matchesCategory = expense.category === 'Fuel Reimbursement';
      if (!matchesCategory) return false;
      
      if (period === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === period;
      }
    }).reduce((sum, expense) => sum + expense.amount, 0);

    const netCarExpensesForPeriod = carExpensesForPeriod - fuelReimbursementsForPeriod;

    return {
      housing: housingExpensesForPeriod,
      grocery: groceryExpensesForPeriod,
      car: netCarExpensesForPeriod,
      total: housingExpensesForPeriod + groceryExpensesForPeriod + netCarExpensesForPeriod
    };
  };

  // Get totals for the main summary period
  const mainSummaryTotals = getMonthlyTotalsByPeriod(totalSummaryPeriod);
  
    // Calculate current month total
  const monthlyTotalSpent = mainSummaryTotals.total;
  const lastMonthData = getComparisonMonthTotal();
  const lastMonthTotalSpent = lastMonthData.total;

  const [showMonthlySummaryChart, setShowMonthlySummaryChart] = useState(false);
  

  const getDonutChartData = (period, chartType) => {
    if (chartType === 'car') {
      return expenses.filter(expense => {
        const matchesCategory = ['Car - Fuel', 'Car - Other', 'Fuel Reimbursement'].includes(expense.category);
        if (!matchesCategory) return false;
        
        if (period === 'recent') {
          // Last 8 weeks logic
          const eightWeeksAgo = new Date();
          eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
          return new Date(expense.date) >= eightWeeksAgo;
        } else {
          // Monthly logic
          const expenseMonth = new Date(expense.date);
          const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
          return monthKey === period;
        }
      });
    } else if (chartType === 'grocery') {
      return expenses.filter(expense => {
        const matchesCategory = ['Groceries', 'Dining', 'Small Shop'].includes(expense.category);
        if (!matchesCategory) return false;
        
        if (period === 'recent') {
          // Last 8 weeks logic
          const eightWeeksAgo = new Date();
          eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
          return new Date(expense.date) >= eightWeeksAgo;
        } else {
          // Monthly logic
          const expenseMonth = new Date(expense.date);
          const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
          return monthKey === period;
        }
      });
    }
    return [];
  };

  // Donut Chart Data - Car
  const donutCarData = getDonutChartData(donutCarPeriod, 'car');
  const donutCarTotals = {
    fuel: donutCarData.filter(e => e.category === 'Car - Fuel').reduce((sum, e) => sum + e.amount, 0),
    carOther: donutCarData.filter(e => e.category === 'Car - Other').reduce((sum, e) => sum + e.amount, 0),
    directReimbursements: donutCarData.filter(e => e.category === 'Fuel Reimbursement').reduce((sum, e) => sum + e.amount, 0)
  };

  // Donut Chart Data - Grocery
  const donutGroceryData = getDonutChartData(donutGroceryPeriod, 'grocery');
  const donutGroceryTotals = {
    groceries: donutGroceryData.filter(e => e.category === 'Groceries').reduce((sum, e) => sum + e.amount, 0),
    dining: donutGroceryData.filter(e => e.category === 'Dining').reduce((sum, e) => sum + e.amount, 0),
    smallShop: donutGroceryData.filter(e => e.category === 'Small Shop').reduce((sum, e) => sum + e.amount, 0)
  };

  // Helper function to get period display name
  const getPeriodDisplayName = (period, availableMonths) => {
    if (period === 'current') {
      return 'This Month';
    }
    const month = availableMonths.find(m => m.value === period);
    return month ? month.label : period;
  };

  // Function to show transactions for a specific category and period
  const showTransactionsForCategory = (category, period, title) => {
    let filteredExpenses = expenses;
    
    // Filter by category if specified
    if (category) {
      if (Array.isArray(category)) {
        filteredExpenses = filteredExpenses.filter(expense => category.includes(expense.category));
      } else {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
      }
    }
    
    // Filter by period
    filteredExpenses = filteredExpenses.filter(expense => {
      if (period === 'current') {
        const expenseMonth = new Date(expense.date).getMonth();
        const currentMonth = new Date().getMonth();
        const expenseYear = new Date(expense.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return expenseMonth === currentMonth && expenseYear === currentYear;
      } else {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === period;
      }
    });
    
    // Sort by date (most recent first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setModalTransactions(filteredExpenses);
    setModalTitle(title);
    setShowTransactionModal(true);
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

  // Updated Fuel chart data function - now includes Car-Other data
  const getFuelChartData = () => {
    const periods = {};
    const fuelExpenses = expenses.filter(expense => expense.category === 'Car - Fuel');
    const carOtherExpenses = expenses.filter(expense => expense.category === 'Car - Other');
    const fuelReimbursements = expenses.filter(expense => expense.category === 'Fuel Reimbursement');
    
    // Filter by selected period if not 'recent'
    const filteredFuelExpenses = chartPeriod === 'recent' ? fuelExpenses : 
      fuelExpenses.filter(expense => {
        const expenseMonth = new Date(expense.date);
        const monthKey = `${expenseMonth.getFullYear()}-${String(expenseMonth.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === chartPeriod;
      });
      
    const filteredCarOtherExpenses = chartPeriod === 'recent' ? carOtherExpenses :
      carOtherExpenses.filter(expense => {
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
        periods[periodKey] = { period: periodKey, fuel: 0, carOther: 0, total: 0, directReimbursements: 0, periodLabel };
      }
      periods[periodKey].fuel += expense.amount;
      periods[periodKey].total += expense.amount;
    });
    
    // Group car-other expenses by period
    filteredCarOtherExpenses.forEach(expense => {
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
        periods[periodKey] = { period: periodKey, fuel: 0, carOther: 0, total: 0, directReimbursements: 0, periodLabel };
      }
      periods[periodKey].carOther += expense.amount;
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
        periods[periodKey] = { period: periodKey, fuel: 0, carOther: 0, total: 0, directReimbursements: 0, periodLabel };
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

  const showReimbursementFields = formData.category === 'Car - Fuel' || formData.category === 'Car - Other';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <img src={process.env.PUBLIC_URL + "/MoneyIcon.png"} alt="MoneyIcon" className="w-10 h-10" />
            Personal Expense Tracker
          </h1>
          <p className="text-gray-600">Track your household and car expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-6 mb-8">
          <div className="space-y-6 mb-8">
          {/* Total Monthly Spending Summary */}
          <div className="flex flex-col items-start mb-6">
            {/* Title */}
            <div className="w-full mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-green-600" size={20} />
                Monthly Spending Overview
              </h2>
            </div>
            
            {/* Cards with their respective calendars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mx-auto ">
              {/* Current Month Total Card Section */}
              <div className="flex flex-col items-start">
                {/* Calendar for current month */}
                <div className="w-full flex justify-start mb-3">
                  <div className="relative" ref={totalSummaryCalendarRef}>
                    <button
                      onClick={() => setShowTotalSummaryCalendar(!showTotalSummaryCalendar)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Calendar size={16} />
                      {getPeriodDisplayName(totalSummaryPeriod, availableMonths)}
                    </button>
                    {showTotalSummaryCalendar && (
                      <MonthlyCalendar
                        value={totalSummaryPeriod}
                        onChange={setTotalSummaryPeriod}
                        availableMonths={availableMonths}
                        onClose={() => setShowTotalSummaryCalendar(false)}
                      />
                    )}
                  </div>
                </div>
                
                {/* Current Month Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 flex items-start justify-between w-full min-h-32">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(totalSummaryPeriod, availableMonths)} Total
                    </p>
                    {/* Optional: Show comparison with current month */}
                    {monthlyTotalSpent !== 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {monthlyTotalSpent > lastMonthTotalSpent  ? (
                          <span className="text-red-500">
                            +£{(monthlyTotalSpent - lastMonthTotalSpent).toFixed(2)} vs last month
                          </span>
                        ) : (
                          <span className="text-green-500">
                            -£{(lastMonthTotalSpent - monthlyTotalSpent).toFixed(2)} vs last month
                          </span>
                        )}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-slate-600">£{monthlyTotalSpent.toFixed(2)}</p>
                  </div>
                  <CreditCard className="text-green-500" size={32} />
                </div>
              </div>
              
              {/* Comparison Month Total Card Section */}
              <div className="flex flex-col items-end ">
                {/* Calendar for comparison month */}
                <div className="w-full flex justify-end mb-3">
                  <div className="relative" ref={lastMonthSummaryCalendarRef}>
                    <button
                      onClick={() => setShowLastMonthSummaryCalendar(!showLastMonthSummaryCalendar)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Calendar size={16} />
                      {lastMonthData.monthName}
                    </button>
                    {showLastMonthSummaryCalendar && (
                      <MonthlyCalendar
                        value={lastMonthSummaryPeriod}
                        onChange={setLastMonthSummaryPeriod}
                        availableMonths={availableMonths}
                        onClose={() => setShowLastMonthSummaryCalendar(false)}
                      />
                    )}
                  </div>
                </div>
              
              {/* Comparison Month Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 flex items-start justify-between w-full min-h-32">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {lastMonthData.monthName} Total
                  </p>
                  <p className="text-2xl font-bold text-slate-600">£{lastMonthTotalSpent.toFixed(2)}</p>
                </div>
                <Calendar className="text-blue-500 ml-2" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

           {/* Housing & Utilities Summary */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <House className="text-indigo-600" size={20} />
                Housing & Utilities Summary
              </h2>
              <div className="relative" ref={housingSummaryCalendarRef}>
                <button
                  onClick={() => setShowHousingSummaryCalendar(!showHousingSummaryCalendar)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} />
                  {getPeriodDisplayName(housingSummaryPeriod, availableMonths)}
                </button>
                {showHousingSummaryCalendar && (
                  <MonthlyCalendar
                    value={housingSummaryPeriod}
                    onChange={setHousingSummaryPeriod}
                    availableMonths={availableMonths}
                    onClose={() => setShowHousingSummaryCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-slate-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(housingSummaryPeriod, availableMonths)} Total
                    </p>
                    <p className="text-2xl font-bold text-slate-600">£{monthlyNetTotal.toFixed(2)}</p>
                  </div>
                  <PoundSterling className="text-slate-500" size={32} />
                </div>
              </div>
              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Rent and Council Tax', 
                  housingSummaryPeriod, 
                  `${getPeriodDisplayName(housingSummaryPeriod, availableMonths)} - Rent and Council Tax`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rent & Council Tax</p>
                    <p className="text-2xl font-bold text-indigo-600">£{monthlyRentCouncil.toFixed(2)}</p>
                  </div>
                  <House className="text-indigo-500" size={32} />
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Utilities', 
                  housingSummaryPeriod, 
                  `${getPeriodDisplayName(housingSummaryPeriod, availableMonths)} - Utilities`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilities</p>
                    <p className="text-2xl font-bold text-yellow-600">£{monthlyUtilities.toFixed(2)}</p>
                  </div>
                  <Wrench className="text-yellow-500" size={32} />
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Internet', 
                  housingSummaryPeriod, 
                  `${getPeriodDisplayName(housingSummaryPeriod, availableMonths)} - Internet`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Internet</p>
                    <p className="text-2xl font-bold text-pink-600">£{monthlyInternet.toFixed(2)}</p>
                  </div>
                  <Wifi className="text-pink-500" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Grocery Summary */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="text-green-600" size={20} />
                Grocery, Dining & Small Shop Summary
              </h2>
              <div className="relative" ref={grocerySummaryCalendarRef}>
                <button
                  onClick={() => setShowGrocerySummaryCalendar(!showGrocerySummaryCalendar)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} />
                  {getPeriodDisplayName(grocerySummaryPeriod, availableMonths)}
                </button>
                {showGrocerySummaryCalendar && (
                  <MonthlyCalendar
                    value={grocerySummaryPeriod}
                    onChange={setGrocerySummaryPeriod}
                    availableMonths={availableMonths}
                    onClose={() => setShowGrocerySummaryCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  ['Groceries', 'Dining', 'Small Shop'], 
                  grocerySummaryPeriod, 
                  `${getPeriodDisplayName(grocerySummaryPeriod, availableMonths)} - All Grocery & Dining`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(grocerySummaryPeriod, availableMonths)} Total
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">£{monthlyGroceryExpenses.toFixed(2)}</p>
                  </div>
                  <PoundSterling className="text-indigo-500" size={32} />
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Groceries', 
                  grocerySummaryPeriod, 
                  `${getPeriodDisplayName(grocerySummaryPeriod, availableMonths)} - Groceries`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Groceries</p>
                    <p className="text-2xl font-bold text-green-600">£{monthlyGroceries.toFixed(2)}</p>
                  </div>
                  <ShoppingCart className="text-green-500" size={32} />
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Dining', 
                  grocerySummaryPeriod, 
                  `${getPeriodDisplayName(grocerySummaryPeriod, availableMonths)} - Dining`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dining</p>
                    <p className="text-2xl font-bold text-blue-600">£{monthlyDining.toFixed(2)}</p>
                  </div>
                  <Utensils className="text-blue-500" size={32} />
                </div>
              </div>

              <div 
                className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Small Shop', 
                  grocerySummaryPeriod, 
                  `${getPeriodDisplayName(grocerySummaryPeriod, availableMonths)} - Small Shop`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Small Shop</p>
                    <p className="text-2xl font-bold text-teal-600">£{monthlySmallShop.toFixed(2)}</p>
                  </div>
                  <ShoppingCart className="text-teal-500" size={32} />
                </div>
              </div>
            </div>
          </div>

          {/* Car Summary */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Car className="text-red-600" size={20} />
                Car Expenses Summary
              </h2>
              <div className="relative" ref={carSummaryCalendarRef}>
                <button
                  onClick={() => setShowCarSummaryCalendar(!showCarSummaryCalendar)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} />
                  {getPeriodDisplayName(carSummaryPeriod, availableMonths)}
                </button>
                {showCarSummaryCalendar && (
                  <MonthlyCalendar
                    value={carSummaryPeriod}
                    onChange={setCarSummaryPeriod}
                    availableMonths={availableMonths}
                    onClose={() => setShowCarSummaryCalendar(false)}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  ['Car - Fuel', 'Car - Other', 'Fuel Reimbursement'], 
                  carSummaryPeriod, 
                  `${getPeriodDisplayName(carSummaryPeriod, availableMonths)} - All Car Expenses`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(carSummaryPeriod, availableMonths)} Net
                    </p>
                    <p className="text-2xl font-bold text-purple-600">£{monthlyNetCarExpenses.toFixed(2)}</p>
                  </div>
                  <PoundSterling className="text-purple-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Car - Fuel', 
                  carSummaryPeriod, 
                  `${getPeriodDisplayName(carSummaryPeriod, availableMonths)} - Car Fuel`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Car - Fuel</p>
                    <p className="text-2xl font-bold text-red-600">£{monthlyCarFuel.toFixed(2)}</p>
                  </div>
                  <Car className="text-red-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Car - Other', 
                  carSummaryPeriod, 
                  `${getPeriodDisplayName(carSummaryPeriod, availableMonths)} - Car Other`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Car - Other</p>
                    <p className="text-2xl font-bold text-orange-600">£{monthlyCarOther.toFixed(2)}</p>
                  </div>
                  <Car className="text-orange-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => showTransactionsForCategory(
                  'Fuel Reimbursement', 
                  carSummaryPeriod, 
                  `${getPeriodDisplayName(carSummaryPeriod, availableMonths)} - Fuel Reimbursements`
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {getPeriodDisplayName(carSummaryPeriod, availableMonths)} Reimbursements
                    </p>
                    <p className="text-2xl font-bold text-green-600">£{monthlyCarReimbursements.toFixed(2)}</p>
                  </div>
                  <RefreshCw className="text-green-500" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Updated Fuel Chart - now includes Car-Other */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 className="text-red-600" size={24} />
                {chartPeriod === 'recent' ? 'Recent Car Spending' : `Car Spending - ${getPeriodDisplayName(chartPeriod, availableMonths)}`}
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
                  onClick={() => setShowCarBarChart(!showCarBarChart)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {showCarBarChart ? 'Hide' : 'Show'}
                </button>
                {showCarBarChart && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChartMode('total')}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        chartMode === 'total' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Breakdown
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
            
            {showCarBarChart && (
              <div className="h-64">
                {chartData.length > 0 ? (
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
                            dataKey="fuel" 
                            fill="#ef4444" 
                            name="Car - Fuel"
                          />
                          <Bar 
                            dataKey="carOther" 
                            fill="#f97316" 
                            name="Car - Other"
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="mx-auto mb-3 text-gray-400" size={48} />
                      <p className="text-lg font-medium">No car expenses found</p>
                      <p className="text-sm">No data available for the selected period</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grocery Chart */}
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
                  onClick={() => setShowGroceryBarChart(!showGroceryBarChart)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showGroceryBarChart ? 'Hide' : 'Show'}
                </button>
                {showGroceryBarChart && (
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
            
            {showGroceryBarChart && (
              <div className="h-64">
                {groceryChartData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="mx-auto mb-3 text-gray-400" size={48} />
                      <p className="text-lg font-medium">No grocery expenses found</p>
                      <p className="text-sm">No data available for the selected period</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Donut Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Summary Donut Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="text-blue-600" size={24} />
                Monthly Expense Breakdown 
              </h3>
              <div className="flex gap-2">
                <div className="relative" ref={totalSummaryCalendarRef}>
                  <button
                    onClick={() => setShowTotalSummaryCalendar(!showTotalSummaryCalendar)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar size={16} />
                    {getPeriodDisplayName(totalSummaryPeriod, availableMonths)}
                  </button>
                  {showTotalSummaryCalendar && (
                    <MonthlyCalendar
                      value={totalSummaryPeriod}
                      onChange={setTotalSummaryPeriod}
                      availableMonths={availableMonths}
                      onClose={() => setShowTotalSummaryCalendar(false)}
                    />
                  )}
                </div>
                <button
                  onClick={() => setShowMonthlySummaryChart(!showMonthlySummaryChart)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showMonthlySummaryChart ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {showMonthlySummaryChart && (
              <div className="h-96 flex items-center justify-center">
                {(mainSummaryTotals.housing > 0 || mainSummaryTotals.grocery > 0 || mainSummaryTotals.car > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Housing & Utilities',
                            value: mainSummaryTotals.housing,
                            fill: '#6366f1'
                          },
                          {
                            name: 'Grocery & Dining',
                            value: mainSummaryTotals.grocery,
                            fill: '#10b981'
                          },
                          {
                            name: 'Car Expenses',
                            value: mainSummaryTotals.car,
                            fill: '#ef4444'
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="55%"
                        labelLine={false}
                        label={({ value, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          if (percent <= 0.05) return '';
                          
                          // Position for percentage (inside the colored section)
                          const innerLabelRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const innerX = cx + innerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const innerY = cy + innerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          // Position for £ amount (outside the donut)
                          const outerLabelRadius = outerRadius + 20;
                          const outerX = cx + outerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const outerY = cy + outerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          return (
                            <g>
                              {/* Percentage inside */}
                              <text x={innerX} y={innerY} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
                                {(percent * 100).toFixed(0)}%
                              </text>
                              {/* £ amount outside */}
                              <text x={outerX} y={outerY} fill="#374151" textAnchor="middle" dominantBaseline="central" fontSize="12">
                                £{value.toFixed(0)}
                              </text>
                            </g>
                          );
                        }}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Legend 
                        verticalAlign="top"
                        align="center"
                        layout="vertical"
                        iconSize={12}
                        wrapperStyle={{
                          paddingLeft: '20px',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500">
                    <PieChart className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-lg font-medium">No expenses found</p>
                    <p className="text-sm">No data available for the selected period</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Car Expenses Donut Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="text-red-600" size={24} />
                {chartPeriod === 'recent' ? 'Car Spending Distribution' : `Car Spending Distribution - ${getPeriodDisplayName(chartPeriod, availableMonths)}`}
              </h3>
              <div className="flex gap-2">
                <div className="relative" ref={donutCarCalendarRef}>
                  <button
                    onClick={() => setShowDonutCarCalendar(!showDonutCarCalendar)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar size={16} />
                    {donutCarPeriod === 'recent' ? 'Last 8 Weeks' : getPeriodDisplayName(donutCarPeriod, availableMonths)}
                  </button>
                  {showDonutCarCalendar && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]">
                      <button
                        onClick={() => {
                          setDonutCarPeriod('recent');
                          setShowDonutCarCalendar(false);
                        }}
                        className={`w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          donutCarPeriod === 'recent'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Last 8 Weeks
                      </button>
                      <MonthlyCalendar
                        value={donutCarPeriod}
                        onChange={(value) => {
                          setDonutCarPeriod(value);
                          setShowDonutCarCalendar(false);
                        }}
                        availableMonths={availableMonths}
                        onClose={() => setShowDonutCarCalendar(false)}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowCarPieChart(!showCarPieChart)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {showCarPieChart ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {showCarPieChart && (
              <div className="h-96 flex items-center justify-center">
                {(donutCarTotals.fuel > 0 || donutCarTotals.carOther > 0 || donutCarTotals.directReimbursements > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Car - Fuel',
                            value: donutCarTotals.fuel,
                            fill: '#ef4444'
                          },
                          {
                            name: 'Car - Other',
                            value: donutCarTotals.carOther,
                            fill: '#f97316'
                          },
                          {
                            name: 'Fuel Reimbursements',
                            value: donutCarTotals.directReimbursements,
                            fill: '#06c42f'
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="55%"
                        labelLine={false}
                        label={({ value, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          if (percent <= 0.05) return '';
                          
                          // Position for percentage (inside the colored section)
                          const innerLabelRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const innerX = cx + innerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const innerY = cy + innerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          // Position for £ amount (outside the donut)
                          const outerLabelRadius = outerRadius + 20;
                          const outerX = cx + outerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const outerY = cy + outerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          return (
                            <g>
                              {/* Percentage inside */}
                              <text x={innerX} y={innerY} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
                                {(percent * 100).toFixed(0)}%
                              </text>
                              {/* £ amount outside */}
                              <text x={outerX} y={outerY} fill="#374151" textAnchor="middle" dominantBaseline="central" fontSize="12">
                                £{value.toFixed(0)}
                              </text>
                            </g>
                          );
                        }}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Legend 
                        verticalAlign="top"
                        align="center"
                        layout="vertical"
                        iconSize={12}
                        wrapperStyle={{
                          paddingLeft: '20px',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500">
                    <PieChart className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-lg font-medium">No car expenses found</p>
                    <p className="text-sm">No data available for the selected period</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grocery Expenses Donut Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <PieChart className="text-green-600" size={24} />
                {groceryChartPeriod === 'recent' ? 'Grocery & Dining Distribution' : `Grocery & Dining Distribution - ${getPeriodDisplayName(groceryChartPeriod, availableMonths)}`}
              </h3>
              <div className="flex gap-2">
                <div className="relative" ref={donutGroceryCalendarRef}>
                  <button
                    onClick={() => setShowDonutGroceryCalendar(!showDonutGroceryCalendar)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Calendar size={16} />
                    {donutGroceryPeriod === 'recent' ? 'Last 8 Weeks' : getPeriodDisplayName(donutGroceryPeriod, availableMonths)}
                  </button>
                  {showDonutGroceryCalendar && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]">
                      <button
                        onClick={() => {
                          setDonutGroceryPeriod('recent');
                          setShowDonutGroceryCalendar(false);
                        }}
                        className={`w-full mb-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          donutGroceryPeriod === 'recent'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Last 8 Weeks
                      </button>
                      <MonthlyCalendar
                        value={donutGroceryPeriod}
                        onChange={(value) => {
                          setDonutGroceryPeriod(value);
                          setShowDonutGroceryCalendar(false);
                        }}
                        availableMonths={availableMonths}
                        onClose={() => setShowDonutGroceryCalendar(false)}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowGroceryPieChart(!showGroceryPieChart)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showGroceryPieChart ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            {showGroceryPieChart && (
              <div className="h-96 flex items-center justify-center">
                {(donutGroceryTotals.groceries > 0 || donutGroceryTotals.dining > 0 || donutGroceryTotals.smallShop > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Groceries',
                            value: donutGroceryTotals.groceries,
                            fill: '#10b981'
                          },
                          {
                            name: 'Dining',
                            value: donutGroceryTotals.dining,
                            fill: '#3b82f6'
                          },
                          {
                            name: 'Small Shop',
                            value: donutGroceryTotals.smallShop,
                            fill: '#14b8a6'
                          }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="55%"
                        labelLine={false}
                        label={({ value, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
                          if (percent <= 0.05) return '';
                          
                          // Position for percentage (inside the colored section)
                          const innerLabelRadius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const innerX = cx + innerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const innerY = cy + innerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          // Position for £ amount (outside the donut)
                          const outerLabelRadius = outerRadius + 20;
                          const outerX = cx + outerLabelRadius * Math.cos(-midAngle * Math.PI / 180);
                          const outerY = cy + outerLabelRadius * Math.sin(-midAngle * Math.PI / 180);
                          
                          return (
                            <g>
                              {/* Percentage inside */}
                              <text x={innerX} y={innerY} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold">
                                {(percent * 100).toFixed(0)}%
                              </text>
                              {/* £ amount outside */}
                              <text x={outerX} y={outerY} fill="#374151" textAnchor="middle" dominantBaseline="central" fontSize="12">
                                £{value.toFixed(0)}
                              </text>
                            </g>
                          );
                        }}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Legend 
                        verticalAlign="top"
                        align="center"
                        layout="vertical"
                        iconSize={12}
                        wrapperStyle={{
                          paddingLeft: '20px',
                          fontSize: '14px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500">
                    <PieChart className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-lg font-medium">No grocery expenses found</p>
                    <p className="text-sm">No data available for the selected period</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spending Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-purple-600" size={24} />
              Spending Trends Over Time
            </h3>
            <div className="flex gap-2">
              <select
                value={trendPeriod}
                onChange={(e) => setTrendPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="3">Last 3 Months</option>
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={() => setShowTrendChart(!showTrendChart)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                {showTrendChart ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          
          {showTrendChart && (
            <div className="h-96">
              {trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="monthName" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`£${value.toFixed(2)}`, name]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                      name="Total Spending"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="housing" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#8b5cf6' }}
                      name="Housing & Utilities"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="grocery" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#10b981' }}
                      name="Grocery & Dining"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="car" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#ef4444' }}
                      name="Car Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="mx-auto mb-3 text-gray-400" size={48} />
                    <p className="text-lg font-medium">No trend data available</p>
                    <p className="text-sm">Add more expenses to see spending trends</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Category Breakdown - Full Width at Top */}
          {categoryTotals.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Summary</h3>
              <div className="flex flex-wrap gap-2">
                {categoryTotals.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg min-w-fit flex-1">
                      <div className={`p-1.5 rounded-lg ${item.color}`}>
                        <IconComponent className="text-white" size={14} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900 text-sm">{item.value}</p>
                        <p className="text-xs text-gray-600">{item.count} entries</p>
                        <p className="font-medium text-gray-900 mt-0.5 text-xs">
                          {item.isReimbursement ? '+' : '-'}£{item.total.toFixed(2)}
                        </p>
                        {item.reimbursements > 0 && (
                          <p className="text-xs text-green-600">+£{item.reimbursements.toFixed(2)}</p>
                        )}
                        {(item.reimbursements > 0 || item.isReimbursement) && (
                          <p className="text-xs font-medium text-purple-600">
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
          </div>

          {/* Expenses List - Now Collapsible */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setShowExpensesList(!showExpensesList)}
                  className="flex items-center gap-2 text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors"
                >
                  <span>Recent Expenses</span>
                  {showExpensesList ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
                <button
                  onClick={loadExpenses}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {showExpensesList && (
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
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDuplicateClick(expense)}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                                title="Duplicate Expense"
                              >
                                <PlusCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleEditClick(expense)}
                                className="text-green-500 hover:text-green-700 transition-colors p-1"
                                title="Edit Expense"
                              >
                                <Wrench size={18} />
                              </button>
                              <button
                                onClick={() => confirmDeleteExpense(expense)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                title="Delete Expense"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        
        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {modalTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found for this period.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modalTransactions.map(expense => {
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
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Total ({modalTransactions.length} transactions):
                    </span>
                    <span className="text-lg font-bold text-gray-800">
                      £{modalTransactions.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Edit Expense Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Edit Expense</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
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
                          id="edit-reimbursement"
                          checked={formData.isReimbursement}
                          onChange={(e) => setFormData({...formData, isReimbursement: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="edit-reimbursement" className="text-sm font-medium text-gray-700">
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

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingExpense(null);
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => editExpense({
                        ...formData,
                        id: editingExpense.id,
                        amount: parseFloat(formData.amount),
                        reimbursementAmount: formData.reimbursementAmount ? parseFloat(formData.reimbursementAmount) : 0
                      })}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Wrench size={20} />
                      Update Expense
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Expense Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Duplicate Expense</h2>
                <button
                  onClick={() => {
                    setShowDuplicateModal(false);
                    setEditingExpense(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
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
                          id="duplicate-reimbursement"
                          checked={formData.isReimbursement}
                          onChange={(e) => setFormData({...formData, isReimbursement: e.target.checked})}
                          className="mr-2"
                        />
                        <label htmlFor="duplicate-reimbursement" className="text-sm font-medium text-gray-700">
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

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDuplicateModal(false);
                        setEditingExpense(null);
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => duplicateExpense({
                        ...formData,
                        amount: parseFloat(formData.amount),
                        reimbursementAmount: formData.reimbursementAmount ? parseFloat(formData.reimbursementAmount) : 0
                      })}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={20} />
                      Duplicate Expense
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Toast Notifications Container */}
        <div className="fixed top-4 right-4 z-50">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && expenseToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Confirm Delete</h2>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this expense?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="font-medium text-red-800">{expenseToDelete.description}</p>
                  <p className="text-red-600">£{expenseToDelete.amount.toFixed(2)} • {expenseToDelete.category}</p>
                  <p className="text-red-500 text-sm">{expenseToDelete.date}</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setExpenseToDelete(null);
                    }}
                    className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteExpense}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                    Delete Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;