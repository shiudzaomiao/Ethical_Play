import { useEffect, useRef } from 'react';
import './MainHome.css';

const MainHome = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const glow = glowRef.current;
    if (!glow) return;

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth * 100;
      const y = e.clientY / window.innerHeight * 100;
      glow.style.background = `radial-gradient(circle at ${x}% ${y}%,
        rgba(160, 120, 255, 0.3) 0%,
        rgba(120, 80, 200, 0.2) 30%,
        transparent 50%)`;
      // console.log('Mouse move:', x, y); // Uncomment for debugging
    };

    document.addEventListener('mousemove', handleMouseMove);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    revealElements.forEach((el) => observer.observe(el));

    window.addEventListener('load', () => {
      revealElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      });
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="main-home">
      <div className="dynamic-bg"></div>
      <div className="moving-glow" ref={glowRef}></div>
      <div className="noise"></div>

      <div className="container">
        <div className="navbar">
          <div className="logo">
            <i className="fas fa-gamepad"></i>
            <h1>Ethical-Play</h1>
          </div>
          <div className="nav-links">
            <a href="/plot">回声馆</a>
            <a href="/ai-scenario/select-role">自定义剧场</a>
            <a href="/Museum">反面博物馆</a>
            <a href="/Knowledge">知识图谱</a>
            <a href="/black-mirror">黑镜辩论</a>
          </div>
        </div>

        <div className="hero scroll-reveal">
          <div className="hero-text">
            <div className="hero-badge">
              <i className="fas fa-dice-d6"></i> 伦理情景交互 · 深度沉浸
            </div>
            <h2>
              在技术迷宫中<br /><span>塑造你的伦理人格</span>
            </h2>
            <div className="hero-desc">
              自定义推演 · 双视角故事 · 知识图谱 · 反面案例 · 社交思辨<br />
              每一次抉择，重塑工程师的责任边界。
            </div>
          </div>
          <div className="hero-illus">
            <i className="fas fa-mask"></i>
            <p>动态决策引擎</p>
            <div style={{ fontSize: '0.7rem', marginTop: '6px' }}>🎭 5轮叙事 · 人格报告</div>
          </div>
        </div>

        <div className="section-title scroll-reveal">
          <h3>⚡ 伦理交互宇宙</h3>
          <p>自定义推演 · 回声馆 · 知识图谱 · 反面博物馆 · 社交实验</p>
        </div>

        <div className="features-grid">
          <a href="/ai-scenario/select-role" className="card card-1 scroll-reveal" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-icon"><i className="fas fa-user-astronaut"></i></div>
            <h4>自定义伦理推演</h4>
            <p>
              创建工程师角色——选定职业领域，融入<strong>5轮动态叙事链</strong>。每个选择改变故事走向，最终生成<strong>伦理人格分析报告</strong>，映射你的道德偏好与价值光谱。
            </p>
            <div className="feature-tag"><i className="fas fa-dice-d6"></i> 分支叙事 · 个性结局</div>
            <div className="card-inner-box">
              <i className="fas fa-chart-line"></i> 功利主义 · 义务论 · 德性伦理 实时映射
            </div>
          </a>

          <a href="/plot" className="card card-2 scroll-reveal" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-icon"><i className="fas fa-book-open"></i></div>
            <h4>双视角 · 故事回声馆</h4>
            <p>
              固定伦理剧本，双重棱镜：<strong>工程师视角</strong>和<strong>受害者/公众视角</strong>。感受工程师的选择反转或从受害者角度审视技术傲慢。每步决策后可见"社区选择比例"，共鸣与反思并存。
            </p>
            <div className="dual-badge">
              <span className="badge-view"><i className="fas fa-hard-hat"></i> 工程师视角 · 反差震撼</span>
              <span className="badge-view"><i className="fas fa-user-injured"></i> 受害者视角 · 全新知觉</span>
            </div>
            <div className="feature-tag"><i className="fas fa-chart-simple"></i> X% 工程师与你同选 · 群体镜像</div>
          </a>

          <a href="/Knowledge" className="card card-3 scroll-reveal" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-icon"><i className="fas fa-project-diagram"></i></div>
            <h4>工程伦理知识图谱</h4>
            <p>
              伦理概念互联：知情同意、预防原则、AI公平性、自动驾驶悖论。关系型图谱连接经典案例、法规框架与思想家理论，系统性构建认知体系。
            </p>
            <div className="graph-demo">
              <span className="graph-node">功利主义</span>
              <span style={{ color: '#b48aff' }}>←→</span>
              <span className="graph-node">算法歧视</span>
              <span style={{ color: '#b48aff' }}>↗</span>
              <span className="graph-node">知情同意</span>
              <span className="graph-node">义务论</span>
              <span style={{ color: '#b48aff' }}>⟷</span>
              <span className="graph-node">自动驾驶困境</span>
            </div>
            <div className="feature-tag"><i className="fas fa-share-alt"></i> 动态关联 · 伦理可视化</div>
          </a>

          <a href="/Museum" className="card card-4 scroll-reveal" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-icon"><i className="fas fa-landmark"></i></div>
            <h4>反面博物馆 · 悲鸣警示录</h4>
            <p>
              真实工程伦理灾难档案：挑战者号、福特平托、福岛核事故、波音737 MAX……每座反面教材揭示技术傲慢的代价，警钟长鸣。
            </p>
            <ul className="disaster-list">
              <li><i className="fas fa-rocket"></i> 挑战者号 · 决策链条忽视警告</li>
              <li><i className="fas fa-car-crash"></i> 福特平托 · 成本压倒生命安全</li>
              <li><i className="fas fa-hard-hat"></i> 波士顿中央动脉 · 混凝土丑闻</li>
              <li><i className="fas fa-microchip"></i> 自动驾驶致死案 · 算法伦理漏洞</li>
            </ul>
            <div className="feature-tag"><i className="fas fa-museum"></i> 每一桩灾难都是工程师的镜鉴</div>
          </a>

          <a href="#" className="card card-5 scroll-reveal" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card-icon"><i className="fas fa-comments"></i></div>
            <h4>黑镜"社交"实验 · 思辨竞技场</h4>
            <p>
              平台管理员发起二元伦理辩题，用户自由辩论，在交锋中迸发多维度智慧。弥补单向叙事缺失的畅所欲言空间，构建社群伦理共同体。
            </p>
            <div className="debate-preview">
              <div className="topic">
                <i className="fas fa-fire" style={{ color: '#ffac6f' }}></i>
                本期热辩： 「自动驾驶应优先保护乘客还是行人？」
              </div>
              <div className="debate-stats">
                <span><i className="fas fa-arrow-up"></i> 功利主义派 64%</span>
                <span><i className="fas fa-shield-alt"></i> 义务论派 36%</span>
                <span><i className="fas fa-comment-dots"></i> 1.2k 条激辩</span>
              </div>
              <div className="debate-comment">
                <i className="fas fa-glasses"></i> 最新用户："算法逻辑必须立法公开，否则无法保障程序正义。"
              </div>
            </div>
            <div className="feature-tag"><i className="fas fa-vote-yea"></i> 二元辩证 · 自由发声 · 社群智识碰撞</div>
          </a>
        </div>

        <div className="preview-strip scroll-reveal">
          <div>
            <h4><i className="fas fa-chalkboard-user"></i> 伦理推演动态预览</h4>
            <p>自定义角色 → 五轮分支叙事 → 实时人格分析报告</p>
          </div>
          <div className="preview-badge">
            <span>🧑‍⚖️ 模拟档案: 技术理想主义 · 风险敏感 · 功利权衡</span>
          </div>
        </div>

        <div className="story-dual scroll-reveal">
          <div className="story-card engineer-card">
            <div>
              <i className="fas fa-hard-hat"></i>
              <strong>工程师视角 · 回声剧本</strong>
              <span className="story-tag">抉择反转</span>
            </div>
            <p>面对桥梁结构隐患，你选择了"加固返工"，但预算削减导致工期延误，事故却因其他因素发生……伦理讽刺的蝴蝶效应。</p>
          </div>
          <div className="story-card victim-card">
            <div>
              <i className="fas fa-eye"></i>
              <strong>受害者视角 · 无声的回响</strong>
              <span className="story-tag">沉浸共情</span>
            </div>
            <p>居民眼中的"豆腐渣"工程：当工程师的疏忽碾过日常，我才意识到伦理距离生死只差一线。迟来的道歉毫无意义。</p>
          </div>
        </div>

        <hr />
        <div className="section-footer">
          <span><i className="fas fa-leaf"></i> 负责任的技术创新 · 从伦理推演开始</span>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <p>© 2025 Ethical-Play · 工程伦理情景交互平台 | 自定义推演 · 双视角回声 · 知识图谱 · 反面博物馆 · 黑镜实验</p>
          <p style={{ marginTop: '0.3rem' }}>伦理即未来 · 动态沉浸设计</p>
        </div>
      </footer>
    </div>
  );
};

export default MainHome;
