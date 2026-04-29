# 思辨竞技场 (BlackMirror) 修改方案

## 一、修改概述

本方案基于 `bm.md` 的设计文档，对现有的 BlackMirror 页面进行全面改造，实现动态数据、用户参与和权限管理功能。

---

## 二、修改文件清单

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `server/index.js` | 新增/修改 | 添加数据库表、API接口、权限中间件 |
| `src/context/BlackMirrorContext.jsx` | 新增 | 创建黑镜辩论状态管理 |
| `src/API/blackMirror.js` | 新增 | 黑镜相关 API 封装 |
| `src/pages/BlackMirror/BlackMirror.jsx` | 修改 | 重构主页面结构 |
| `src/components/BlackMirror/*.jsx` | 新增 | 创建各功能组件 |

---

## 三、后端修改方案

### 3.1 数据库表创建

在 `server/index.js` 中添加以下 SQL 表定义：

```javascript
// 辩题表
db.run(`CREATE TABLE IF NOT EXISTS debates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status TEXT DEFAULT 'active',
  pro_title TEXT DEFAULT '正方观点',
  con_title TEXT DEFAULT '反方观点',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 投票记录表
db.run(`CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,
  user_id INTEGER,
  side TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(debate_id, user_id)
)`);

// 评论表
db.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,
  user_id INTEGER,
  content TEXT NOT NULL,
  side TEXT,
  likes INTEGER DEFAULT 0,
  is_hot INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 评论点赞表
db.run(`CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
)`);

// 深度拆解表
db.run(`CREATE TABLE IF NOT EXISTS analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debate_id INTEGER,
  side TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  discussions INTEGER DEFAULT 0,
  approvals INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
```

### 3.2 权限中间件实现

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

### 3.3 API 接口实现

#### 辩题接口
| 方法 | 路径 | 权限 | 实现说明 |
|------|------|------|----------|
| GET | `/api/debates/current` | 公开 | 获取进行中的辩题 |
| GET | `/api/debates` | 公开 | 获取所有辩题列表 |
| POST | `/api/debates` | admin | 创建新辩题 |
| PUT | `/api/debates/:id` | admin | 更新辩题 |
| DELETE | `/api/debates/:id` | admin | 删除辩题 |

#### 投票接口
| 方法 | 路径 | 权限 | 实现说明 |
|------|------|------|----------|
| POST | `/api/votes` | 登录用户 | 提交投票 |
| GET | `/api/votes/status/:debateId` | 登录用户 | 获取用户投票状态 |
| GET | `/api/votes/stats/:debateId` | 公开 | 获取投票统计 |

#### 评论接口
| 方法 | 路径 | 权限 | 实现说明 |
|------|------|------|----------|
| GET | `/api/comments/:debateId` | 公开 | 获取评论列表 |
| POST | `/api/comments` | 登录用户 | 发表评论 |
| POST | `/api/comments/:id/like` | 登录用户 | 点赞评论 |
| PUT | `/api/comments/:id/hot` | admin | 标记精选 |

#### 深度拆解接口
| 方法 | 路径 | 权限 | 实现说明 |
|------|------|------|----------|
| GET | `/api/analysis/:debateId` | 公开 | 获取深度拆解 |
| POST | `/api/analysis` | admin | 创建深度拆解 |
| PUT | `/api/analysis/:id` | admin | 更新深度拆解 |
| DELETE | `/api/analysis/:id` | admin | 删除深度拆解 |

---

## 四、前端修改方案

### 4.1 新增状态管理

创建 `src/context/BlackMirrorContext.jsx`：

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
  }, [user]);

  // API 调用方法（略）
  const fetchCurrentDebate = async () => { /* ... */ };
  const submitVote = async (debateId, side) => { /* ... */ };
  const submitComment = async (debateId, content, side) => { /* ... */ };
  const toggleCommentLike = async (commentId) => { /* ... */ };
  const saveAnalysis = async (debateId, side, title, content) => { /* ... */ };

  return (
    <BlackMirrorContext.Provider value={{
      debate, votes, userVote, comments, analysis, archives, isAdmin,
      fetchCurrentDebate, submitVote, submitComment,
      toggleCommentLike, saveAnalysis
    }}>
      {children}
    </BlackMirrorContext.Provider>
  );
};

export const useBlackMirror = () => useContext(BlackMirrorContext);
```

### 4.2 新增组件结构

创建 `src/components/BlackMirror/` 目录及以下组件：

| 组件文件 | 功能说明 |
|----------|----------|
| `DebateHeader.jsx` | 辩题标题、描述、标签、时间显示 |
| `VoteSection.jsx` | 投票按钮、支持率、投票状态 |
| `StatsCards.jsx` | 参与人次、观点数、辩论时长 |
| `CommentSection.jsx` | 评论列表、发表、点赞、精选标记 |
| `AnalysisPanel.jsx` | 深度拆解展示、管理员编辑功能 |
| `ArchiveSection.jsx` | 往期辩题档案列表 |
| `AdminPanel.jsx` | 管理员专属功能入口 |

### 4.3 主页面重构

修改 `src/pages/BlackMirror/BlackMirror.jsx`：

```jsx
import { useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { BlackMirrorProvider, useBlackMirror } from '../../context/BlackMirrorContext';
import DebateHeader from '../../components/BlackMirror/DebateHeader';
import VoteSection from '../../components/BlackMirror/VoteSection';
import StatsCards from '../../components/BlackMirror/StatsCards';
import CommentSection from '../../components/BlackMirror/CommentSection';
import AnalysisPanel from '../../components/BlackMirror/AnalysisPanel';
import ArchiveSection from '../../components/BlackMirror/ArchiveSection';
import AdminPanel from '../../components/BlackMirror/AdminPanel';
import './BlackMirror.css';

const BlackMirrorContent = () => {
  const { fetchCurrentDebate, fetchVoteStats, fetchComments, fetchAnalysis, fetchArchives, debate } = useBlackMirror();

  useEffect(() => {
    fetchCurrentDebate();
    fetchArchives();
  }, []);

  useEffect(() => {
    if (debate?.id) {
      fetchVoteStats(debate.id);
      fetchComments(debate.id);
      fetchAnalysis(debate.id);
    }
  }, [debate]);

  return (
    <div className="black-mirror">
      <NavBar />
      <div className="dynamic-bg"></div>
      <div className="noise"></div>
      <div className="bento-grid">
        <DebateHeader />
        <VoteSection />
        <StatsCards />
        <AnalysisPanel />
        <CommentSection />
        <ArchiveSection />
        <AdminPanel />
      </div>
    </div>
  );
};

const BlackMirror = () => (
  <BlackMirrorProvider>
    <BlackMirrorContent />
  </BlackMirrorProvider>
);

export default BlackMirror;
```

---

## 五、权限控制实现

### 5.1 权限矩阵

| 功能 | 普通用户 | 管理员 |
|------|----------|--------|
| 查看辩题 | ✅ | ✅ |
| 投票支持观点 | ✅ | ✅ |
| 发表评论 | ✅ | ✅ |
| 评论点赞 | ✅ | ✅ |
| 发表深度拆解 | ❌ | ✅ |
| 编辑深度拆解 | ❌ | ✅ |
| 创建辩题 | ❌ | ✅ |
| 标记精选评论 | ❌ | ✅ |

### 5.2 前端权限组件

```jsx
// 权限控制高阶组件
const RequireRole = ({ role, children, fallback = null }) => {
  const { user } = useAuth();
  
  if (!user) {
    return fallback || <Navigate to="/login" />;
  }
  
  if (user.role !== role) {
    return fallback || null;
  }
  
  return children;
};

// 使用示例
<RequireRole role="admin">
  <AdminPanel />
</RequireRole>
```

---

## 六、实时性实现

### 6.1 轮询方案

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    if (debate?.id) {
      fetchVoteStats(debate.id);
      fetchComments(debate.id);
    }
  }, 5000);

  return () => clearInterval(interval);
}, [debate?.id]);
```

### 6.2 性能优化策略

1. **缓存策略**：只在数据变化时更新 UI
2. **增量更新**：通过时间戳只获取新增评论
3. **防抖处理**：用户操作时暂停轮询

---

## 七、实现步骤

### 阶段一：后端开发（1天）
1. 创建数据库表
2. 实现权限中间件
3. 实现所有 API 接口
4. 测试接口

### 阶段二：前端开发（2天）
1. 创建 BlackMirrorContext
2. 实现各功能组件
3. 重构主页面
4. 集成权限控制

### 阶段三：测试与优化（1天）
1. 功能测试
2. 权限验证测试
3. 性能优化
4. Bug 修复

---

## 八、注意事项

### 安全性
- JWT 认证验证
- 参数验证与 SQL 注入防护
- XSS 攻击防护

### 用户体验
- 加载状态显示
- 友好的错误提示
- 响应式设计适配

### 性能
- 数据库索引优化
- 评论分页加载
- localStorage 缓存

---

## 九、总结

本修改方案将静态的 BlackMirror 页面改造为完整的动态辩论系统，实现：
- ✅ 动态辩题展示与投票
- ✅ 用户评论与互动
- ✅ 管理员权限管理
- ✅ 深度逻辑拆解功能
- ✅ 实时数据同步
- ✅ 往期档案记录