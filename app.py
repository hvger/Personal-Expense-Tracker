from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
import uuid
import json
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__, static_folder='build')
CORS(app)

# Google Sheets Setup
SHEET_NAME = "Expenses"  # Change to your actual Google Sheet name
SCOPE = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Load creds from env
creds_json = json.loads(os.environ.get("GOOGLE_CREDS_JSON"))
creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_json, SCOPE)
gc = gspread.authorize(creds)
sheet = gc.open(SHEET_NAME).sheet1  # Frst sheet testing

HEADERS = ['id', 'description', 'amount', 'category', 'date', 'isReimbursement', 'reimbursementAmount', 'timestamp']

def load_expenses():
    """Load expenses from Google Sheet"""
    data = sheet.get_all_records()
    # Convert data types for consistency
    expenses = []
    for row in data:
        expenses.append({
            'id': row['id'],
            'description': row['description'],
            'amount': float(row['amount']),
            'category': row['category'],
            'date': row['date'],
            'isReimbursement': bool(row['isReimbursement']),
            'reimbursementAmount': float(row.get('reimbursementAmount', 0)),
            'timestamp': row['timestamp']
        })
    expenses.sort(key=lambda x: x['timestamp'], reverse=True)
    return expenses

def save_expenses(expenses):
    """Save expenses to Google Sheet"""
    df = pd.DataFrame(expenses)
    sheet.clear()
    sheet.append_row(HEADERS)
    rows = df.values.tolist()
    for r in rows:
        sheet.append_row(r)
    return True

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    return jsonify(load_expenses())

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        required_fields = ['description', 'amount', 'category', 'date']
        for f in required_fields:
            if not data.get(f):
                return jsonify({'error': f'Missing {f}'}), 400
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
        save_expenses(expenses)
        return jsonify(new_expense), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    try:
        expenses = [e for e in load_expenses() if e['id'] != expense_id]
        save_expenses(expenses)
        return jsonify({'message': 'Deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)