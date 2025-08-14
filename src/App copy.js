import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, PoundSterling, ShoppingCart, Utensils, Car, RefreshCw } from 'lucide-react';

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

  const categories = [
    { value: 'Groceries', icon: ShoppingCart, color: 'bg-green-500' },
    { value: 'Dining', icon: Utensils, color: 'bg-blue-500' },
    { value: 'Car - Fuel', icon: Car, color: 'bg-red-500' },
    { value: 'Car - Maintenance', icon: Car, color: 'bg-orange-500' }
  ];

  // Load expenses from backend
  const loadExpenses = async () => {
    try {
      const response = await fetch('http://192.168.0.15:5000/api/expenses');
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
      const response = await fetch('http://192.168.0.15:5000/api/expenses', {
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
      const response = await fetch(`http://192.168.0.15:5000/api/expenses/£{id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalReimbursements = expenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
  const netExpenses = totalExpenses - totalReimbursements;

  const monthlyExpenses = expenses.filter(expense => {
    const expenseMonth = new Date(expense.date).getMonth();
    const currentMonth = new Date().getMonth();
    const expenseYear = new Date(expense.date).getFullYear();
    const currentYear = new Date().getFullYear();
    return expenseMonth === currentMonth && expenseYear === currentYear;
  }).reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown
  const categoryTotals = categories.map(cat => {
    const categoryExpenses = expenses.filter(expense => expense.category === cat.value);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const reimbursements = categoryExpenses.reduce((sum, expense) => sum + (expense.reimbursementAmount || 0), 0);
    return {
      ...cat,
      total,
      reimbursements,
      net: total - reimbursements,
      count: categoryExpenses.length
    };
  }).filter(item => item.count > 0);

  const showReimbursementFields = formData.category === 'Car - Fuel' || formData.category === 'Car - Maintenance';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <PoundSterling className="text-blue-600" size={40} />
            Personal Expense Tracker
          </h1>
          <p className="text-gray-600">Track your groceries, dining, and car expenses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">£{totalExpenses.toFixed(2)}</p>
              </div>
              <PoundSterling className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reimbursements</p>
                <p className="text-2xl font-bold text-green-600">£{totalReimbursements.toFixed(2)}</p>
              </div>
              <RefreshCw className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Expenses</p>
                <p className="text-2xl font-bold text-purple-600">£{netExpenses.toFixed(2)}</p>
              </div>
              < PoundSterling className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">£{monthlyExpenses.toFixed(2)}</p>
              </div>
              <ShoppingCart className="text-orange-500" size={32} />
            </div>
          </div>
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
                          Reimbursement Amount ($)
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
                          <div className={`p-2 rounded-lg £{item.color}`}>
                            <IconComponent className="text-white" size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.value}</p>
                            <p className="text-sm text-gray-600">{item.count} entries</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">£{item.total.toFixed(2)}</p>
                          {item.reimbursements > 0 && (
                            <p className="text-sm text-green-600">-£{item.reimbursements.toFixed(2)}</p>
                          )}
                          {item.reimbursements > 0 && (
                            <p className="text-sm font-medium text-purple-600">£{item.net.toFixed(2)} net</p>
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
                    const IconComponent = category?.icon || PoundSterling;
                    const netAmount = expense.amount - (expense.reimbursementAmount || 0);
                    
                    return (
                      <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg £{category?.color || 'bg-gray-500'}`}>
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
                            <span className="text-lg font-semibold text-red-600">
                              -£{expense.amount.toFixed(2)}
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