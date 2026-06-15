import random
from datetime import datetime
from models import AnimationData, db

class AnimationService:
    def __init__(self):
        self.colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    
    def generate_animation_data(self, algorithm):
        """为算法生成动画数据"""
        try:
            # 生成示例数据
            data_size = 10
            initial_data = [random.randint(1, 100) for _ in range(data_size)]
            
            # 根据算法类型生成不同的动画步骤
            if algorithm.type == 'sorting':
                animation_steps = self._generate_sorting_animation(algorithm.name, initial_data)
            elif algorithm.type == 'searching':
                animation_steps = self._generate_searching_animation(algorithm.name, initial_data)
            elif algorithm.type == 'tree':
                animation_steps = self._generate_tree_animation(algorithm.name, initial_data)
            elif algorithm.type == 'dp':
                animation_steps, initial_data = self._generate_dp_animation(algorithm.name)
            elif algorithm.type == 'graph':
                animation_steps, initial_data = self._generate_graph_animation(algorithm.name)
            else:
                animation_steps = self._generate_default_animation(initial_data)
            
            # 创建动画数据记录
            animation_data = AnimationData(
                algorithm_id=algorithm.algorithm_id,
                animation_steps=animation_steps,
                initial_data=initial_data,
                visualization_type=self._get_visualization_type(algorithm.type)
            )
            
            db.session.add(animation_data)
            db.session.commit()
            
            return animation_data
            
        except Exception as e:
            db.session.rollback()
            raise e
    
    def _generate_sorting_animation(self, algorithm_name, data):
        """生成排序算法动画步骤"""
        steps = []
        arr = data.copy()
        
        if algorithm_name == '冒泡排序':
            steps = self._bubble_sort_animation(arr)
        elif algorithm_name == '快速排序':
            steps = self._quick_sort_animation(arr, 0, len(arr) - 1)
        else:
            steps = self._generic_sort_animation(arr)
        
        return steps
    
    def _bubble_sort_animation(self, arr):
        """冒泡排序动画"""
        steps = []
        n = len(arr)
        
        for i in range(n):
            for j in range(0, n - i - 1):
                # 高亮当前比较的元素
                step = {
                    'step': len(steps),
                    'action': 'compare',
                    'indices': [j, j + 1],
                    'data': arr.copy(),
                    'highlighted': [j, j + 1],
                    'description': f'比较元素 {arr[j]} 和 {arr[j + 1]}'
                }
                steps.append(step)
                
                if arr[j] > arr[j + 1]:
                    # 交换元素
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
                    step = {
                        'step': len(steps),
                        'action': 'swap',
                        'indices': [j, j + 1],
                        'data': arr.copy(),
                        'highlighted': [j, j + 1],
                        'description': f'交换元素 {arr[j + 1]} 和 {arr[j]}'
                    }
                    steps.append(step)
        
        # 最终状态
        final_step = {
            'step': len(steps),
            'action': 'complete',
            'data': arr.copy(),
            'highlighted': [],
            'description': '排序完成'
        }
        steps.append(final_step)
        
        return steps
    
    def _quick_sort_animation(self, arr, low, high):
        """快速排序动画"""
        steps = []
        
        if low < high:
            # 分区步骤
            pi = self._partition_animation(arr, low, high, steps)
            
            # 递归处理左右两部分
            left_steps = self._quick_sort_animation(arr, low, pi - 1)
            right_steps = self._quick_sort_animation(arr, pi + 1, high)
            
            steps.extend(left_steps)
            steps.extend(right_steps)
        
        return steps
    
    def _partition_animation(self, arr, low, high, steps):
        """分区动画"""
        pivot = arr[high]
        i = low - 1
        
        # 高亮基准元素
        step = {
            'step': len(steps),
            'action': 'pivot',
            'pivot_index': high,
            'data': arr.copy(),
            'highlighted': [high],
            'description': f'选择基准元素 {pivot}'
        }
        steps.append(step)
        
        for j in range(low, high):
            # 比较元素与基准
            step = {
                'step': len(steps),
                'action': 'compare',
                'indices': [j, high],
                'data': arr.copy(),
                'highlighted': [j, high],
                'description': f'比较 {arr[j]} 与基准 {pivot}'
            }
            steps.append(step)
            
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                step = {
                    'step': len(steps),
                    'action': 'swap',
                    'indices': [i, j],
                    'data': arr.copy(),
                    'highlighted': [i, j],
                    'description': f'交换元素 {arr[j]} 和 {arr[i]}'
                }
                steps.append(step)
        
        # 交换基准元素到正确位置
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        step = {
            'step': len(steps),
            'action': 'swap',
            'indices': [i + 1, high],
            'data': arr.copy(),
            'highlighted': [i + 1, high],
            'description': f'将基准元素放到正确位置'
        }
        steps.append(step)
        
        return i + 1
    
    def _generate_searching_animation(self, algorithm_name, data):
        """生成查找算法动画步骤"""
        steps = []
        arr = sorted(data)  # 查找算法需要有序数据
        target = random.choice(arr)
        
        if algorithm_name == '二分查找':
            steps = self._binary_search_animation(arr, target)
        else:
            steps = self._linear_search_animation(arr, target)
        
        return steps
    
    def _binary_search_animation(self, arr, target):
        """二分查找动画"""
        steps = []
        low, high = 0, len(arr) - 1
        
        while low <= high:
            mid = (low + high) // 2
            
            step = {
                'step': len(steps),
                'action': 'search',
                'search_range': [low, high],
                'mid_index': mid,
                'data': arr.copy(),
                'highlighted': [low, high],
                'description': f'查找范围 [{low}, {high}]，中间位置 {mid}'
            }
            steps.append(step)
            
            if arr[mid] == target:
                step = {
                    'step': len(steps),
                    'action': 'found',
                    'found_index': mid,
                    'data': arr.copy(),
                    'highlighted': [mid],
                    'description': f'找到目标元素 {target} 在位置 {mid}'
                }
                steps.append(step)
                break
            elif arr[mid] < target:
                low = mid + 1
            else:
                high = mid - 1
        
        return steps
    
    def _linear_search_animation(self, arr, target):
        """线性查找动画"""
        steps = []
        
        for i in range(len(arr)):
            step = {
                'step': len(steps),
                'action': 'compare',
                'current_index': i,
                'data': arr.copy(),
                'highlighted': [i],
                'description': f'比较位置 {i} 的元素 {arr[i]} 与目标 {target}'
            }
            steps.append(step)
            
            if arr[i] == target:
                step = {
                    'step': len(steps),
                    'action': 'found',
                    'found_index': i,
                    'data': arr.copy(),
                    'highlighted': [i],
                    'description': f'找到目标元素 {target} 在位置 {i}'
                }
                steps.append(step)
                break
        
        return steps
    
    def _generate_tree_animation(self, algorithm_name, data):
        """生成树结构算法动画"""
        steps = []
        
        # 简化的树结构动画
        tree_data = self._create_sample_tree(data[:7])  # 使用前7个元素创建树
        
        step = {
            'step': 0,
            'action': 'create_tree',
            'tree_data': tree_data,
            'description': '创建二叉搜索树'
        }
        steps.append(step)
        
        # 添加遍历动画
        if algorithm_name and '遍历' in algorithm_name:
            traversal_steps = self._tree_traversal_animation(tree_data, algorithm_name)
            steps.extend(traversal_steps)
        
        return steps
    
    def _create_sample_tree(self, data):
        """创建示例树结构"""
        # 简化的树结构表示
        return {
            'root': data[0],
            'left': {
                'root': data[1],
                'left': {'root': data[3]},
                'right': {'root': data[4]}
            },
            'right': {
                'root': data[2],
                'left': {'root': data[5]},
                'right': {'root': data[6]}
            }
        }
    
    def _tree_traversal_animation(self, tree_data, traversal_type):
        """树遍历动画"""
        steps = []
        
        if '前序' in traversal_type:
            result = self._preorder_traversal(tree_data)
            traversal_name = '前序遍历'
        elif '中序' in traversal_type:
            result = self._inorder_traversal(tree_data)
            traversal_name = '中序遍历'
        else:
            result = self._postorder_traversal(tree_data)
            traversal_name = '后序遍历'
        
        for i, node in enumerate(result):
            step = {
                'step': len(steps),
                'action': 'visit_node',
                'node_value': node,
                'visit_order': i,
                'description': f'{traversal_name}: 访问节点 {node}'
            }
            steps.append(step)
        
        return steps
    
    def _preorder_traversal(self, node):
        """前序遍历"""
        if not node:
            return []
        result = [node['root']]
        if 'left' in node:
            result.extend(self._preorder_traversal(node['left']))
        if 'right' in node:
            result.extend(self._preorder_traversal(node['right']))
        return result
    
    def _inorder_traversal(self, node):
        """中序遍历"""
        if not node:
            return []
        result = []
        if 'left' in node:
            result.extend(self._inorder_traversal(node['left']))
        result.append(node['root'])
        if 'right' in node:
            result.extend(self._inorder_traversal(node['right']))
        return result
    
    def _postorder_traversal(self, node):
        """后序遍历"""
        if not node:
            return []
        result = []
        if 'left' in node:
            result.extend(self._postorder_traversal(node['left']))
        if 'right' in node:
            result.extend(self._postorder_traversal(node['right']))
        result.append(node['root'])
        return result
    
    def _generic_sort_animation(self, arr):
        """通用排序动画"""
        steps = []
        n = len(arr)
        
        for i in range(n):
            for j in range(i + 1, n):
                step = {
                    'step': len(steps),
                    'action': 'compare',
                    'indices': [i, j],
                    'data': arr.copy(),
                    'highlighted': [i, j],
                    'description': f'比较元素 {arr[i]} 和 {arr[j]}'
                }
                steps.append(step)
                
                if arr[i] > arr[j]:
                    arr[i], arr[j] = arr[j], arr[i]
                    step = {
                        'step': len(steps),
                        'action': 'swap',
                        'indices': [i, j],
                        'data': arr.copy(),
                        'highlighted': [i, j],
                        'description': f'交换元素 {arr[j]} 和 {arr[i]}'
                    }
                    steps.append(step)
        
        return steps
    
    def _generate_default_animation(self, data):
        """默认动画"""
        return [{
            'step': 0,
            'action': 'display',
            'data': data.copy(),
            'description': '显示初始数据'
        }]
    
    def _get_visualization_type(self, algorithm_type):
        """获取可视化类型"""
        visualization_types = {
            'sorting': 'bar_chart',
            'searching': 'array_highlight',
            'tree': 'tree_structure',
            'dp': 'matrix',
            'graph': 'graph_traversal'
        }
        return visualization_types.get(algorithm_type, 'default')

    def _generate_dp_animation(self, algorithm_name):
        """生成DP算法动画步骤（示例：0/1背包）"""
        # 背包容量与物品
        capacity = 10
        items = [
            {'weight': 2, 'value': 6},
            {'weight': 2, 'value': 3},
            {'weight': 6, 'value': 5},
            {'weight': 5, 'value': 4},
            {'weight': 4, 'value': 6},
        ]
        n = len(items)
        # dp 表 (n+1) x (capacity+1)
        dp = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
        steps = []

        for i in range(1, n + 1):
            w_i = items[i - 1]['weight']
            v_i = items[i - 1]['value']
            for w in range(1, capacity + 1):
                if w_i <= w:
                    dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - w_i] + v_i)
                    action = 'update'
                    desc = f'考虑物品{i} (重{w_i},值{v_i})，容量{w}：max(不选={dp[i-1][w]}, 选={dp[i-1][w-w_i]}+{v_i})'
                else:
                    dp[i][w] = dp[i - 1][w]
                    action = 'carry'
                    desc = f'容量{w}不足以放入物品{i} (重{w_i})，沿用上层值 {dp[i][w]}'

                steps.append({
                    'step': len(steps),
                    'action': action,
                    'data': [row.copy() for row in dp],
                    'highlighted_cell': [i, w],
                    'description': desc
                })

        steps.append({
            'step': len(steps),
            'action': 'complete',
            'data': [row.copy() for row in dp],
            'highlighted_cell': [],
            'description': f'最优值为 {dp[n][capacity]}'
        })

        # initial_data 设为 dp 初始状态
        initial = [[0 for _ in range(capacity + 1)] for _ in range(n + 1)]
        return steps, initial

    def _generate_graph_animation(self, algorithm_name):
        """生成图遍历动画步骤（DFS/BFS）"""
        # 示例图（无向图）
        nodes = ['A', 'B', 'C', 'D', 'E']
        adj = {
            'A': ['B', 'C'],
            'B': ['A', 'D', 'E'],
            'C': ['A', 'D'],
            'D': ['B', 'C', 'E'],
            'E': ['B', 'D']
        }
        start = 'A'
        steps = []

        def snapshot(current=None, visited=set(), frontier=list(), action='visit', desc=''):
            nodes_state = [
                {
                    'id': i,
                    'label': n,
                    'visited': n in visited,
                    'current': n == current
                } for i, n in enumerate(nodes)
            ]
            steps.append({
                'step': len(steps),
                'action': action,
                'nodes': nodes_state,
                'frontier': frontier.copy(),
                'description': desc
            })

        if 'BFS' in algorithm_name or 'bfs' in algorithm_name.lower():
            from collections import deque
            q = deque([start])
            visited = set([start])
            snapshot(current=start, visited=visited, frontier=list(q), action='start', desc=f'BFS 起点 {start}')
            while q:
                u = q.popleft()
                snapshot(current=u, visited=visited, frontier=list(q), action='dequeue', desc=f'弹出节点 {u}')
                for v in adj[u]:
                    if v not in visited:
                        visited.add(v)
                        q.append(v)
                        snapshot(current=v, visited=visited, frontier=list(q), action='enqueue', desc=f'访问 {u} 的邻居 {v}，入队')
            snapshot(current=None, visited=visited, frontier=[], action='complete', desc='BFS 完成')
        else:
            # 默认 DFS
            visited = set()

            def dfs(u):
                visited.add(u)
                snapshot(current=u, visited=visited, frontier=[], action='visit', desc=f'访问节点 {u}')
                for v in adj[u]:
                    if v not in visited:
                        snapshot(current=v, visited=visited, frontier=[], action='traverse', desc=f'从 {u} 前往 {v}')
                        dfs(v)

            dfs(start)
            snapshot(current=None, visited=visited, frontier=[], action='complete', desc='DFS 完成')

        # 初始数据：节点标签
        initial = nodes
        return steps, initial
