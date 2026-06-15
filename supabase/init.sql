-- 创建数据库
CREATE DATABASE algorithm_animation;

-- 使用新创建的数据库
\c algorithm_animation;

-- 创建用户表
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled'))
);

-- 创建算法表
CREATE TABLE algorithms (
    algorithm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sorting', 'searching', 'tree')),
    description TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    pseudocode JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建动画数据表
CREATE TABLE animation_data (
    animation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_id UUID REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    animation_steps JSONB NOT NULL,
    initial_data JSONB NOT NULL,
    visualization_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分类表
CREATE TABLE categories (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 创建学习资料表
CREATE TABLE learning_materials (
    material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(category_id) ON DELETE CASCADE,
    algorithm_id UUID REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    code_example JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建学习记录表
CREATE TABLE learning_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    algorithm_id UUID REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_seconds INTEGER DEFAULT 0,
    progress_status VARCHAR(20) DEFAULT 'in_progress' CHECK (progress_status IN ('not_started', 'in_progress', 'completed')),
    UNIQUE(user_id, algorithm_id)
);

-- 创建收藏算法表
CREATE TABLE favorite_algorithms (
    favorite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    algorithm_id UUID REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, algorithm_id)
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_type ON users(role_type);
CREATE INDEX idx_algorithms_type ON algorithms(type);
CREATE INDEX idx_algorithms_name ON algorithms(name);
CREATE INDEX idx_animation_data_algorithm_id ON animation_data(algorithm_id);
CREATE INDEX idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX idx_learning_records_algorithm_id ON learning_records(algorithm_id);
CREATE INDEX idx_learning_records_learned_at ON learning_records(learned_at DESC);
CREATE INDEX idx_favorite_algorithms_user_id ON favorite_algorithms(user_id);
CREATE INDEX idx_favorite_algorithms_algorithm_id ON favorite_algorithms(algorithm_id);
CREATE INDEX idx_learning_materials_category_id ON learning_materials(category_id);
CREATE INDEX idx_learning_materials_algorithm_id ON learning_materials(algorithm_id);

-- 插入默认管理员账号 (密码: admin123)
INSERT INTO users (username, email, password_hash, role_type) VALUES
('admin', 'admin@example.com', '$2b$12$AE0tV5qLUlKMpdWiiXWXt.Tdi4Thcjr2egrBNl4JYF/HDnPk3ju6m', 'admin');

-- 插入示例分类数据
INSERT INTO categories (name, description, sort_order) VALUES
('算法简介', '算法的基本概念、特点和应用场景', 1),
('伪代码', '算法的伪代码表示和实现思路', 2),
('时间复杂度', '算法的时间复杂度分析和计算方法', 3),
('常见问题', '算法学习过程中的常见问题和解答', 4);

-- 插入示例算法数据
INSERT INTO algorithms (name, type, description, time_complexity, space_complexity, pseudocode) VALUES
('冒泡排序', 'sorting', '通过重复遍历要排序的数列，比较相邻元素并交换位置', 'O(n²)', 'O(1)', '[
  "for i from 0 to n-1",
  "  for j from 0 to n-i-1", 
  "    if arr[j] > arr[j+1]",
  "      swap(arr[j], arr[j+1])"
]'),
('快速排序', 'sorting', '采用分治法，选择一个基准元素将数组分为两部分', 'O(n log n)', 'O(log n)', '[
  "quickSort(arr, low, high)",
  "  if low < high",
  "    pi = partition(arr, low, high)",
  "    quickSort(arr, low, pi-1)",
  "    quickSort(arr, pi+1, high)"
]'),
('归并排序', 'sorting', '采用分治法，将数组分成两半分别排序后合并', 'O(n log n)', 'O(n)', '[
  "mergeSort(arr, left, right)",
  "  if left < right",
  "    mid = (left + right) / 2",
  "    mergeSort(arr, left, mid)",
  "    mergeSort(arr, mid+1, right)",
  "    merge(arr, left, mid, right)"
]'),
('二分查找', 'searching', '在有序数组中查找特定元素的搜索算法', 'O(log n)', 'O(1)', '[
  "binarySearch(arr, target)",
  "  low = 0, high = n-1",
  "  while low <= high",
  "    mid = (low + high) / 2",
  "    if arr[mid] == target",
  "      return mid",
  "    else if arr[mid] < target",
  "      low = mid + 1",
  "    else",
  "      high = mid - 1"
]'),
('线性查找', 'searching', '逐个检查数组中的每个元素直到找到目标', 'O(n)', 'O(1)', '[
  "linearSearch(arr, target)",
  "  for i from 0 to n-1",
  "    if arr[i] == target",
  "      return i",
  "  return -1"
]'),
('前序遍历', 'tree', '先访问根节点，然后遍历左子树，最后遍历右子树', 'O(n)', 'O(h)', '[
  "preorder(node)",
  "  if node != null",
  "    visit(node)",
  "    preorder(node.left)",
  "    preorder(node.right)"
]'),
('中序遍历', 'tree', '先遍历左子树，然后访问根节点，最后遍历右子树', 'O(n)', 'O(h)', '[
  "inorder(node)",
  "  if node != null",
  "    inorder(node.left)",
  "    visit(node)",
  "    inorder(node.right)"
]'),
('后序遍历', 'tree', '先遍历左子树，然后遍历右子树，最后访问根节点', 'O(n)', 'O(h)', '[
  "postorder(node)",
  "  if node != null",
  "    postorder(node.left)",
  "    postorder(node.right)",
  "    visit(node)"
]');

-- 插入示例学习资料
INSERT INTO learning_materials (category_id, algorithm_id, title, content, code_example) VALUES
(
  (SELECT category_id FROM categories WHERE name = '算法简介'),
  (SELECT algorithm_id FROM algorithms WHERE name = '冒泡排序'),
  '冒泡排序算法简介',
  '<p><strong>冒泡排序</strong>是一种简单的排序算法，它重复地遍历要排序的数列，一次比较两个元素，如果它们的顺序错误就把它们交换过来。</p>
  <p>这个算法的名字由来是因为越小的元素会经由交换慢慢"浮"到数列的顶端，就像水中的气泡一样。</p>
  <h3>算法特点：</h3>
  <ul>
    <li>时间复杂度：O(n²)</li>
    <li>空间复杂度：O(1)</li>
    <li>稳定性：稳定</li>
    <li>原地排序：是</li>
  </ul>',
  {
    "python": "def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr",
    "javascript": "function bubbleSort(arr) {\n    let n = arr.length;\n    for (let i = 0; i < n; i++) {\n        for (let j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n            }\n        }\n    }\n    return arr;\n}"
  }
),
(
  (SELECT category_id FROM categories WHERE name = '时间复杂度'),
  (SELECT algorithm_id FROM algorithms WHERE name = '快速排序'),
  '快速排序时间复杂度分析',
  '<p><strong>快速排序</strong>的平均时间复杂度为O(n log n)，但在最坏情况下会退化到O(n²)。</p>
  <h3>时间复杂度分析：</h3>
  <ul>
    <li><strong>最佳情况：</strong> O(n log n) - 当分区平衡时</li>
    <li><strong>平均情况：</strong> O(n log n) - 随机输入数据</li>
    <li><strong>最坏情况：</strong> O(n²) - 当分区极度不平衡时</li>
  </ul>
  <p>快速排序的性能主要取决于分区操作的质量。一个好的分区应该能够将数组大致分成两半。</p>',
  {
    "analysis": "快速排序的时间复杂度分析需要考虑分区操作的递归性质。\n\n最佳情况：每次分区都能将数组分成大致相等的两部分，递归深度为log n，每层需要O(n)时间处理所有元素。\n\n最坏情况：每次分区都选择到最小或最大的元素作为基准，导致一个子数组为空，另一个包含n-1个元素，递归深度为n。\n\n平均情况：假设分区操作是随机的，平均性能接近最佳情况。"
  }
),
(
  (SELECT category_id FROM categories WHERE name = '常见问题'),
  (SELECT algorithm_id FROM algorithms WHERE name = '二分查找'),
  '二分查找常见问题',
  '<h3>Q: 二分查找只能在有序数组上使用吗？</h3>
  <p><strong>A:</strong> 是的，二分查找要求数组必须是有序的。如果数组无序，需要先进行排序。</p>
  
  <h3>Q: 二分查找的时间复杂度是多少？</h3>
  <p><strong>A:</strong> 二分查找的时间复杂度是O(log n)，因为每次比较都能将搜索范围减半。</p>
  
  <h3>Q: 二分查找可以处理重复元素吗？</h3>
  <p><strong>A:</strong> 可以，但可能需要特殊处理来找到第一个或最后一个匹配的元素。</p>',
  {
    "tips": [
      "确保数组是有序的",
      "注意边界条件处理",
      "考虑重复元素的情况",
      "可以使用迭代或递归实现"
    ]
  }
);