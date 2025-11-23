import os
import json
import uuid
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__, static_folder='build')
CORS(app)  # Enable CORS for React frontend

# -----------------------------
# Google Sheets Setup
# -----------------------------
GOOGLE_CREDENTIALS_JSON = os.environ.get("GOOGLE_CREDENTIALS_JSON")
SHEET_NAME = os.environ.get("SHEET_NAME") # e.g., "Expenses"


creds_dict = json.loads(GOOGLE_CREDENTIALS_JSON)
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
gc = gspread.authorize(credentials)
sheet = gc.open(SHEET_NAME).sheet1

#if not GOOGLE_CREDENTIALS_JSON :
   # raise RuntimeError("Environment variables GOOGLE_CREDENTIALS_JSON  not set!")
#if not SHEET_NAME :
    #raise RuntimeError("Environment variables SHEET NAME  not set!")

# -----------------------------
# Helper functions
# -----------------------------
def load_expenses():
    """Load expenses from Google Sheet"""
    try:
        if sheet is None:
            print("Sheet not initialized")
            return []
            
        records = sheet.get_all_records()
        expenses = []
        for rec in records:
            # Handle missing fields and type conversions
            rec['isReimbursement'] = bool(rec.get('isReimbursement', False))
            rec['reimbursementAmount'] = float(rec.get('reimbursementAmount', 0)) if rec.get('reimbursementAmount') else 0.0
            rec['amount'] = float(rec.get('amount', 0))
            expenses.append(rec)
        # Sort by timestamp descending
        expenses.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        print(f"✅ Loaded {len(expenses)} expenses from Google Sheets")
        return expenses
    except Exception as e:
        print(f"❌ Error loading expenses: {e}")
        return []

def save_expenses(expenses):
    """Save all expenses to Google Sheet"""
    try:
        if sheet is None:
            print("Sheet not initialized")
            return False
            
        df = pd.DataFrame(expenses)
        sheet.clear()
        sheet.update([df.columns.values.tolist()] + df.values.tolist())
        print(f"✅ Saved {len(expenses)} expenses to Google Sheets")
        return True
    except Exception as e:
        print(f"❌ Error saving expenses: {e}")
        return False

# -----------------------------
# Flask routes
# -----------------------------
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path.startswith('api'):
        return jsonify({'error': 'API route not found'}), 404
    try:
        return send_from_directory(app.static_folder, path)
    except:
        return send_from_directory(app.static_folder, 'index.html')
    
@app.route('/api/health')
def health_check():
    """Health check endpoint to verify Google Sheets connection"""
    try:
        if sheet is None:
            return jsonify({'status': 'error', 'message': 'Google Sheets not connected'}), 500
        
        # Test connection by getting worksheet title
        worksheet_title = sheet.title
        return jsonify({
            'status': 'healthy', 
            'message': 'Google Sheets connected',
            'worksheet': worksheet_title
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        expenses = load_expenses()
        return jsonify(expenses)
    except Exception as e:
        print(f"❌ Error in GET /api/expenses: {e}")
        return jsonify({'error': 'Failed to load expenses'}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        required_fields = ['description', 'amount', 'category', 'date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        new_expense = {
            'id': str(uuid.uuid4()),
            'description': data['description'],
            'amount': float(data['amount']),
            'category': data['category'],
            'date': data['date'],
            'isReimbursement': bool(data.get('isReimbursement', False)),
            'reimbursementAmount': float(data.get('reimbursementAmount', 0)),
            'timestamp': datetime.now().isoformat()
        }
        
        expenses = load_expenses()
        expenses.insert(0, new_expense)
        if save_expenses(expenses):
            return jsonify(new_expense), 201
        else:
            return jsonify({'error': 'Failed to save expense'}), 500
    except Exception as e:
        print(f"❌ Error in POST /api/expenses: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        expenses = load_expenses()
        expenses = [exp for exp in expenses if exp['id'] != expense_id]
        if save_expenses(expenses):
            return jsonify({'message': 'Expense deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete expense'}), 500
    except Exception as e:
        print(f"❌ Error in DELETE /api/expenses: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<expense_id>', methods=['PUT'])
def update_expense(expense_id):
    try:
        data = request.get_json()
        required_fields = ['description', 'amount', 'category', 'date']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        expenses = load_expenses()
        expense_found = False
        
        for expense in expenses:
            if expense['id'] == expense_id:
                expense.update({
                    'description': data['description'],
                    'amount': float(data['amount']),
                    'category': data['category'],
                    'date': data['date'],
                    'isReimbursement': bool(data.get('isReimbursement', False)),
                    'reimbursementAmount': float(data.get('reimbursementAmount', 0)),
                    'timestamp': datetime.now().isoformat()  # Update timestamp
                })
                expense_found = True
                break
        
        if not expense_found:
            return jsonify({'error': 'Expense not found'}), 404
            
        if save_expenses(expenses):
            return jsonify({'message': 'Expense updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update expense'}), 500
    except Exception as e:
        print(f"❌ Error in PUT /api/expenses: {e}")
        return jsonify({'error': str(e)}), 500
    

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
