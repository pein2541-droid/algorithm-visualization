import bcrypt
from datetime import datetime
from models import db, User, LearningRecord
from sqlalchemy.exc import IntegrityError

class UserService:
    def register_user(self, username, email, password, role_type='student'):
        """注册用户"""
        try:
            # 检查用户名是否已存在
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                return {'success': False, 'message': '用户名已存在'}
            
            # 检查邮箱是否已存在
            existing_email = User.query.filter_by(email=email).first()
            if existing_email:
                return {'success': False, 'message': '邮箱已被使用'}
            
            # 密码加密
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # 创建新用户
            new_user = User(
                username=username,
                email=email,
                password_hash=password_hash,
                role_type=role_type,
                status='active'
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            return {'success': True, 'user': new_user}
            
        except IntegrityError as e:
            db.session.rollback()
            return {'success': False, 'message': '数据库错误: 可能是用户名或邮箱重复'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'注册失败: {str(e)}'}
    
    def authenticate_user(self, username, password):
        """验证用户登录"""
        try:
            # 查找用户
            user = User.query.filter_by(username=username, status='active').first()
            
            if not user:
                return {'success': False, 'message': '用户不存在或已被禁用'}
            
            # 验证密码
            if bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
                return {'success': True, 'user': user}
            else:
                return {'success': False, 'message': '密码错误'}
                
        except Exception as e:
            return {'success': False, 'message': f'登录失败: {str(e)}'}
    
    def get_user_by_id(self, user_id):
        """根据ID获取用户"""
        try:
            user = User.query.get(user_id)
            return user
        except Exception as e:
            return None
    
    def update_user_profile(self, user_id, **kwargs):
        """更新用户资料"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'message': '用户不存在'}
            
            # 更新允许的字段
            allowed_fields = ['email']
            for field in allowed_fields:
                if field in kwargs:
                    setattr(user, field, kwargs[field])
            
            db.session.commit()
            return {'success': True, 'user': user}
            
        except IntegrityError as e:
            db.session.rollback()
            return {'success': False, 'message': '更新失败: 可能是邮箱已被使用'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'更新失败: {str(e)}'}
    
    def record_learning_progress(self, user_id, algorithm_id, duration_seconds=0, progress_status='in_progress'):
        """记录学习进度"""
        try:
            # 查找是否已有学习记录
            record = LearningRecord.query.filter_by(
                user_id=user_id,
                algorithm_id=algorithm_id
            ).first()
            
            if record:
                # 更新现有记录
                record.duration_seconds += duration_seconds
                record.progress_status = progress_status
                record.learned_at = datetime.utcnow()
            else:
                # 创建新记录
                record = LearningRecord(
                    user_id=user_id,
                    algorithm_id=algorithm_id,
                    duration_seconds=duration_seconds,
                    progress_status=progress_status
                )
                db.session.add(record)
            
            db.session.commit()
            return {'success': True, 'record': record}
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'message': f'记录学习进度失败: {str(e)}'}
    
    def get_user_learning_stats(self, user_id):
        """获取用户学习统计"""
        try:
            # 获取学习记录总数
            total_records = LearningRecord.query.filter_by(user_id=user_id).count()
            
            # 获取已完成的学习记录
            completed_records = LearningRecord.query.filter_by(
                user_id=user_id,
                progress_status='completed'
            ).count()
            
            # 获取总学习时长
            total_duration = db.session.query(db.func.sum(LearningRecord.duration_seconds)).filter_by(
                user_id=user_id
            ).scalar() or 0
            
            # 获取最近学习的算法
            recent_records = LearningRecord.query.filter_by(user_id=user_id).order_by(
                LearningRecord.learned_at.desc()
            ).limit(5).all()
            
            return {
                'total_records': total_records,
                'completed_records': completed_records,
                'total_duration': total_duration,
                'recent_records': recent_records
            }
            
        except Exception as e:
            return {
                'total_records': 0,
                'completed_records': 0,
                'total_duration': 0,
                'recent_records': []
            }