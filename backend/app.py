import os
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "https://6rs-decisiontree-solution.vercel.app/"}})

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    processes = db.relationship('Process', backref='user', lazy=True)

    def __init__(self, email, password):
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class Process(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    strategy_name = db.Column(db.String(50), nullable=False)
    history_json = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'This email is already registered'}), 409

    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token})

@app.route('/save_process', methods=['POST'])
@token_required
def save_process(current_user):
    data = request.get_json()
    process_history = data.get('processHistory')

    if not process_history:
        return jsonify({'message': 'Process history is required'}), 400

    final_strategy = next((item for item in reversed(process_history) if item.get('type') == 'strategy'), None)

    if not final_strategy:
         return jsonify({'message': 'Could not determine final strategy from history'}), 400

    new_process = Process(
        user_id=current_user.id,
        strategy_name=final_strategy.get('name', 'UNKNOWN'),
        history_json=process_history
    )
    db.session.add(new_process)
    db.session.commit()

    return jsonify({'message': 'Process saved successfully'}), 201

@app.route('/processes', methods=['GET'])
@token_required
def get_processes(current_user):
    user_processes = Process.query.filter_by(user_id=current_user.id).order_by(Process.created_at.desc()).all()
    
    output = []
    for process in user_processes:
        process_data = {
            'id': process.id,
            'strategy_name': process.strategy_name,
            'created_at': process.created_at.isoformat(),
            'history': process.history_json
        }
        output.append(process_data)
        
    return jsonify({'processes': output})

if __name__ == '__main__':
    app.run(debug=True)