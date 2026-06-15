from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role_type = db.Column(db.String(20), nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    status = db.Column(db.String(20), default='active')
    
    # 关系
    learning_records = db.relationship('LearningRecord', backref='user', lazy=True, cascade='all, delete-orphan')
    favorite_algorithms = db.relationship('FavoriteAlgorithm', backref='user', lazy=True, cascade='all, delete-orphan')

class Algorithm(db.Model):
    __tablename__ = 'algorithms'
    
    algorithm_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, index=True)
    type = db.Column(db.String(50), nullable=False, index=True)  # sorting, searching, tree
    description = db.Column(db.Text)
    time_complexity = db.Column(db.String(50))
    space_complexity = db.Column(db.String(50))
    pseudocode = db.Column(db.JSON)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    # 关系
    animation_data = db.relationship('AnimationData', backref='algorithm', lazy=True, cascade='all, delete-orphan')
    learning_materials = db.relationship('LearningMaterial', backref='algorithm', lazy=True, cascade='all, delete-orphan')
    learning_records = db.relationship('LearningRecord', backref='algorithm', lazy=True, cascade='all, delete-orphan')
    favorite_algorithms = db.relationship('FavoriteAlgorithm', backref='algorithm', lazy=True, cascade='all, delete-orphan')

class AnimationData(db.Model):
    __tablename__ = 'animation_data'
    
    animation_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    algorithm_id = db.Column(db.String(36), db.ForeignKey('algorithms.algorithm_id'), nullable=False, index=True)
    animation_steps = db.Column(db.JSON, nullable=False)
    initial_data = db.Column(db.JSON, nullable=False)
    visualization_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

class Category(db.Model):
    __tablename__ = 'categories'
    
    category_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    sort_order = db.Column(db.Integer, default=0)
    
    # 关系
    learning_materials = db.relationship('LearningMaterial', backref='category', lazy=True, cascade='all, delete-orphan')

class LearningMaterial(db.Model):
    __tablename__ = 'learning_materials'
    
    material_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = db.Column(db.String(36), db.ForeignKey('categories.category_id'), nullable=False, index=True)
    algorithm_id = db.Column(db.String(36), db.ForeignKey('algorithms.algorithm_id'), nullable=True, index=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    code_example = db.Column(db.JSON)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

class LearningRecord(db.Model):
    __tablename__ = 'learning_records'
    
    record_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False, index=True)
    algorithm_id = db.Column(db.String(36), db.ForeignKey('algorithms.algorithm_id'), nullable=False, index=True)
    learned_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, index=True)
    duration_seconds = db.Column(db.Integer, default=0)
    progress_status = db.Column(db.String(20), default='in_progress')  # not_started, in_progress, completed
    
    __table_args__ = (db.UniqueConstraint('user_id', 'algorithm_id', name='_user_algorithm_uc'),)

class FavoriteAlgorithm(db.Model):
    __tablename__ = 'favorite_algorithms'
    
    favorite_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.user_id'), nullable=False, index=True)
    algorithm_id = db.Column(db.String(36), db.ForeignKey('algorithms.algorithm_id'), nullable=False, index=True)
    favorited_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'algorithm_id', name='_user_favorite_uc'),)