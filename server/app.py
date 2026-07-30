from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from firebase_config import db, auth, create_custom_token, verify_custom_token
from firebase_admin import firestore
from functools import wraps
import json
import os
from AI.chat import get_ai_response
from AI.mealPlanner import generate_meal_plan
from NutriInsights import search_food, get_food_details, parse_search_results, parse_food_details
from datetime import datetime, timedelta

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "veda")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "08072002")

app = Flask(__name__)

app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, 
     resources={
         r"/*": {
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "supports_credentials": True
         }
     })

class AuthError(Exception):
    def __init__(self, error, status_code=401):
        self.error = error
        self.status_code = status_code

@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthError({
                'code': 'authorization_header_missing',
                'description': 'Authorization header is expected.'
            }, 401)
            
        token = auth_header.split(' ')[1]
        try:
            payload = verify_custom_token(token)
            request.current_user = payload
        except Exception as e:
            raise AuthError({
                'code': 'invalid_token',
                'description': 'The token is invalid or expired.'
            }, 401)
            
        return f(*args, **kwargs)
    return decorated

def requires_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            raise AuthError({
                'code': 'authorization_header_missing',
                'description': 'Authorization header is expected.'
            }, 401)

        token = auth_header.split(' ')[1]
        try:
            payload = verify_custom_token(token)
        except Exception:
            raise AuthError({
                'code': 'invalid_token',
                'description': 'The token is invalid or expired.'
            }, 401)

        if payload.get('role') != 'admin':
            raise AuthError({
                'code': 'admin_only',
                'description': 'Admin privileges are required for this action.'
            }, 403)

        request.current_admin = payload
        return f(*args, **kwargs)
    return decorated

@app.route('/api/admin/login', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response

    data = request.get_json() or {}
    username = data.get('username', '')
    password = data.get('password', '')

    if username != ADMIN_USERNAME or password != ADMIN_PASSWORD:
        return jsonify({'error': 'Invalid admin credentials'}), 401

    token = create_custom_token('admin', {'role': 'admin', 'username': username})
    return jsonify({'token': token, 'admin': {'username': username}}), 200

@app.route('/api/admin/users', methods=['GET'])
@requires_admin
def admin_list_users():
    """Return every registered user's profile so the admin can see everyone at a glance."""
    try:
        users = []
        for doc in db.collection('users').stream():
            data = doc.to_dict()
            users.append({
                'uid': data.get('uid', doc.id),
                'name': data.get('name', ''),
                'email': data.get('email', ''),
                'healthDetails': data.get('healthDetails', {}),
            })
        return jsonify({'users': users}), 200
    except Exception as e:
        app.logger.error(f"Error listing users for admin: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/admin/users/<uid>/history', methods=['GET'])
@requires_admin
def admin_user_history(uid):
    """Return one user's full history: profile, saved meal plan, and meal-logging streak/entries."""
    try:
        user_doc = db.collection('users').document(uid).get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        profile = user_doc.to_dict()

        meal_plan_doc = db.collection('mealPlans').document(uid).get()
        meal_plan = meal_plan_doc.to_dict() if meal_plan_doc.exists else None

        log_doc = db.collection('mealLogs').document(uid).get()
        log_data = log_doc.to_dict() if log_doc.exists else {}

        entries = []
        if log_doc.exists:
            entries_query = (
                db.collection('mealLogs').document(uid)
                .collection('entries')
                .order_by('timestamp', direction=firestore.Query.DESCENDING)
                .limit(50)
            )
            for entry_doc in entries_query.stream():
                entry = entry_doc.to_dict()
                ts = entry.get('timestamp')
                entries.append({
                    'id': entry_doc.id,
                    'meal': entry.get('meal', {}),
                    'timestamp': ts.isoformat() if hasattr(ts, 'isoformat') else str(ts),
                })

        progress_entries = []
        progress_query = (
            db.collection('progressLogs').document(uid)
            .collection('entries')
            .order_by('date')
            .limit(200)
        )
        for p_doc in progress_query.stream():
            progress_entries.append(p_doc.to_dict())

        return jsonify({
            'profile': profile,
            'mealPlan': meal_plan,
            'streak': log_data.get('current_streak', 0),
            'lastLoggedDate': log_data.get('last_logged_date'),
            'mealLogEntries': entries,
            'progressEntries': progress_entries,
        }), 200
    except Exception as e:
        app.logger.error(f"Error fetching user history for admin: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
        
    data = request.get_json()
    
    try:
        user = auth.create_user(
            email=data['email'],
            password=data['password']
        )
        
        health_details = {
            'age': data.get('age', ''),
            'gender': data.get('gender', ''),
            'height': data.get('height', ''),
            'weight': data.get('weight', ''),
            'dietPreference': data.get('dietPreference', ''),
            'goal': data.get('goal', ''),
            'activityLevel': data.get('activityLevel', ''),
            'allergies': data.get('allergies', '')
        }

        user_data = {
            'uid': user.uid,
            'email': data['email'],
            'created_at': firestore.SERVER_TIMESTAMP,
            'name': data.get('name', ''),
            'healthDetails': health_details
        }
        
        db.collection('users').document(user.uid).set(user_data)
        
        token = create_custom_token(user.uid)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'name': user_data.get('name', ''),
                'healthDetails': health_details
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    try:
        user = auth.get_user_by_email(data['email'])
        
        token = create_custom_token(user.uid)
        
        user_doc = db.collection('users').document(user.uid).get()
        user_data = user_doc.to_dict() if user_doc.exists else {'email': user.email}
        
        return jsonify({
            'token': token,
            'user': {
                'uid': user.uid,
                'email': user.email,
                'name': user_data.get('name', ''),
                'healthDetails': user_data.get('healthDetails', {})
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/api/me', methods=['GET'])
@requires_auth
def get_current_user():
    user_id = request.current_user['uid']
    user_doc = db.collection('users').document(user_id).get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
        
    user_data = user_doc.to_dict()
    return jsonify(user_data)

@app.route('/api/chat', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*', headers=['Content-Type', 'Authorization'])
@requires_auth
def chat():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        data = request.get_json()
        chat_history = data.get('messages', [])
        
        if not chat_history:
            return jsonify({'error': 'No messages provided'}), 400
            
        last_message = chat_history[-1].get('content', '') if chat_history else ''
        
        user_ref = db.collection('users').document(request.current_user['uid'])
        user_doc = user_ref.get()
        
        user_info = None
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_info = user_data.get('healthDetails', {})
        
        ai_response = get_ai_response(chat_history, user_info)
        
        return jsonify({
            'reply': ai_response,
            'message': last_message
        })
    except Exception as e:
        app.logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/generate-meal-plan', methods=['POST'])
@requires_auth
def create_meal_plan():
    try:
        user_id = request.current_user['uid']
        user_doc = db.collection('users').document(user_id).get()

        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict()
        health_details = user_data.get('healthDetails', {})

        name = user_data.get('name', 'User')
        age = health_details.get('age')
        gender = health_details.get('gender')
        height = health_details.get('height')
        weight = health_details.get('weight')
        diet_preference = health_details.get('dietPreference')
        goal = health_details.get('goal')
        activity_level = health_details.get('activityLevel')
        allergies = health_details.get('allergies', '')

        meal_plan_json = generate_meal_plan(
            name=name,
            age=age,
            gender=gender,
            height=height,
            weight=weight,
            diet_preference=diet_preference,
            goal=goal,
            activity_level=activity_level,
            allergies=allergies
        )

        meal_plan_data = json.loads(meal_plan_json)

        db.collection('mealPlans').document(user_id).set(meal_plan_data)

        return jsonify({'message': 'Meal plan generated and saved successfully', 'meal_plan': meal_plan_data}), 200

    except Exception as e:
        app.logger.error(f"Error in meal plan generation: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/meal-plan', methods=['GET'])
@requires_auth
def get_meal_plan():
    try:
        user_id = request.current_user['uid']
        meal_plan_doc = db.collection('mealPlans').document(user_id).get()

        if not meal_plan_doc.exists:
            return jsonify({'error': 'Meal plan not found'}), 404

        return jsonify(meal_plan_doc.to_dict()), 200

    except Exception as e:
        app.logger.error(f"Error fetching meal plan: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/nutrition/search', methods=['GET'])
def search_food_route():
    query = request.args.get('q')
    if not query:
        return jsonify({'error': 'Query parameter "q" is required'}), 400
    
    try:
        search_results = search_food(query)
        if 'error' in search_results or 'errors' in search_results:
             return jsonify({'error': 'Error from external API', 'details': search_results}), 502
        
        parsed_results = parse_search_results(search_results)
        return jsonify(parsed_results)

    except Exception as e:
        app.logger.error(f"Error in food search: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/nutrition/food/<int:fdc_id>', methods=['GET'])
def get_food_details_route(fdc_id):
    try:
        food_details = get_food_details(fdc_id)
        if food_details.get('Error') or food_details.get('error'):
             return jsonify({'error': 'Food not found or API error', 'details': food_details}), 404
        
        parsed_details = parse_food_details(food_details)
        return jsonify(parsed_details)
        
    except Exception as e:
        app.logger.error(f"Error fetching food details: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/log-meal', methods=['POST'])
@requires_auth
def log_meal():
    """Log that the user has consumed at least one meal today and update their streak.
    Expected JSON body can optionally include `meal` details, but is not required for streak.
    """
    try:
        user_id = request.current_user['uid']
        today = datetime.utcnow().date()

        log_ref = db.collection('mealLogs').document(user_id)
        log_doc = log_ref.get()

        if log_doc.exists:
            data = log_doc.to_dict()
            last_logged = data.get('last_logged_date')
            current_streak = data.get('current_streak', 0)

            if last_logged:
                last_logged_date = last_logged.date() if isinstance(last_logged, datetime) else datetime.strptime(last_logged, "%Y-%m-%d").date()
            else:
                last_logged_date = None

            if last_logged_date == today:
                return jsonify({'message': 'Meal already logged today', 'streak': current_streak}), 200
            elif last_logged_date == today - timedelta(days=1):
                current_streak += 1
            else:
                current_streak = 1
        else:
            current_streak = 1

        log_entry = {
            'timestamp': firestore.SERVER_TIMESTAMP,
            'meal': request.get_json(silent=True) or {}
        }

        log_ref.set({
            'last_logged_date': today.isoformat(),
            'current_streak': current_streak,
        }, merge=True)

        log_ref.collection('entries').add(log_entry)

        return jsonify({'message': 'Meal logged', 'streak': current_streak}), 200
    except Exception as e:
        app.logger.error(f"Error logging meal: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500


@app.route('/api/streak', methods=['GET'])
@requires_auth
def get_streak():
    """Return the user's current meal logging streak in days."""
    try:
        user_id = request.current_user['uid']
        log_doc = db.collection('mealLogs').document(user_id).get()
        if not log_doc.exists:
            return jsonify({'streak': 0}), 200

        data = log_doc.to_dict()
        current_streak = data.get('current_streak', 0)
        last_logged = data.get('last_logged_date')

        if last_logged:
            last_logged_date = last_logged.date() if isinstance(last_logged, datetime) else datetime.strptime(last_logged, "%Y-%m-%d").date()
            today = datetime.utcnow().date()
            if last_logged_date < today - timedelta(days=1):
                current_streak = 0
                db.collection('mealLogs').document(user_id).update({'current_streak': 0})

        return jsonify({'streak': current_streak}), 200
    except Exception as e:
        app.logger.error(f"Error fetching streak: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/progress', methods=['POST'])
@requires_auth
def log_progress():
    """Log a weight/measurement entry for the progress tracker (advanced feature)."""
    try:
        user_id = request.current_user['uid']
        data = request.get_json() or {}
        weight = data.get('weight')
        date = data.get('date') or datetime.utcnow().date().isoformat()

        if weight is None:
            return jsonify({'error': 'weight is required'}), 400

        entry = {
            'date': date,
            'weight': float(weight),
            'note': data.get('note', ''),
            'created_at': firestore.SERVER_TIMESTAMP,
        }

        db.collection('progressLogs').document(user_id).collection('entries').document(date).set(entry)

        return jsonify({'message': 'Progress entry saved', 'entry': entry}), 200
    except Exception as e:
        app.logger.error(f"Error logging progress: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/progress', methods=['GET'])
@requires_auth
def get_progress():
    """Return the current user's weight history, sorted by date, for the trend chart."""
    try:
        user_id = request.current_user['uid']
        query = db.collection('progressLogs').document(user_id).collection('entries').order_by('date')
        entries = [doc.to_dict() for doc in query.stream()]
        return jsonify({'entries': entries}), 200
    except Exception as e:
        app.logger.error(f"Error fetching progress: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/water', methods=['POST'])
@requires_auth
def log_water():
    """Add to today's water intake total (advanced feature)."""
    try:
        user_id = request.current_user['uid']
        data = request.get_json() or {}
        amount_ml = data.get('amount_ml')
        date = data.get('date') or datetime.utcnow().date().isoformat()

        if amount_ml is None:
            return jsonify({'error': 'amount_ml is required'}), 400

        doc_ref = db.collection('waterLogs').document(user_id).collection('entries').document(date)
        doc_ref.set({
            'date': date,
            'total_ml': firestore.Increment(int(amount_ml)),
            'updated_at': firestore.SERVER_TIMESTAMP,
        }, merge=True)

        updated = doc_ref.get().to_dict()
        return jsonify({'message': 'Water logged', 'entry': updated}), 200
    except Exception as e:
        app.logger.error(f"Error logging water: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/water', methods=['GET'])
@requires_auth
def get_water():
    """Return water intake history and today's total."""
    try:
        user_id = request.current_user['uid']
        today = datetime.utcnow().date().isoformat()
        query = db.collection('waterLogs').document(user_id).collection('entries').order_by('date').limit(30)
        entries = [doc.to_dict() for doc in query.stream()]
        today_doc = db.collection('waterLogs').document(user_id).collection('entries').document(today).get()
        today_total = today_doc.to_dict().get('total_ml', 0) if today_doc.exists else 0
        return jsonify({'entries': entries, 'todayTotal': today_total, 'date': today}), 200
    except Exception as e:
        app.logger.error(f"Error fetching water log: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/exercise', methods=['POST'])
@requires_auth
def log_exercise():
    """Log an exercise session (advanced feature)."""
    try:
        user_id = request.current_user['uid']
        data = request.get_json() or {}
        activity = data.get('activity')
        duration_minutes = data.get('duration_minutes')
        date = data.get('date') or datetime.utcnow().date().isoformat()

        if not activity or duration_minutes is None:
            return jsonify({'error': 'activity and duration_minutes are required'}), 400

        entry = {
            'date': date,
            'activity': activity,
            'duration_minutes': int(duration_minutes),
            'calories_est': data.get('calories_est'),
            'created_at': firestore.SERVER_TIMESTAMP,
        }
        db.collection('exerciseLogs').document(user_id).collection('entries').add(entry)

        return jsonify({'message': 'Exercise logged', 'entry': entry}), 200
    except Exception as e:
        app.logger.error(f"Error logging exercise: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/exercise', methods=['GET'])
@requires_auth
def get_exercise():
    """Return recent exercise sessions."""
    try:
        user_id = request.current_user['uid']
        query = (
            db.collection('exerciseLogs').document(user_id).collection('entries')
            .order_by('created_at', direction=firestore.Query.DESCENDING)
            .limit(50)
        )
        entries = []
        for doc in query.stream():
            e = doc.to_dict()
            ts = e.get('created_at')
            entries.append({
                'id': doc.id,
                'date': e.get('date'),
                'activity': e.get('activity'),
                'duration_minutes': e.get('duration_minutes'),
                'calories_est': e.get('calories_est'),
                'created_at': ts.isoformat() if hasattr(ts, 'isoformat') else str(ts),
            })
        return jsonify({'entries': entries}), 200
    except Exception as e:
        app.logger.error(f"Error fetching exercise log: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
