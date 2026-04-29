import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
// @ts-ignore
import { generateRoleImage as generateImage } from '../../api/ai/ImageGenerator';
// @ts-ignore
import { useAuth } from '../../context/AuthContext';
import './SelectRole.css';

// 预设角色 + 你自己的本地/网络图片
const presetRoles = [
  {
    id: 1,
    name: '土木工程师',
    outerColor: '#e0e0f8',
    innerColor: '#b4b8d8',
    image: '/images/civil_engineer.png'
  },
  {
    id: 2,
    name: '医生',
    outerColor: '#e8e8e8',
    innerColor: '#c0c0c0',
    image: '/images/doctor.png'
  },
  {
    id: 3,
    name: '律师',
    outerColor: '#c8e8e0',
    innerColor: '#a8c8c0',
    image: '/images/lawyer.png'
  },
  {
    id: 4,
    name: '软件工程师',
    outerColor: '#f0e8d8',
    innerColor: '#d0c8b8',
    image: '/images/software_engineer.png'
  },
];

const SelectRole: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comicStyle, setComicStyle] = useState<string>('cyberpunk'); // 默认赛博朋克风格

  const styles = [
    { id: 'cyberpunk', name: '赛博朋克', prompt: '赛博朋克风格，极致光影，电影大片质感' },
    { id: 'anime', name: '日漫风', prompt: '日漫风格，细腻线条，鲜艳色彩' },
    { id: 'american', name: '美漫风', prompt: '美漫风格，粗犷线条，强烈对比' },
    { id: 'ink', name: '水墨风', prompt: '中国水墨画风格，留白，意境' }
  ];

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const classicTitleRef = useRef<HTMLDivElement>(null);
  const freeInputTitleRef = useRef<HTMLDivElement>(null);
  const createRoleBtnRef = useRef<HTMLButtonElement>(null);
  const navigationButtonsRef = useRef<HTMLDivElement>(null);

  // 入场动画
  useEffect(() => {
    if (containerRef.current) {
      const timeline = gsap.timeline({ delay: 0.5 });

      gsap.set([
        '.app-title',
        classicTitleRef.current,
        freeInputTitleRef.current,
        ...cardsRef.current,
        inputRef.current,
        createRoleBtnRef.current,
        imageRef.current
      ], { opacity: 0 });

      timeline.to('.app-title', {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
      });

      if (classicTitleRef.current) {
        timeline.to(classicTitleRef.current, {
          opacity: 1, x: 0, duration: 0.6, ease: 'power2.out'
        }, "-=0.3");
      }

      cardsRef.current.forEach((card, index) => {
        if (card) {
          timeline.to(card, {
            opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: index * 0.1
          }, "-=0.2");
        }
      });

      if (freeInputTitleRef.current) {
        timeline.to(freeInputTitleRef.current, {
          opacity: 1, x: 0, duration: 0.6, ease: 'power2.out'
        }, "-=0.3");
      }

      if (inputRef.current) {
        timeline.to(inputRef.current, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
        }, "-=0.4");
      }

      if (createRoleBtnRef.current) {
        timeline.to(createRoleBtnRef.current, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
        }, "-=0.5");
      }

      if (imageRef.current) {
        timeline.to(imageRef.current, {
          opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out'
        }, "-=0.6");
      }

      if (navigationButtonsRef.current) {
        timeline.to(navigationButtonsRef.current, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
        });
      }
    }
  }, []);

  // 悬浮弹动动画
  useEffect(() => {
    cardsRef.current.forEach((card) => {
      if (!card) return;
      card.addEventListener('mouseenter', () => {
        gsap.to(card, { scale: 1.12, y: -10, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }, []);

  // ✅ 点击预设角色 → 显示你自己的图片
  const handleRoleSelect = (role: (typeof presetRoles)[0]) => {
    setSelectedRole(role.name);
    setImageUrl(role.image); // 直接显示你预设的图
    setIsLoading(false);

    // 保存预设角色的基础特征描述和图片作为参考图
    const stylePrompt = styles.find(s => s.id === comicStyle)?.prompt || '';
    localStorage.setItem('character_prompt', `一个专业的${role.name}角色形象`);
    localStorage.setItem('comic_style_prompt', stylePrompt);
    localStorage.setItem('ref_image_url', role.image); // 预设图片也作为参考图
  };

  // ✅ 自由创建角色 → 走AI生成
  const handleCreateRole = () => {
    if (customRole.trim()) {
      setSelectedRole(customRole.trim());
      generateRoleImage(customRole.trim());
    }
  };

  // AI生成图片（仅自由创建使用）
  const generateRoleImage = async (role: string) => {
    setIsLoading(true);
    try {
      const stylePrompt = styles.find(s => s.id === comicStyle)?.prompt || '';
      // 这里的 Prompt 仅负责生成纯粹的人物形象，不涉及伦理
      const fullPrompt = `${stylePrompt}。一个专业的${role}角色形象插图，正面特写，高质量细节`;
      const generatedUrl = await generateImage(role, fullPrompt);
      setImageUrl(generatedUrl);

      // 保存自定义角色的基础特征描述和生成的图片 URL
      localStorage.setItem('character_prompt', role);
      localStorage.setItem('comic_style_prompt', stylePrompt);

      // 重要：如果是生成的图片，需要存储原始 URL 以供后续图生图使用
      // generateImage 返回的是代理后的 URL，我们需要提取原始 URL
      const rawUrl = decodeURIComponent(generatedUrl.split('url=')[1]);
      localStorage.setItem('ref_image_url', rawUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      setImageUrl('https://via.placeholder.com/300x500?text=AI+角色');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="select-role-container" ref={containerRef}>
      <h1 className="app-title">Ethical Play</h1>

      <div className="top-right-actions">
        <button onClick={() => navigate('/home')} className="home-btn" style={{ background: 'rgba(167, 139, 250, 0.1)', borderColor: '#a78bfa' }}>回到首页</button>
        {user && <span className="user-info">你好, {user.username}</span>}
        {user?.role === 'admin' && (
          <button onClick={() => navigate('/admin')} className="admin-btn" style={{ background: 'rgba(124, 58, 237, 0.2)', borderColor: '#7c3aed' }}>
            管理后台
          </button>
        )}
        <button onClick={() => navigate('/ai-scenario/history')} className="history-btn">历史足迹</button>
        <button onClick={() => navigate('/ai-scenario/personality-intro')} className="personality-btn" style={{ background: 'rgba(167, 139, 250, 0.1)', borderColor: '#a78bfa' }}>人格图鉴</button>
        <button onClick={logout} className="logout-btn">退出登录</button>
      </div>

      <div className="role-selection">
        <div className="left-section">
          <div className="classic-title" ref={classicTitleRef}>Classic choice</div>

          <div className="preset-roles">
            {presetRoles.map((role, index) => (
              <div
                key={role.id}
                ref={el => el && (cardsRef.current[index] = el)}
                className={`role-card ${selectedRole === role.name ? 'selected' : ''}`}
                style={{ '--outer-color': role.outerColor, '--inner-color': role.innerColor } as React.CSSProperties}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-card-inner">
                  <div className="role-name">{role.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="free-input-section">
            <div className="free-input-title" ref={freeInputTitleRef}>Free Input</div>

            {/* 新增漫画风格选择 */}
            <div className="style-selection">
              <span className="style-label">选择漫画风格：</span>
              <div className="style-options">
                {styles.map(style => (
                  <button
                    key={style.id}
                    className={`style-btn ${comicStyle === style.id ? 'active' : ''}`}
                    onClick={() => setComicStyle(style.id)}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={inputRef}
              className="input-area"
              placeholder="在此可以自由描述你的角色身份～"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
            />
            <button
              ref={createRoleBtnRef}
              className="create-role-btn"
              onClick={handleCreateRole}
              disabled={!customRole.trim()}
            >
              create role
            </button>
          </div>
        </div>

        {/* 右侧图片区域 */}
        <div className="right-section">
          <div className="image-container" ref={imageRef}>
            {isLoading ? (
              <div className="loading">生成中...</div>
            ) : imageUrl ? (
              <img src={imageUrl} alt={selectedRole || ''} className="role-image" />
            ) : (
              <div className="image-placeholder">创建角色后将显示专属于你的人物形象呀~</div>
            )}
          </div>
        </div>
      </div>

      {selectedRole && (
        <div className="navigation-buttons" ref={navigationButtonsRef}>
          <button
            className="nav-btn ai-btn"
            onClick={() => navigate(`/ai-scenario/muti-round?profession=${encodeURIComponent(selectedRole)}`)}
          >
            进入多轮分支故事
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectRole;
