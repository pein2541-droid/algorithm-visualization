from marshmallow import Schema, fields, validate
from models import User, Algorithm

class UserSchema(Schema):
    user_id = fields.Str(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    role_type = fields.Str(required=True, validate=validate.OneOf(['student', 'teacher', 'admin']))
    created_at = fields.DateTime(dump_only=True)
    status = fields.Str(dump_only=True)

class AlgorithmSchema(Schema):
    algorithm_id = fields.Str(dump_only=True)
    name = fields.Str(required=True)
    type = fields.Str(required=True, validate=validate.OneOf(['sorting', 'searching', 'tree', 'dp', 'graph']))
    description = fields.Str()
    time_complexity = fields.Str()
    space_complexity = fields.Str()
    pseudocode = fields.Raw()
    created_at = fields.DateTime(dump_only=True)

# 初始化schema实例
user_schema = UserSchema()
users_schema = UserSchema(many=True)
algorithm_schema = AlgorithmSchema()
algorithms_schema = AlgorithmSchema(many=True)
