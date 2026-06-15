from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from functools import wraps
import os
from dotenv import load_dotenv
from models import db, User, Algorithm, AnimationData, LearningMaterial, Category, LearningRecord, FavoriteAlgorithm
from schemas import user_schema, algorithm_schema, algorithms_schema
from services.animation_service import AnimationService
from services.user_service import UserService
from services.admin_service import AdminService

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///algorithm_animation.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

# 初始化服务
animation_service = AnimationService()
user_service = UserService()
admin_service = AdminService()

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def decorator(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or user.role_type != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return decorator

def seed_initial_data():
    try:
        sample_algorithms = [
                {
                    'name': '冒泡排序',
                    'type': 'sorting',
                    'description': '通过重复遍历数列、比较相邻元素并交换位置实现排序',
                    'time_complexity': 'O(n²)',
                    'space_complexity': 'O(1)',
                    'pseudocode': [
                        'def bubble_sort(arr):',
                        '    n = len(arr)',
                        '    for i in range(n):',
                        '        for j in range(0, n - i - 1):',
                        '            if arr[j] > arr[j + 1]:',
                        '                arr[j], arr[j + 1] = arr[j + 1], arr[j]'
                    ]
                },
                {
                    'name': '0/1背包（DP）',
                    'type': 'dp',
                    'description': '使用动态规划解决0/1背包问题',
                    'time_complexity': 'O(n·W)',
                    'space_complexity': 'O(n·W)',
                    'pseudocode': [
                        'def knapsack(weights, values, W):',
                        '    n = len(weights)',
                        '    dp = [[0]*(W+1) for _ in range(n+1)]',
                        '    for i in range(1, n+1):',
                        '        for w in range(1, W+1):',
                        '            if weights[i-1] <= w:',
                        '                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])',
                        '            else:',
                        '                dp[i][w] = dp[i-1][w]',
                        '    return dp[n][W]'
                    ]
                },
                {
                    'name': '深度优先搜索（DFS）',
                    'type': 'graph',
                    'description': '图的深度优先遍历',
                    'time_complexity': 'O(V+E)',
                    'space_complexity': 'O(V)',
                    'pseudocode': [
                        'def dfs(graph, start, visited=None):',
                        '    if visited is None:',
                        '        visited = set()',
                        '    visited.add(start)',
                        '    for v in graph[start]:',
                        '        if v not in visited:',
                        '            dfs(graph, v, visited)'
                    ]
                },
                {
                    'name': '广度优先搜索（BFS）',
                    'type': 'graph',
                    'description': '图的广度优先遍历',
                    'time_complexity': 'O(V+E)',
                    'space_complexity': 'O(V)',
                    'pseudocode': [
                        'from collections import deque',
                        'def bfs(graph, start):',
                        '    q = deque([start])',
                        '    visited = set([start])',
                        '    while q:',
                        '        u = q.popleft()',
                        '        for v in graph[u]:',
                        '            if v not in visited:',
                        '                visited.add(v)',
                        '                q.append(v)'
                    ]
                },
                {
                    'name': '快速排序',
                    'type': 'sorting',
                    'description': '分治法：选取基准，将数组分为两部分并递归排序',
                    'time_complexity': 'O(n log n)',
                    'space_complexity': 'O(log n)',
                    'pseudocode': [
                        'def quick_sort(arr):',
                        '    if len(arr) <= 1:',
                        '        return arr',
                        "    pivot = arr[len(arr)//2]",
                        '    left = [x for x in arr if x < pivot]',
                        '    middle = [x for x in arr if x == pivot]',
                        '    right = [x for x in arr if x > pivot]',
                        '    return quick_sort(left) + middle + quick_sort(right)'
                    ]
                },
                {
                    'name': '归并排序',
                    'type': 'sorting',
                    'description': '分治法：将数组分成子数组，排序后合并',
                    'time_complexity': 'O(n log n)',
                    'space_complexity': 'O(n)',
                    'pseudocode': [
                        'def merge_sort(arr):',
                        '    if len(arr) > 1:',
                        '        mid = len(arr) // 2',
                        '        left = arr[:mid]',
                        '        right = arr[mid:]',
                        '        merge_sort(left)',
                        '        merge_sort(right)',
                        '        i = j = k = 0',
                        '        while i < len(left) and j < len(right):',
                        '            if left[i] < right[j]:',
                        '                arr[k] = left[i]; i += 1',
                        '            else:',
                        '                arr[k] = right[j]; j += 1',
                        '            k += 1',
                        '        while i < len(left): arr[k] = left[i]; i += 1; k += 1',
                        '        while j < len(right): arr[k] = right[j]; j += 1; k += 1'
                    ]
                },
                {
                    'name': '二分查找',
                    'type': 'searching',
                    'description': '在有序数组中查找目标元素的位置',
                    'time_complexity': 'O(log n)',
                    'space_complexity': 'O(1)',
                    'pseudocode': [
                        'def binary_search(arr, target):',
                        '    low, high = 0, len(arr) - 1',
                        '    while low <= high:',
                        '        mid = (low + high) // 2',
                        '        if arr[mid] == target:',
                        '            return mid',
                        '        elif arr[mid] < target:',
                        '            low = mid + 1',
                        '        else:',
                        '            high = mid - 1',
                        '    return -1'
                    ]
                },
                {
                    'name': '线性查找',
                    'type': 'searching',
                    'description': '从头到尾依次比较元素寻找目标值',
                    'time_complexity': 'O(n)',
                    'space_complexity': 'O(1)',
                    'pseudocode': [
                        'def linear_search(arr, target):',
                        '    for i, x in enumerate(arr):',
                        '        if x == target:',
                        '            return i',
                        '    return -1'
                    ]
                },
                {
                    'name': '二叉树遍历（中序）',
                    'type': 'tree',
                    'description': '访问顺序：左-根-右',
                    'time_complexity': 'O(n)',
                    'space_complexity': 'O(n)',
                    'pseudocode': [
                        'def inorder(node):',
                        '    if not node:',
                        '        return',
                        '    inorder(node.left)',
                        '    print(node.val)',
                        '    inorder(node.right)'
                    ]
                }
        ]
        for a in sample_algorithms:
            exists = Algorithm.query.filter_by(name=a['name']).first()
            if not exists:
                algo = Algorithm(
                    name=a['name'],
                    type=a['type'],
                    description=a['description'],
                    time_complexity=a['time_complexity'],
                    space_complexity=a['space_complexity'],
                    pseudocode=a['pseudocode']
                )
                db.session.add(algo)
        # 创建默认管理员账号
        admin_exists = User.query.filter_by(username='admin').first()
        if not admin_exists:
            import bcrypt
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=bcrypt.hashpw(b'admin123', bcrypt.gensalt()).decode('utf-8'),
                role_type='admin',
                status='active'
            )
            db.session.add(admin)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print('Seed data failed:', e)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

# 用户认证API
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role_type = data.get('role_type', 'student')
        
        if not all([username, email, password]):
            return jsonify({'error': '缺少必要参数'}), 400
        
        result = user_service.register_user(username, email, password, role_type)
        if result['success']:
            return jsonify({
                'status': 'success',
                'data': user_schema.dump(result['user'])
            }), 201
        else:
            return jsonify({'error': result['message']}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({'error': '缺少必要参数'}), 400
        
        result = user_service.authenticate_user(username, password)
        if result['success']:
            access_token = create_access_token(identity=result['user'].user_id)
            return jsonify({
                'status': 'success',
                'data': {
                    'token': access_token,
                    'user': user_schema.dump(result['user'])
                }
            })
        else:
            return jsonify({'error': result['message']}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 算法数据API
@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    try:
        algorithm_type = request.args.get('type')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        query = Algorithm.query
        if algorithm_type:
            query = query.filter_by(type=algorithm_type)
        
        algorithms = query.paginate(page=page, per_page=limit, error_out=False)
        
        return jsonify({
            'status': 'success',
            'data': {
                'algorithms': algorithms_schema.dump(algorithms.items),
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': algorithms.total,
                    'pages': algorithms.pages
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/algorithms/<algorithm_id>', methods=['GET'])
def get_algorithm(algorithm_id):
    try:
        algorithm = Algorithm.query.get_or_404(str(algorithm_id))
        return jsonify({
            'status': 'success',
            'data': algorithm_schema.dump(algorithm)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/algorithms/<algorithm_id>/animation', methods=['GET'])
def get_algorithm_animation(algorithm_id):
    try:
        algorithm = Algorithm.query.get_or_404(str(algorithm_id))
        animation_data = AnimationData.query.filter_by(algorithm_id=str(algorithm_id)).first()
        
        if not animation_data:
            # 如果没有动画数据，生成新的动画数据
            animation_data = animation_service.generate_animation_data(algorithm)
        
        return jsonify({
            'status': 'success',
            'data': {
                'algorithm': algorithm_schema.dump(algorithm),
                'animation_steps': animation_data.animation_steps,
                'initial_data': animation_data.initial_data,
                'visualization_type': animation_data.visualization_type
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 学习资料API
@app.route('/api/learning/categories', methods=['GET'])
def get_learning_categories():
    try:
        categories = Category.query.order_by(Category.sort_order).all()
        return jsonify({
            'status': 'success',
            'data': [{'category_id': str(cat.category_id), 'name': cat.name, 'description': cat.description} for cat in categories]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/learning/categories/<uuid:category_id>/content', methods=['GET'])
def get_category_content(category_id):
    try:
        materials = LearningMaterial.query.filter_by(category_id=category_id).all()
        return jsonify({
            'status': 'success',
            'data': [{
                'material_id': str(mat.material_id),
                'title': mat.title,
                'content': mat.content,
                'code_example': mat.code_example,
                'created_at': mat.created_at.isoformat()
            } for mat in materials]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 用户相关API（需要认证）
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        # 获取学习记录
        learning_records = LearningRecord.query.filter_by(user_id=user_id).order_by(LearningRecord.learned_at.desc()).limit(10).all()
        
        # 获取收藏的算法
        favorite_algorithms = FavoriteAlgorithm.query.filter_by(user_id=user_id).order_by(FavoriteAlgorithm.favorited_at.desc()).limit(10).all()
        
        return jsonify({
            'status': 'success',
            'data': {
                'user': user_schema.dump(user),
                'learning_records': [{
                    'algorithm_name': record.algorithm.name,
                    'learned_at': record.learned_at.isoformat(),
                    'duration_seconds': record.duration_seconds,
                    'progress_status': record.progress_status
                } for record in learning_records],
                'favorite_algorithms': [{
                    'algorithm_name': fav.algorithm.name,
                    'algorithm_type': fav.algorithm.type,
                    'favorited_at': fav.favorited_at.isoformat()
                } for fav in favorite_algorithms]
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 管理员API
@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_stats():
    result = admin_service.get_dashboard_stats()
    if result['success']:
        return jsonify({'status': 'success', 'data': result})
    return jsonify({'error': result['message']}), 500

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    search = request.args.get('search')
    result = admin_service.get_all_users(page, limit, search)
    if result['success']:
        return jsonify({'status': 'success', 'data': result})
    return jsonify({'error': result['message']}), 500

@app.route('/api/admin/users/<user_id>/status', methods=['PUT'])
@admin_required
def admin_update_user_status(user_id):
    data = request.get_json()
    status = data.get('status')
    if not status:
        return jsonify({'error': '缺少status参数'}), 400
    result = admin_service.update_user_status(user_id, status)
    if result['success']:
        return jsonify({'status': 'success', 'data': result['user']})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    result = admin_service.delete_user(user_id)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/algorithms', methods=['POST'])
@admin_required
def admin_create_algorithm():
    data = request.get_json()
    if not data.get('name') or not data.get('type'):
        return jsonify({'error': '缺少必要参数'}), 400
    result = admin_service.create_algorithm(data)
    if result['success']:
        return jsonify({'status': 'success', 'data': algorithm_schema.dump(result['algorithm'])}), 201
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/algorithms/<algorithm_id>', methods=['PUT'])
@admin_required
def admin_update_algorithm(algorithm_id):
    data = request.get_json()
    result = admin_service.update_algorithm(algorithm_id, data)
    if result['success']:
        return jsonify({'status': 'success', 'data': algorithm_schema.dump(result['algorithm'])})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/algorithms/<algorithm_id>', methods=['DELETE'])
@admin_required
def admin_delete_algorithm(algorithm_id):
    result = admin_service.delete_algorithm(algorithm_id)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/categories', methods=['GET'])
@admin_required
def admin_get_categories():
    result = admin_service.get_all_categories()
    if result['success']:
        return jsonify({'status': 'success', 'data': result['categories']})
    return jsonify({'error': result['message']}), 500

@app.route('/api/admin/categories', methods=['POST'])
@admin_required
def admin_create_category():
    data = request.get_json()
    if not data.get('name'):
        return jsonify({'error': '缺少分类名称'}), 400
    result = admin_service.create_category(data)
    if result['success']:
        return jsonify({'status': 'success', 'data': result['category'].category_id}), 201
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/categories/<category_id>', methods=['PUT'])
@admin_required
def admin_update_category(category_id):
    data = request.get_json()
    result = admin_service.update_category(category_id, data)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/categories/<category_id>', methods=['DELETE'])
@admin_required
def admin_delete_category(category_id):
    result = admin_service.delete_category(category_id)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/materials', methods=['GET'])
@admin_required
def admin_get_materials():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    result = admin_service.get_all_materials(page, limit)
    if result['success']:
        return jsonify({'status': 'success', 'data': result})
    return jsonify({'error': result['message']}), 500

@app.route('/api/admin/materials', methods=['POST'])
@admin_required
def admin_create_material():
    data = request.get_json()
    if not data.get('title') or not data.get('content'):
        return jsonify({'error': '缺少必要参数'}), 400
    result = admin_service.create_material(data)
    if result['success']:
        return jsonify({'status': 'success', 'data': result['material'].material_id}), 201
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/materials/<material_id>', methods=['PUT'])
@admin_required
def admin_update_material(material_id):
    data = request.get_json()
    result = admin_service.update_material(material_id, data)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

@app.route('/api/admin/materials/<material_id>', methods=['DELETE'])
@admin_required
def admin_delete_material(material_id):
    result = admin_service.delete_material(material_id)
    if result['success']:
        return jsonify({'status': 'success'})
    return jsonify({'error': result['message']}), 400

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_initial_data()
    app.run(debug=True, host='0.0.0.0', port=5000)
