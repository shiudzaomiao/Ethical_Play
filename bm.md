# 思辨竞技场 (BlackMirror) 功能实现规划

## 一、项目环境分析

### 1.1 技术栈

| 层次 | 技术 | 版本状态 |
|------|------|----------|
| 前端框架 | React 18 | ✅ 已配置 |
| 构建工具 | Vite | ✅ 已配置 |
| 路由管理 | react-router-dom | ✅ 已配置 |
| 状态管理 | React Context (Auth) | ✅ 已配置 |
| 后端框架 | Express.js | ✅ 已配置 |
| 数据库 | SQLite3 | ✅ 已配置 |
| 认证方案 | JWT + localStorage | ✅ 已配置 |

### 1.2 现有文件结构

```
src/
├── context/AuthContext.jsx    # 用户认证上下文 ✅
├── router/index.jsx           # 路由配置 ✅
├── pages/BlackMirror/         # 黑镜辩论页面 ✅
│   ├── BlackMirror.jsx
│   ├── BlackMirror.css
│   └── index.jsx
└── API/                       # API 接口目录
```

### 1.3 后端现有能力

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册 | ✅ | `/api/register` |
| 用户登录 | ✅ | `/api/login` |
| 用户验证 | ✅ | `/api/me` |
| 管理员管理 | ✅ | `/api/admin/*` |
| 数据库 | ✅ | SQLite3 已初始化 |

---

## 二、功能需求分析与实现方案

### 2.1 功能模块清单

| 模块 | 需求 | 实现复杂度 | 优先级 |
|------|------|------------|--------|
| 辩题展示 | 标题、描述、标签、起止时间、状态 | 低 | 高 |
| 投票系统 | 支持率百分比、总投票人次、用户投票状态 | 中 | 高 |
| 统计卡片 | 参与人次、观点数、辩论时长 | 低 | 中 |
| 评论区 | 列表、发表、点赞、精选标记 | 中 | 高 |
| 深度拆解 | 自定义标题/正文、讨论数、认可数 | 低 | 中 |
| 往期档案 | 已结束辩题列表及结果 | 中 | 中 |
| 用户记录 | 个人投票/评论记录 | 中 | 低 |
| 实时同步 | 投票比例变化、新评论推送 | 高 | 中 |

### 2.2 权限需求分析

#### 角色定义

| 角色 | 标识 | 说明 |
|------|------|------|
| 普通用户 | `user` | 注册登录后的普通用户 |
| 管理员 | `admin` | 系统管理员，拥有全部权限 |

#### 权限矩阵

| 功能 | 普通用户 | 管理员 | 说明 |
|------|----------|--------|------|
| 查看辩题 | ✅ | ✅ | 公开访问 |
| 投票支持观点 | ✅ | ✅ | 用户可选择支持正方或反方 |
| 发表见解(评论) | ✅ | ✅ | 发表评论支持某一方观点 |
| 评论点赞 | ✅ | ✅ | 点赞他人评论 |
| 发表深度逻辑拆解 | ❌ | ✅ | 仅管理员可创建深度分析内容 |
| 编辑深度逻辑拆解 | ❌ | ✅ | 仅管理员可编辑深度分析 |
| 删除深度逻辑拆解 | ❌ | ✅ | 仅管理员可删除深度分析 |
| 管理辩题 | ❌ | ✅ | 创建/编辑/删除辩题 |
| 精选评论标记 | ❌ | ✅ | 将优质评论标记为精选 |
| 查看用户记录 | ✅(仅自己) | ✅(全部) | 用户只能查看自己的记录 |

#### 权限流程图

```
用户请求 → 验证登录状态 → 验证角色权限 → 执行操作
    │              │              │
    │              │              └── admin → 全部权限
    │              │
    │              └── user → 仅用户权限
    │
    └── 未登录 → 重定向登录页面
```

---

## 三、数据库设计

### 3.1 新增数据表

```sql
-- 辩题表 (debates)
CREATE TABLE IF NOT EXISTS debates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,                    -- 辩题标题
  description TEXT NOT NULL,              -- 辩题描述
  tags TEXT,                              -- 标签(逗号分隔)
  start_time DATETIME NOT NULL,           -- 开始时间
  end_time DATETIME NOT NULL,             -- 结束时间
  status TEXT DEFAULT 'active',           -- 状态: active/ended
  pro_title TEXT DEFAULT '正方观点',       -- 正方标题
  con_title TEXT DEFAULT '反方观点',       -- 反方标题
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 投票记录表 (votes)
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,                      -- 关联辩题ID
  user_id INTEGER,                        -- 关联用户ID
  side TEXT NOT NULL,                     -- pro/con
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(debate_id, user_id)              -- 每个用户每个辩题只能投一次
);

-- 评论表 (comments)
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,                      -- 关联辩题ID
  user_id INTEGER,                        -- 关联用户ID
  content TEXT NOT NULL,                  -- 评论内容
  side TEXT,                              -- pro/con/null
  likes INTEGER DEFAULT 0,                -- 点赞数
  is_hot INTEGER DEFAULT 0,               -- 是否精选 (0/1)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评论点赞表 (comment_likes)
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER,                     -- 关联评论ID
  user_id INTEGER,                        -- 关联用户ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)             -- 每个用户每条评论只能点赞一次
);

-- 深度拆解表 (analysis)
CREATE TABLE IF NOT EXISTS analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,                      -- 关联辩题ID
  side TEXT NOT NULL,                     -- pro/con
  title TEXT NOT NULL,                    -- 分析标题
  content TEXT NOT NULL,                  -- 分析内容
  discussions INTEGER DEFAULT 0,          -- 讨论数
  approvals INTEGER DEFAULT 0,            -- 认可数
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 数据库关系图

```
debates (辩题)
    │
    ├── votes (投票记录)        ← 1:N 关系
    │       └── user_id → users(id)
    │
    ├── comments (评论)        ← 1:N 关系
    │       ├── user_id → users(id)
    │       └── comment_likes  ← 1:N 关系
    │
    └── analysis (深度拆解)    ← 1:N 关系
```

---

## 四、后端 API 设计

### 4.1 权限中间件设计

```javascript
// 验证普通用户登录
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: '未登录' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: '登录已过期' });
    }
    req.user = decoded;
    next();
  });
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: '权限不足，仅管理员可操作' });
  }
  next();
};
```

### 4.2 辩题相关接口

| 接口 | 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|------|
| 获取当前辩题 | GET | `/api/debates/current` | 公开 | 获取进行中的辩题 |
| 获取辩题列表 | GET | `/api/debates` | 公开 | 获取所有辩题列表 |
| 获取单个辩题 | GET | `/api/debates/:id` | 公开 | 获取单个辩题详情 |
| 创建辩题 | POST | `/api/debates` | admin | 创建新辩题 |
| 更新辩题 | PUT | `/api/debates/:id` | admin | 更新辩题信息 |
| 删除辩题 | DELETE | `/api/debates/:id` | admin | 删除辩题 |

### 4.3 投票相关接口

| 接口 | 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|------|
| 提交投票 | POST | `/api/votes` | 登录用户 | 对辩题进行投票 |
| 获取投票状态 | GET | `/api/votes/status/:debateId` | 登录用户 | 获取用户对某辩题的投票状态 |
| 获取投票统计 | GET | `/api/votes/stats/:debateId` | 公开 | 获取辩题投票统计 |

### 4.4 评论相关接口

| 接口 | 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|------|
| 获取评论列表 | GET | `/api/comments/:debateId` | 公开 | 获取辩题的评论列表 |
| 发表评论 | POST | `/api/comments` | 登录用户 | 发表新评论 |
| 点赞评论 | POST | `/api/comments/:id/like` | 登录用户 | 点赞/取消点赞评论 |
| 获取评论统计 | GET | `/api/comments/stats/:debateId` | 公开 | 获取辩题评论统计 |
| 标记精选评论 | PUT | `/api/comments/:id/hot` | admin | 将评论标记为精选 |

### 4.5 深度拆解相关接口

| 接口 | 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|------|
| 获取深度拆解 | GET | `/api/analysis/:debateId` | 公开 | 获取辩题的深度拆解 |
| 创建深度拆解 | POST | `/api/analysis` | admin | 创建深度拆解 |
| 更新深度拆解 | PUT | `/api/analysis/:id` | admin | 更新深度拆解 |
| 删除深度拆解 | DELETE | `/api/analysis/:id` | admin | 删除深度拆解 |

### 4.6 用户相关接口

| 接口 | 方法 | 路径 | 权限 | 描述 |
|------|------|------|------|------|
| 获取用户投票记录 | GET | `/api/user/votes` | 登录用户 | 获取用户的投票记录 |
| 获取用户评论记录 | GET | `/api/user/comments` | 登录用户 | 获取用户的评论记录 |

---

## 五、前端组件设计

### 5.1 页面结构

```jsx
// BlackMirror.jsx 主结构
<BlackMirror>
  <DebateHeader />           {/* 顶部辩题信息 */}
  <VoteSection />            {/* 投票区 */}
  <StatsCards />             {/* 统计卡片 */}
  <div className="main-content">
    <AnalysisPanel />        {/* 深度逻辑拆解 */}
    <CommentSection />       {/* 评论区 */}
  </div>
  <ArchiveSection />         {/* 往期档案 */}
  
  {/* 管理员专属功能 */}
  {isAdmin && <AdminPanel />}
</BlackMirror>
```

### 5.2 核心组件说明

#### DebateHeader 组件
- 显示辩题标题、描述、标签、起止时间、状态
- 计算并显示剩余时间倒计时

#### VoteSection 组件
- 显示投票按钮（支持/反对）
- 显示支持率百分比
- 显示总投票人次
- 显示用户当前投票状态（已投票/未投票）

#### StatsCards 组件
- 总参与人次（投票数）
- 深度观点数（评论数）
- 辩论已持续小时数

#### CommentSection 组件
- 评论列表（支持滚动加载）
- 评论发表表单
- 点赞功能
- 精选标记显示
- 管理员可见的"设为精选"按钮

#### AnalysisPanel 组件
- 正方/反方深度分析卡片
- 讨论数、认可数显示
- 管理员可见的编辑按钮

#### ArchiveSection 组件
- 已结束辩题列表
- 显示各辩题最终投票结果

#### AdminPanel 组件（管理员专属）
- 创建/编辑辩题入口
- 创建/编辑深度拆解入口
- 评论精选管理

### 5.3 权限控制组件

```jsx
// 权限控制高阶组件
const RequireRole = ({ role, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user) {
    return fallback || <Navigate to="/login" />;
  }
  
  if (user.role !== role) {
    return fallback || <div>权限不足</div>;
  }
  
  return children;
};

// 使用示例
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>
```

---

## 六、状态管理方案

### 6.1 新增 BlackMirrorContext

```jsx
// src/context/BlackMirrorContext.jsx
const BlackMirrorContext = createContext(null);

export const BlackMirrorProvider = ({ children }) => {
  const { user } = useAuth();
  const [debate, setDebate] = useState(null);
  const [votes, setVotes] = useState({ pro: 0, con: 0, total: 0 });
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [analysis, setAnalysis] = useState({ pro: null, con: null });
  const [archives, setArchives] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 初始化时检查用户角色
  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
  }, [user]);

  // 获取当前辩题
  const fetchCurrentDebate = async () => { /* ... */ };
  
  // 获取投票统计
  const fetchVoteStats = async (debateId) => { /* ... */ };
  
  // 获取用户投票状态
  const fetchUserVote = async (debateId) => { /* ... */ };
  
  // 提交投票
  const submitVote = async (debateId, side) => { /* ... */ };
  
  // 获取评论
  const fetchComments = async (debateId) => { /* ... */ };
  
  // 发表评论
  const submitComment = async (debateId, content, side) => { /* ... */ };
  
  // 点赞评论
  const toggleCommentLike = async (commentId) => { /* ... */ };
  
  // 标记精选评论
  const toggleHotComment = async (commentId) => { 
    // 仅管理员可调用
    if (!isAdmin) return;
    /* ... */ 
  };
  
  // 获取深度拆解
  const fetchAnalysis = async (debateId) => { /* ... */ };
  
  // 创建/更新深度拆解
  const saveAnalysis = async (debateId, side, title, content) => { 
    // 仅管理员可调用
    if (!isAdmin) return;
    /* ... */ 
  };
  
  // 获取往期档案
  const fetchArchives = async () => { /* ... */ };

  return (
    <BlackMirrorContext.Provider value={{
      debate, votes, userVote, comments, analysis, archives, isAdmin,
      fetchCurrentDebate, fetchVoteStats, fetchUserVote,
      submitVote, fetchComments, submitComment,
      toggleCommentLike, toggleHotComment,
      fetchAnalysis, saveAnalysis, fetchArchives
    }}>
      {children}
    </BlackMirrorContext.Provider>
  );
};

export const useBlackMirror = () => useContext(BlackMirrorContext);
```

---

## 七、实时性实现方案

### 7.1 方案选择

由于当前技术栈不包含 WebSocket 服务，推荐使用 **轮询方案**：

| 方案 | 实现复杂度 | 资源消耗 | 实时性 | 推荐度 |
|------|------------|----------|--------|--------|
| 定时轮询 | 低 | 中 | 中等(3-5秒) | ⭐⭐⭐⭐ |
| WebSocket | 高 | 低 | 实时 | ⭐⭐ |
| Server-Sent Events | 中 | 低 | 近实时 | ⭐⭐⭐ |

### 7.2 轮询实现策略

```jsx
// 在组件中使用 useEffect 实现轮询
useEffect(() => {
  const interval = setInterval(() => {
    // 更新投票统计
    fetchVoteStats(debateId);
    // 更新评论列表
    fetchComments(debateId);
  }, 5000); // 每5秒轮询一次

  return () => clearInterval(interval);
}, [debateId]);
```

### 7.3 性能优化

1. **缓存策略**：只在数据变化时更新 UI
2. **增量更新**：通过时间戳只获取新增评论
3. **防抖处理**：用户操作时暂停轮询

---

## 八、目录结构规划

```
src/
├── context/
│   ├── AuthContext.jsx          # 用户认证 (已存在)
│   └── BlackMirrorContext.jsx   # 黑镜辩论状态管理 (新增)
├── pages/
│   └── BlackMirror/
│       ├── BlackMirror.jsx      # 主页面 (已存在)
│       ├── BlackMirror.css      # 样式文件 (已存在)
│       └── index.jsx            # 导出组件 (已存在)
├── components/
│   └── BlackMirror/             # 黑镜组件目录 (新增)
│       ├── DebateHeader.jsx
│       ├── VoteSection.jsx
│       ├── StatsCards.jsx
│       ├── CommentSection.jsx
│       ├── AnalysisPanel.jsx
│       ├── ArchiveSection.jsx
│       └── AdminPanel.jsx       # 管理员面板
├── API/
│   └── blackMirror.js           # 黑镜相关 API 封装 (新增)
└── utils/
    └── helpers.js               # 通用工具函数 (新增)
```

---

## 九、实现步骤规划

### 阶段一：数据库与后端 API（1-2天）

1. ✅ 设计数据库表结构
2. ✅ 实现后端权限中间件
3. ✅ 实现辩题相关接口
4. ✅ 实现投票相关接口
5. ✅ 实现评论相关接口
6. ✅ 实现深度拆解相关接口（管理员权限）
7. ✅ 测试 API 接口

### 阶段二：前端组件开发（2-3天）

1. ✅ 创建 BlackMirrorContext
2. ✅ 实现 DebateHeader 组件
3. ✅ 实现 VoteSection 组件
4. ✅ 实现 StatsCards 组件
5. ✅ 实现 CommentSection 组件（含精选标记）
6. ✅ 实现 AnalysisPanel 组件（含管理员编辑）
7. ✅ 实现 ArchiveSection 组件
8. ✅ 实现 AdminPanel 组件

### 阶段三：集成与测试（1天）

1. ✅ 整合所有组件
2. ✅ 测试完整功能流程
3. ✅ 测试权限控制
4. ✅ 修复 bug

### 阶段四：实时性优化（可选，1天）

1. ✅ 实现轮询机制
2. ✅ 添加性能优化

---

## 十、代码示例

### 10.1 后端权限中间件示例

```javascript
// server/index.js - 权限中间件

// 验证登录状态
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: '未登录' });
  }
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: '登录已过期' });
    }
    req.user = decoded;
    next();
  });
};

// 验证管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: '权限不足，仅管理员可操作' });
  }
  next();
};

// 创建深度拆解接口 (仅管理员)
app.post('/api/analysis', authenticateToken, requireAdmin, (req, res) => {
  const { debateId, side, title, content } = req.body;
  
  db.run(
    "INSERT INTO analysis (debate_id, side, title, content) VALUES (?, ?, ?, ?)",
    [debateId, side, title, content],
    function(err) {
      if (err) return res.status(500).json({ msg: '创建失败' });
      res.json({ msg: '创建成功', id: this.lastID });
    }
  );
});
```

### 10.2 前端投票组件示例

```jsx
// src/components/BlackMirror/VoteSection.jsx
const VoteSection = () => {
  const { debate, votes, userVote, submitVote, isSubmitting } = useBlackMirror();
  
  if (!debate) return null;
  
  const proPercentage = votes.total > 0 
    ? ((votes.pro / votes.total) * 100).toFixed(1) 
    : 50;
  const conPercentage = votes.total > 0 
    ? ((votes.con / votes.total) * 100).toFixed(1) 
    : 50;
  
  const handleVote = async (side) => {
    if (userVote || isSubmitting) return;
    await submitVote(debate.id, side);
  };
  
  return (
    <div className="vote-section">
      <div className="vote-progress">
        <div 
          className="progress-pro" 
          style={{ width: `${proPercentage}%` }}
        />
        <div 
          className="progress-con" 
          style={{ width: `${conPercentage}%` }}
        />
      </div>
      <div className="vote-stats">
        <span>正方 {proPercentage}%</span>
        <span>反方 {conPercentage}%</span>
        <span>总投票: {votes.total}</span>
      </div>
      <div className="vote-buttons">
        <button 
          onClick={() => handleVote('pro')}
          disabled={userVote || isSubmitting}
          className={`btn btn-pro ${userVote === 'pro' ? 'voted' : ''}`}
        >
          支持正方
        </button>
        <button 
          onClick={() => handleVote('con')}
          disabled={userVote || isSubmitting}
          className={`btn btn-con ${userVote === 'con' ? 'voted' : ''}`}
        >
          支持反方
        </button>
      </div>
      {userVote && (
        <div className="vote-status">
          您已支持{userVote === 'pro' ? '正方' : '反方'}
        </div>
      )}
    </div>
  );
};
```

### 10.3 前端深度拆解组件示例（含管理员权限）

```jsx
// src/components/BlackMirror/AnalysisPanel.jsx
const AnalysisPanel = () => {
  const { analysis, isAdmin, saveAnalysis } = useBlackMirror();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  const handleEdit = (side) => {
    if (!isAdmin) return;
    const data = analysis[side];
    setEditData({ 
      side,
      title: data?.title || '', 
      content: data?.content || '' 
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveAnalysis(debateId, editData.side, editData.title, editData.content);
    setIsEditing(false);
  };

  return (
    <div className="analysis-panel">
      {/* 正方分析 */}
      <div className="analysis-card pro-side">
        <div className="analysis-header">
          <h3>⚡ 深度逻辑拆解</h3>
          {isAdmin && (
            <button onClick={() => handleEdit('pro')} className="edit-btn">
              编辑
            </button>
          )}
        </div>
        {isEditing && editData.side === 'pro' ? (
          <div className="edit-form">
            <input 
              type="text" 
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              placeholder="分析标题"
            />
            <textarea 
              value={editData.content}
              onChange={(e) => setEditData({...editData, content: e.target.value})}
              placeholder="分析内容"
            />
            <button onClick={handleSave}>保存</button>
            <button onClick={() => setIsEditing(false)}>取消</button>
          </div>
        ) : (
          <>
            <h4>{analysis.pro?.title || '暂无分析'}</h4>
            <p>{analysis.pro?.content || '等待管理员发布深度分析...'}</p>
            <div className="analysis-meta">
              <span>💬 {analysis.pro?.discussions || 0} 讨论</span>
              <span>👍 {analysis.pro?.approvals || 0} 认可</span>
            </div>
          </>
        )}
      </div>

      {/* 反方分析 */}
      <div className="analysis-card con-side">
        {/* 结构同上 */}
      </div>
    </div>
  );
};
```

---

## 十一、注意事项

### 11.1 安全性

1. **JWT 认证**：所有用户操作接口需验证 token
2. **参数验证**：后端需验证所有输入参数
3. **SQL 注入防护**：使用参数化查询
4. **权限控制**：管理员接口需验证 admin 角色
5. **输入过滤**：防止 XSS 攻击

### 11.2 性能优化

1. **数据库索引**：为常用查询字段创建索引
2. **分页加载**：评论列表支持分页
3. **缓存机制**：使用 localStorage 缓存非敏感数据
4. **图片优化**：使用合适的图片格式和尺寸

### 11.3 用户体验

1. **加载状态**：所有异步操作显示 loading 状态
2. **错误处理**：友好的错误提示
3. **响应式设计**：适配移动端和桌面端
4. **动画效果**：平滑的过渡动画
5. **权限提示**：无权限时显示友好提示而非错误页面

---

## 十二、总结

| 维度 | 当前状态 | 目标状态 |
|------|----------|----------|
| 数据库 | 仅用户表 | 完整的辩题/投票/评论/分析表 |
| API 接口 | 仅认证接口 | 完整的黑镜功能接口(含权限控制) |
| 前端组件 | 静态页面 | 动态交互式组件(含管理员功能) |
| 状态管理 | 本地状态 | 全局 Context(含权限判断) |
| 实时性 | 无 | 定时轮询方案 |

### 权限矩阵总结

| 功能 | 普通用户 | 管理员 |
|------|----------|--------|
| 查看辩题 | ✅ | ✅ |
| 投票支持观点 | ✅ | ✅ |
| 发表见解/评论 | ✅ | ✅ |
| 评论点赞 | ✅ | ✅ |
| 发表深度逻辑拆解 | ❌ | ✅ |
| 编辑/删除深度拆解 | ❌ | ✅ |
| 创建/管理辩题 | ❌ | ✅ |
| 精选评论标记 | ❌ | ✅ |
| 查看用户记录 | ✅(仅自己) | ✅(全部) |

实现此功能需要：
1. 扩展后端数据库表结构
2. 实现完整的 API 接口(含权限中间件)
3. 创建 React Context 管理状态(含权限判断)
4. 开发各功能组件(区分用户/管理员视图)
5. 实现轮询机制保证实时性