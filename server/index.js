const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fetch = require('node-fetch');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5999;
const SECRET_KEY = process.env.JWT_SECRET || 'ethical_play_secret_123';
const ARK_API_KEY = '98b6a31b-2388-43af-ba4d-d0defc21b7cb';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// 设置响应字符编码为 UTF-8
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('charset', 'utf-8');
  next();
});

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- 火山引擎 Ark API 代理 ---

// 1. 获取文本生成 (支持流式转发 + 统计记录)
app.post('/api/ark/chat', async (req, res) => {
  const { messages, stream = true, user_id } = req.body;

  // 如果提供了 user_id，记录一次场景生成
  if (user_id) {
    db.run("INSERT INTO scenarios (user_id) VALUES (?)", [user_id]);
  }
  console.log('--- Ark Chat Request ---');
  console.log('Stream:', stream);

  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'doubao-seed-2-0-mini-260215',
        messages,
        stream,
        reasoning_effort: 'minimal',
        max_reasoning_tokens: 1
      }),
      timeout: 120000 // 增加到 120 秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ark API Error:', response.status, errorText);
      return res.status(response.status).send(errorText);
    }

    if (stream) {
      console.log('Starting stream pipe...');
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      response.body.on('data', (chunk) => {
        const str = chunk.toString();
        console.log('Chunk from Ark (first 50 chars):', str.substring(0, 50));
      });

      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Ark Chat Proxy Error:', error);
    res.status(500).json({ error: 'Failed to proxy Ark Chat' });
  }
});

// 2. 图像生成代理 (支持文生图和图生图)
app.post('/api/ark/images', async (req, res) => {
  const { prompt, ref_image_url } = req.body;
  console.log('--- Ark Image Request ---');
  console.log('Prompt:', prompt);
  if (ref_image_url) console.log('Ref Image:', ref_image_url);

  try {
    const payload = {
      model: 'doubao-seedream-5-0-260128',
      prompt,
      sequential_image_generation: "disabled",
      response_format: "url",
      size: "2048x2048", // 恢复为 2048x2048 以满足 API 的最小像素要求 (2048*2048 = 4,194,304 > 3,686,400)
      watermark: false
    };

    // 如果提供了参考图 URL，则开启图生图模式
    if (ref_image_url) {
      payload.ref_image_url = ref_image_url;
    }

    const response = await axios.post('https://ark.cn-beijing.volces.com/api/v3/images/generations', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`
      }
    });

    console.log('Image generated successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Ark Image Proxy Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to proxy Ark Image', details: error.response?.data });
  }
});

// 3. 图像跨域代理 (解决 Canvas 跨域限制)
app.get('/api/ark/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('URL is required');

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    // 转发响应头
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // 管道传输图片数据
    response.body.pipe(res);
  } catch (error) {
    console.error('Image Proxy Error:', error);
    res.status(500).send('Failed to proxy image');
  }
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ msg: 'Server is running' });
});

// 初始化数据库
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database');
    db.serialize(() => {
      // 设置数据库编码为 UTF-8
      db.run("PRAGMA encoding = 'UTF-8'", (encodingErr) => {
        if (encodingErr) console.error('Error setting encoding', encodingErr);
      });
      // 1. 创建用户表 (包含 role 字段)
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
      )`, (runErr) => {
        if (runErr) console.error('Error creating table', runErr);
        else console.log('Users table ready');
      });

      // 2. 创建场景记录表 (用于真实统计)
      db.run(`CREATE TABLE IF NOT EXISTS scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (!err) console.log('Scenarios table ready');
      });

      // 3. 创建辩题表
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
      )`, (err) => {
        if (!err) console.log('Debates table ready');
      });

      // 4. 创建投票记录表
      db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debate_id INTEGER,
        user_id INTEGER,
        side TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(debate_id, user_id)
      )`, (err) => {
        if (!err) console.log('Votes table ready');
      });

      // 5. 创建评论表
      db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        debate_id INTEGER,
        user_id INTEGER,
        content TEXT NOT NULL,
        side TEXT,
        likes INTEGER DEFAULT 0,
        is_hot INTEGER DEFAULT 0,
        author TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (!err) console.log('Comments table ready');
      });

      // 6. 创建评论点赞表
      db.run(`CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(comment_id, user_id)
      )`, (err) => {
        if (!err) console.log('Comment likes table ready');
      });

      // 7. 创建深度拆解表
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
      )`, (err) => {
        if (!err) console.log('Analysis table ready');
      });

      // 8. 尝试为旧表增加 role 字段 (忽略重复列错误)
      db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
        // 3. 确保 admin 账号权限正确 (不论是否已存在)
        db.run("UPDATE users SET role = 'admin' WHERE username = 'admin'", (updErr) => {
          if (!updErr) console.log('Admin role verification complete');
        });

        // 4. 检查并创建默认 admin 账号
        db.get("SELECT * FROM users WHERE username = 'admin'", async (getErr, row) => {
          if (!row) {
            const adminPass = await bcrypt.hash('admin123', 10);
            db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", ['admin', adminPass, 'admin'], (insErr) => {
              if (insErr) console.error('Failed to create default admin:', insErr);
              else console.log('Default admin account created: admin / admin123');
            });
          }
        });

        // 5. 添加初始辩题数据
        db.get("SELECT * FROM debates WHERE title LIKE '%自动驾驶%'", (debateErr, debateRow) => {
          if (!debateRow) {
            const now = new Date();
            const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            db.run(
              "INSERT INTO debates (title, description, tags, start_time, end_time, pro_title, con_title, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                '如果自动驾驶系统在事故不可避免时，应优先保护车内乘客，还是行人？',
                '随着自动驾驶技术的发展，伦理困境日益凸显。当事故不可避免时，算法应该如何做出选择？是保护购买了产品的车主，还是无辜的路人？',
                '人工智能,伦理,自动驾驶',
                now.toISOString(),
                endTime.toISOString(),
                '契约至上',
                '生命平权',
                'active'
              ],
              function(insErr) {
                if (insErr) console.error('Failed to create default debate:', insErr);
                else {
                  console.log('Default debate created');
                  // 添加初始评论（使用匿名用户，避免user_id问题）
                  const debateId = this.lastID;
                  db.run(
                    "INSERT INTO comments (debate_id, user_id, content, side, is_hot, author) VALUES (?, ?, ?, ?, ?, ?)",
                    [debateId, 0, '消费者购买的是保护自己的工具，如果系统不优先保护乘客，自动驾驶技术将永远无法普及。', 'pro', 1, '赛博哲学家'],
                    () => console.log('Default comment 1 created')
                  );
                  db.run(
                    "INSERT INTO comments (debate_id, user_id, content, side, is_hot, author) VALUES (?, ?, ?, ?, ?, ?)",
                    [debateId, 0, '算法不应被赋予剥夺无辜行人生命的权力，这会导致道德滑坡。', 'con', 0, '元宇宙漫游者'],
                    () => console.log('Default comment 2 created')
                  );
                  // 添加初始深度拆解
                  db.run(
                    "INSERT INTO analysis (debate_id, side, title, content, discussion_count, approval_count) VALUES (?, ?, ?, ?, ?, ?)",
                    [debateId, 'pro', '效率才是最大的伦理', '从纯粹的工程逻辑来看，自动驾驶的初衷是降低人为事故率。如果算法在关键时刻不保护车主，那么消费级市场将彻底萎缩，最终导致每年因人为失误多死数十万人。契约精神是现代社会的基石，当消费者购买产品时，就与厂商建立了契约关系。产品有责任保护购买者的安全，这是商业伦理的基本要求。', 128, 1200],
                    () => console.log('Default pro analysis created')
                  );
                  db.run(
                    "INSERT INTO analysis (debate_id, side, title, content, discussion_count, approval_count) VALUES (?, ?, ?, ?, ?, ?)",
                    [debateId, 'con', '生命的量化边界', '将人的生命价值进行量化比较是危险的开端。每一个生命都是独一无二、不可替代的。算法不应该扮演上帝的角色来决定谁生谁死。无论从法律还是道德层面，行人都拥有路权优先的权利，不能因为他们没有购买产品就被牺牲。', 96, 850],
                    () => console.log('Default con analysis created')
                  );
                }
              }
            );
          }
        });

        // 6. 添加往期档案辩题
        db.get("SELECT * FROM debates WHERE title LIKE '%赛博遗嘱%'", (archiveErr, archiveRow) => {
          if (!archiveRow) {
            db.run(
              "INSERT INTO debates (title, description, tags, start_time, end_time, pro_title, con_title, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                '赛博遗嘱，意识上传后是否享有继承权？',
                '随着脑机接口和意识上传技术的发展，数字生命的法律地位成为新的争议焦点。如果一个人的意识被上传到数字世界，他是否还能继承财产？',
                '数字生命,法律,伦理',
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                '数字人格',
                '法律实体',
                'ended'
              ],
              () => console.log('Archive debate 1 created')
            );
          }
        });

        db.get("SELECT * FROM debates WHERE title LIKE '%基因编辑%'", (archiveErr, archiveRow) => {
          if (!archiveRow) {
            db.run(
              "INSERT INTO debates (title, description, tags, start_time, end_time, pro_title, con_title, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
              [
                '基因编辑婴儿的社会准入标准',
                'CRISPR技术让基因编辑成为现实，但随之而来的是深刻的伦理问题。经过基因编辑的婴儿是否应该享有与自然出生者相同的社会权利？',
                '基因编辑,生物伦理,社会',
                new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                '优化人类',
                '自然法则',
                'ended'
              ],
              () => console.log('Archive debate 2 created')
            );
          }
        });
      });
    });
  }
});

// 中间件：验证普通用户登录
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('[Server] authenticateToken: No token provided');
    return res.status(401).json({ msg: '未登录' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('[Server] authenticateToken: Token verify failed:', err.message);
      return res.status(401).json({ msg: '登录已过期' });
    }

    const userRole = decoded.username === 'admin' ? 'admin' : (decoded.role || 'user');
    req.user = { ...decoded, role: userRole };
    next();
  });
};

// 中间件：验证管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.warn(`[Server] requireAdmin: Access denied for user ${req.user.username} with role ${req.user.role}`);
    return res.status(403).json({ msg: '权限不足，仅管理员可操作' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.warn('[Server] isAdmin: No token provided');
    return res.status(401).json({ msg: '未登录' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('[Server] isAdmin: Token verify failed:', err.message);
      return res.status(401).json({ msg: '登录已过期' });
    }

    // 兼容逻辑：强制检查 admin 用户名
    const userRole = decoded.username === 'admin' ? 'admin' : (decoded.role || 'user');

    if (userRole !== 'admin') {
      console.warn(`[Server] isAdmin: Access denied for user ${decoded.username} with role ${userRole}`);
      return res.status(403).json({ msg: '权限不足，仅管理员可访问' });
    }

    req.user = { ...decoded, role: userRole };
    next();
  });
};

// --- 管理端接口 ---

// 1. 获取统计信息
app.get('/api/admin/stats', isAdmin, (req, res) => {
  console.log('[Server] Admin fetching stats...');
  const stats = {
    totalUsers: 0,
    todayScenarios: 0,
    totalScenarios: 0
  };

  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row) stats.totalUsers = row.count;

    db.get("SELECT COUNT(*) as count FROM scenarios WHERE date(created_at) = date('now')", (err, row) => {
      if (row) stats.todayScenarios = row.count;

      db.get("SELECT COUNT(*) as count FROM scenarios", (err, row) => {
        if (row) stats.totalScenarios = row.count;
        res.json(stats);
      });
    });
  });
});

// 2. 获取用户列表
app.get('/api/admin/users', isAdmin, (req, res) => {
  console.log('[Server] Admin fetching user list...');
  db.all("SELECT id, username, role FROM users", (err, rows) => {
    if (err) {
      console.error('[Server] Fetch users error:', err);
      return res.status(500).json({ msg: '获取用户列表失败' });
    }
    res.json(rows || []);
  });
});

// 3. 删除用户
app.delete('/api/admin/users/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  console.log(`[Server] Admin deleting user ID: ${id}`);
  db.get("SELECT username FROM users WHERE id = ?", [id], (err, row) => {
    if (row && row.username === 'admin') {
      return res.status(400).json({ msg: '无法删除超级管理员' });
    }
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
      if (err) return res.status(500).json({ msg: '删除失败' });
      res.json({ msg: '用户已删除' });
    });
  });
});

// 4. 更新用户信息 (例如重置密码、修改角色、修改用户名)
app.put('/api/admin/users/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  console.log(`[Server] Admin updating user ID: ${id}`);

  db.get("SELECT username FROM users WHERE id = ?", [id], async (err, row) => {
    if (!row) return res.status(404).json({ msg: '用户不存在' });
    if (row.username === 'admin' && (role === 'user' || (username && username !== 'admin'))) {
      return res.status(400).json({ msg: '不能降级或重命名超级管理员' });
    }

    let sql = "UPDATE users SET role = ?";
    let params = [role || 'user'];

    if (username) {
      sql += ", username = ?";
      params.push(username);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      sql += ", password = ?";
      params.push(hashedPassword);
    }

    sql += " WHERE id = ?";
    params.push(id);

    db.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ msg: '用户名已存在' });
        return res.status(500).json({ msg: '更新失败' });
      }
      res.json({ msg: '用户信息已更新' });
    });
  });
});

// 5. 新增用户 (管理员专用)
app.post('/api/admin/users', isAdmin, async (req, res) => {
  const { username, password, role } = req.body;
  console.log('[Server] Admin creating user:', username, 'Role:', role);

  if (!username || !password) {
    return res.status(400).json({ msg: '请输入用户名和密码' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'user'], function(err) {
      if (err) {
        console.error('[Server] Create user DB error:', err);
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ msg: '用户名已存在' });
        }
        return res.status(500).json({ msg: '数据库操作失败' });
      }
      console.log('[Server] User created successfully, ID:', this.lastID);
      res.status(201).json({ msg: '用户创建成功', id: this.lastID });
    });
  } catch (err) {
    console.error('[Server] Create user catch error:', err);
    res.status(500).json({ msg: '服务器内部错误' });
  }
});

// --- 公共接口 ---

// 注册
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: '请输入用户名和密码' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ msg: '用户名已存在' });
        }
        return res.status(500).json({ msg: '服务器内部错误' });
      }
      res.status(201).json({ msg: '注册成功' });
    });
  } catch (err) {
    res.status(500).json({ msg: '服务器内部错误' });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: '请输入用户名和密码' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.status(500).json({ msg: '服务器内部错误' });
    if (!user) return res.status(400).json({ msg: '用户不存在' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: '密码错误' });

    // 强制刷新 admin 的角色，确保即使旧数据没 role 也能登录
    const userRole = user.username === 'admin' ? 'admin' : (user.role || 'user');
    console.log(`[Server] Login successful for user: ${user.username}, Assigned Role: ${userRole}`);

    const token = jwt.sign({ id: user.id, username: user.username, role: userRole }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: userRole } });
  });
});

// 验证 token
app.get('/api/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ msg: '未登录' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ msg: '登录已过期' });

    // 从数据库重新获取最新角色信息 (通过 ID 或用户名)
    const sql = "SELECT id, role, username FROM users WHERE id = ? OR username = ?";
    db.get(sql, [decoded.id, decoded.username], (dbErr, row) => {
      if (row) {
        const finalRole = row.username === 'admin' ? 'admin' : (row.role || 'user');
        console.log(`[Server] /api/me: User ${row.username} verified with role: ${finalRole}`);
        res.json({ user: { ...decoded, id: row.id, role: finalRole } });
      } else {
        console.warn(`[Server] /api/me: User ${decoded.username} (ID: ${decoded.id}) not found in database.`);
        res.json({ user: decoded });
      }
    });
  });
});

// --- 黑镜辩论相关接口 ---

// 1. 辩题接口

// 获取当前进行中的辩题
app.get('/api/debates/current', (req, res) => {
  db.get("SELECT * FROM debates WHERE status = 'active' ORDER BY created_at DESC LIMIT 1", (err, row) => {
    if (err) return res.status(500).json({ msg: '获取辩题失败' });
    res.json(row || null);
  });
});

// 获取所有辩题列表
app.get('/api/debates', (req, res) => {
  db.all("SELECT * FROM debates ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取辩题列表失败' });
    res.json(rows || []);
  });
});

// 获取往期档案（已结束的辩题）
app.get('/api/debates/archives', (req, res) => {
  db.all("SELECT * FROM debates WHERE status = 'ended' ORDER BY end_time DESC", (err, debates) => {
    if (err) return res.status(500).json({ msg: '获取往期档案失败' });
    
    const results = debates.map(debate => {
      return new Promise((resolve) => {
        db.get("SELECT COUNT(*) as count FROM votes WHERE debate_id = ? AND side = 'pro'", [debate.id], (err, proResult) => {
          const pro_votes = proResult?.count || 0;
          db.get("SELECT COUNT(*) as count FROM votes WHERE debate_id = ? AND side = 'con'", [debate.id], (err, conResult) => {
            const con_votes = conResult?.count || 0;
            resolve({
              ...debate,
              pro_votes,
              con_votes
            });
          });
        });
      });
    });
    
    Promise.all(results).then(archives => {
      res.json(archives);
    }).catch(() => {
      res.json([]);
    });
  });
});

// 获取单个辩题
app.get('/api/debates/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM debates WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ msg: '获取辩题失败' });
    if (!row) return res.status(404).json({ msg: '辩题不存在' });
    res.json(row);
  });
});

// 创建辩题 (仅管理员)
app.post('/api/debates', authenticateToken, requireAdmin, (req, res) => {
  const { title, description, tags, start_time, end_time, pro_title, con_title } = req.body;
  if (!title || !description || !start_time || !end_time) {
    return res.status(400).json({ msg: '请填写完整信息' });
  }

  db.run(
    "INSERT INTO debates (title, description, tags, start_time, end_time, pro_title, con_title) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, description, tags, start_time, end_time, pro_title || '正方观点', con_title || '反方观点'],
    function(err) {
      if (err) return res.status(500).json({ msg: '创建辩题失败' });
      res.json({ msg: '创建成功', id: this.lastID });
    }
  );
});

// 更新辩题 (仅管理员)
app.put('/api/debates/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, tags, start_time, end_time, status, pro_title, con_title } = req.body;

  db.run(
    "UPDATE debates SET title = ?, description = ?, tags = ?, start_time = ?, end_time = ?, status = ?, pro_title = ?, con_title = ? WHERE id = ?",
    [title, description, tags, start_time, end_time, status, pro_title, con_title, id],
    function(err) {
      if (err) return res.status(500).json({ msg: '更新辩题失败' });
      res.json({ msg: '更新成功' });
    }
  );
});

// 删除辩题 (仅管理员)
app.delete('/api/debates/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM debates WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ msg: '删除辩题失败' });
    res.json({ msg: '删除成功' });
  });
});

// 2. 投票接口

// 提交投票 (登录用户)
app.post('/api/votes', (req, res) => {
  const { debate_id, side } = req.body;
  if (!debate_id || !side || !['pro', 'con'].includes(side)) {
    return res.status(400).json({ msg: '参数错误' });
  }

  const userId = req.user?.id || 0;
  db.run(
    "INSERT INTO votes (debate_id, user_id, side) VALUES (?, ?, ?)",
    [debate_id, userId, side],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ msg: '您已经投过票了' });
        }
        return res.status(500).json({ msg: '投票失败' });
      }
      res.json({ msg: '投票成功' });
    }
  );
});

// 获取用户投票状态
app.get('/api/votes/status/:debateId', authenticateToken, (req, res) => {
  const { debateId } = req.params;
  db.get("SELECT side FROM votes WHERE debate_id = ? AND user_id = ?", [debateId, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ msg: '获取投票状态失败' });
    res.json({ voted: !!row, side: row?.side || null });
  });
});

// 获取投票统计
app.get('/api/votes/stats/:debateId', (req, res) => {
  const { debateId } = req.params;
  
  db.all("SELECT side, user_id FROM votes WHERE debate_id = ?", [debateId], (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取投票统计失败' });

    const pro = rows.filter(r => r.side === 'pro').length;
    const con = rows.filter(r => r.side === 'con').length;
    const total = pro + con;
    
    // 计算参与用户数（去重）
    const uniqueUsers = new Set(rows.filter(r => r.user_id !== 0).map(r => r.user_id)).size;
    // 如果有匿名投票，至少显示1个参与用户
    const participantCount = total > 0 ? uniqueUsers || 1 : 0;

    res.json({ pro, con, total, participantCount });
  });
});

// 3. 评论接口

// 获取评论列表
app.get('/api/comments/:debateId', (req, res) => {
  const { debateId } = req.params;
  const sql = `
    SELECT c.*, COALESCE(c.author, u.username, '匿名用户') as username, 
           (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as user_liked
    FROM comments c
    LEFT JOIN users u ON c.user_id = u.id
    WHERE c.debate_id = ?
    ORDER BY c.likes DESC, c.created_at DESC
    LIMIT 50
  `;
  db.all(sql, [debateId], (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取评论失败' });
    res.json(rows || []);
  });
});

// 发表评论 (登录用户)
app.post('/api/comments', (req, res) => {
  const { debate_id, content, side } = req.body;
  if (!debate_id || !content) {
    return res.status(400).json({ msg: '请填写评论内容' });
  }

  // 获取用户ID和用户名，如果有token则解析
  let userId = 0;
  let username = '匿名用户';
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id || 0;
      username = decoded.username || '匿名用户';
    } catch (err) {
      userId = 0;
      username = '匿名用户';
    }
  }
  
  db.run(
    "INSERT INTO comments (debate_id, user_id, content, side, author) VALUES (?, ?, ?, ?, ?)",
    [debate_id, userId, content, side, username],
    function(err) {
      if (err) return res.status(500).json({ msg: '发表评论失败' });
      res.json({ msg: '发表成功', id: this.lastID });
    }
  );
});

// 点赞评论 (支持登录用户和匿名用户)
app.post('/api/comments/:id/like', (req, res) => {
  const { id } = req.params;
  
  // 获取用户ID，如果有token则解析，否则为0（匿名用户）
  let userId = 0;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      userId = decoded.id || 0;
    } catch (err) {
      // token无效或过期，继续作为匿名用户处理
      userId = 0;
    }
  }

  db.get("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?", [id, userId], (err, row) => {
    if (err) return res.status(500).json({ msg: '点赞失败' });

    if (row) {
      db.run("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?", [id, userId], function(err) {
        if (err) return res.status(500).json({ msg: '取消点赞失败' });
        db.run("UPDATE comments SET likes = likes - 1 WHERE id = ?", [id]);
        res.json({ msg: '取消点赞成功', liked: false });
      });
    } else {
      db.run("INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)", [id, userId], function(err) {
        if (err) return res.status(500).json({ msg: '点赞失败' });
        db.run("UPDATE comments SET likes = likes + 1 WHERE id = ?", [id]);
        res.json({ msg: '点赞成功', liked: true });
      });
    }
  });
});

// 标记精选评论 (仅管理员)
app.put('/api/comments/:id/hot', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { is_hot } = req.body;

  db.run("UPDATE comments SET is_hot = ? WHERE id = ?", [is_hot ? 1 : 0, id], function(err) {
    if (err) return res.status(500).json({ msg: '标记失败' });
    res.json({ msg: '标记成功' });
  });
});

// 4. 深度拆解接口

// 获取深度拆解
app.get('/api/analysis/:debateId', (req, res) => {
  const { debateId } = req.params;
  db.all("SELECT * FROM analysis WHERE debate_id = ?", [debateId], (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取深度拆解失败' });

    const result = { pro: null, con: null };
    rows.forEach(row => {
      if (row.side === 'pro') result.pro = row;
      if (row.side === 'con') result.con = row;
    });

    res.json(result);
  });
});

// 创建深度拆解 (仅管理员)
app.post('/api/analysis', authenticateToken, requireAdmin, (req, res) => {
  const { debate_id, side, title, content } = req.body;
  if (!debate_id || !side || !title || !content) {
    return res.status(400).json({ msg: '请填写完整信息' });
  }

  db.run(
    "INSERT INTO analysis (debate_id, side, title, content) VALUES (?, ?, ?, ?)",
    [debate_id, side, title, content],
    function(err) {
      if (err) return res.status(500).json({ msg: '创建深度拆解失败' });
      res.json({ msg: '创建成功', id: this.lastID });
    }
  );
});

// 更新深度拆解 (仅管理员)
app.put('/api/analysis/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  db.run(
    "UPDATE analysis SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [title, content, id],
    function(err) {
      if (err) return res.status(500).json({ msg: '更新深度拆解失败' });
      res.json({ msg: '更新成功' });
    }
  );
});

// 删除深度拆解 (仅管理员)
app.delete('/api/analysis/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM analysis WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ msg: '删除深度拆解失败' });
    res.json({ msg: '删除成功' });
  });
});

// 5. 用户相关接口

// 获取用户投票记录
app.get('/api/user/votes', authenticateToken, (req, res) => {
  const sql = `
    SELECT v.*, d.title, d.description
    FROM votes v
    LEFT JOIN debates d ON v.debate_id = d.id
    WHERE v.user_id = ?
    ORDER BY v.created_at DESC
  `;
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取投票记录失败' });
    res.json(rows || []);
  });
});

// 获取用户评论记录
app.get('/api/user/comments', authenticateToken, (req, res) => {
  const sql = `
    SELECT c.*, d.title
    FROM comments c
    LEFT JOIN debates d ON c.debate_id = d.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
  `;
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ msg: '获取评论记录失败' });
    res.json(rows || []);
  });
});

// 全局 404
app.use((req, res) => {
  console.warn(`[Server] 404 - Unmatched request: ${req.method} ${req.url}`);
  res.status(404).json({ msg: '请求的接口不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[Server] Uncaught Error:', err);
  res.status(500).json({ msg: '服务器发生异常', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
