from models import db, User, Algorithm, Category, LearningMaterial, LearningRecord, FavoriteAlgorithm
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func

class AdminService:
    def get_dashboard_stats(self):
        try:
            total_users = User.query.count()
            total_algorithms = Algorithm.query.count()
            total_categories = Category.query.count()
            total_materials = LearningMaterial.query.count()
            total_records = LearningRecord.query.count()

            users_by_role = {}
            roles = db.session.query(User.role_type, func.count(User.user_id)).group_by(User.role_type).all()
            for role, count in roles:
                users_by_role[role] = count

            recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
            recent_users_data = [
                {'user_id': u.user_id, 'username': u.username, 'email': u.email,
                 'role_type': u.role_type, 'status': u.status, 'created_at': u.created_at.isoformat()}
                for u in recent_users
            ]

            popular = db.session.query(
                Algorithm.name, Algorithm.type, func.count(FavoriteAlgorithm.favorite_id).label('fav_count')
            ).join(FavoriteAlgorithm, Algorithm.algorithm_id == FavoriteAlgorithm.algorithm_id, isouter=True) \
             .group_by(Algorithm.algorithm_id).order_by(func.count(FavoriteAlgorithm.favorite_id).desc()).limit(5).all()
            popular_algorithms = [{'name': p[0], 'type': p[1], 'favorite_count': p[2]} for p in popular]

            return {
                'success': True,
                'total_users': total_users,
                'total_algorithms': total_algorithms,
                'total_categories': total_categories,
                'total_materials': total_materials,
                'total_learning_records': total_records,
                'users_by_role': users_by_role,
                'recent_users': recent_users_data,
                'popular_algorithms': popular_algorithms,
            }
        except Exception as e:
            return {'success': False, 'message': str(e)}

    def get_all_users(self, page=1, limit=20, search=None):
        try:
            query = User.query
            if search:
                search_term = f'%{search}%'
                query = query.filter(
                    db.or_(User.username.ilike(search_term), User.email.ilike(search_term))
                )
            total = query.count()
            users = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
            users_data = [
                {'user_id': u.user_id, 'username': u.username, 'email': u.email,
                 'role_type': u.role_type, 'status': u.status, 'created_at': u.created_at.isoformat()}
                for u in users
            ]
            return {'success': True, 'users': users_data, 'total': total, 'page': page, 'limit': limit}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    def update_user_status(self, user_id, status):
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': '用户不存在'}
            if status not in ('active', 'disabled'):
                return {'success': False, 'message': '无效的状态'}
            if user.role_type == 'admin':
                return {'success': False, 'message': '不能禁用管理员账号'}
            user.status = status
            db.session.commit()
            return {'success': True, 'user': {'user_id': user.user_id, 'username': user.username, 'status': user.status}}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def delete_user(self, user_id):
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': '用户不存在'}
            if user.role_type == 'admin':
                return {'success': False, 'message': '不能删除管理员账号'}
            db.session.delete(user)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def create_algorithm(self, data):
        try:
            algorithm = Algorithm(
                name=data['name'],
                type=data['type'],
                description=data.get('description', ''),
                time_complexity=data.get('time_complexity', ''),
                space_complexity=data.get('space_complexity', ''),
                pseudocode=data.get('pseudocode', [])
            )
            db.session.add(algorithm)
            db.session.commit()
            return {'success': True, 'algorithm': algorithm}
        except IntegrityError:
            db.session.rollback()
            return {'success': False, 'message': '算法名称已存在'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def update_algorithm(self, algorithm_id, data):
        try:
            algorithm = Algorithm.query.get(algorithm_id)
            if not algorithm:
                return {'success': False, 'message': '算法不存在'}
            updatable = ['name', 'type', 'description', 'time_complexity', 'space_complexity', 'pseudocode']
            for field in updatable:
                if field in data:
                    setattr(algorithm, field, data[field])
            db.session.commit()
            return {'success': True, 'algorithm': algorithm}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def delete_algorithm(self, algorithm_id):
        try:
            algorithm = Algorithm.query.get(algorithm_id)
            if not algorithm:
                return {'success': False, 'message': '算法不存在'}
            db.session.delete(algorithm)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def get_all_categories(self):
        try:
            categories = Category.query.order_by(Category.sort_order).all()
            data = [
                {'category_id': c.category_id, 'name': c.name, 'description': c.description or '',
                 'sort_order': c.sort_order}
                for c in categories
            ]
            return {'success': True, 'categories': data}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    def create_category(self, data):
        try:
            category = Category(
                name=data['name'],
                description=data.get('description', ''),
                sort_order=data.get('sort_order', 0)
            )
            db.session.add(category)
            db.session.commit()
            return {'success': True, 'category': category}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def update_category(self, category_id, data):
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'success': False, 'message': '分类不存在'}
            for field in ['name', 'description', 'sort_order']:
                if field in data:
                    setattr(category, field, data[field])
            db.session.commit()
            return {'success': True, 'category': category}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def delete_category(self, category_id):
        try:
            category = Category.query.get(category_id)
            if not category:
                return {'success': False, 'message': '分类不存在'}
            db.session.delete(category)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def get_all_materials(self, page=1, limit=20):
        try:
            query = LearningMaterial.query.order_by(LearningMaterial.created_at.desc())
            total = query.count()
            materials = query.offset((page - 1) * limit).limit(limit).all()
            data = [
                {'material_id': m.material_id, 'title': m.title, 'content': m.content,
                 'category_id': m.category_id, 'algorithm_id': m.algorithm_id,
                 'code_example': m.code_example, 'created_at': m.created_at.isoformat()}
                for m in materials
            ]
            return {'success': True, 'materials': data, 'total': total, 'page': page, 'limit': limit}
        except Exception as e:
            return {'success': False, 'message': str(e)}

    def create_material(self, data):
        try:
            material = LearningMaterial(
                title=data['title'],
                content=data['content'],
                category_id=data.get('category_id'),
                algorithm_id=data.get('algorithm_id'),
                code_example=data.get('code_example')
            )
            db.session.add(material)
            db.session.commit()
            return {'success': True, 'material': material}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def update_material(self, material_id, data):
        try:
            material = LearningMaterial.query.get(material_id)
            if not material:
                return {'success': False, 'message': '学习材料不存在'}
            for field in ['title', 'content', 'category_id', 'algorithm_id', 'code_example']:
                if field in data:
                    setattr(material, field, data[field])
            db.session.commit()
            return {'success': True, 'material': material}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}

    def delete_material(self, material_id):
        try:
            material = LearningMaterial.query.get(material_id)
            if not material:
                return {'success': False, 'message': '学习材料不存在'}
            db.session.delete(material)
            db.session.commit()
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': str(e)}
