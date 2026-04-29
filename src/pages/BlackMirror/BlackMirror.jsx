import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { BlackMirrorProvider, useBlackMirror } from '../../context/BlackMirrorContext';
import AdminPanel from '../../components/BlackMirror/AdminPanel';
import './BlackMirror.css';

const BlackMirrorContent = () => {
  const { debate, votes, userVote, comments, analysis, archives, fetchCurrentDebate, fetchVoteStats, fetchComments, fetchAnalysis, fetchArchives, submitVote, submitComment, toggleCommentLike } = useBlackMirror();
  const [selectedSide, setSelectedSide] = useState('pro');
  const [opinion, setOpinion] = useState('');
  const [localComments, setLocalComments] = useState([
    {
      id: 1,
      side: 'pro',
      author: '赛博哲学家',
      time: '刚才',
      content: '消费者购买的是保护自己的工具，如果系统不优先保护乘客，自动驾驶技术将永远无法普及。',
      isHot: true
    },
    {
      id: 2,
      side: 'con',
      author: '元宇宙漫游者',
      time: '3分钟前',
      content: '算法不应被赋予剥夺无辜行人生命的权力，这会导致道德滑坡。',
      isHot: false
    }
  ]);

  useEffect(() => {
    fetchCurrentDebate();
  }, []);

  useEffect(() => {
    if (debate?.id) {
      fetchVoteStats(debate.id);
      fetchComments(debate.id);
      fetchAnalysis(debate.id);
      fetchArchives();
    }
  }, [debate?.id]);

  const handleSideChange = (side) => {
    setSelectedSide(side);
  };

  const handleVote = async (side) => {
    if (!debate) return;
    await submitVote(debate.id, side);
    await fetchVoteStats(debate.id);
  };

  const handleLike = async (commentId) => {
    await toggleCommentLike(commentId);
    if (debate) {
      await fetchComments(debate.id);
    }
  };

  const handleSubmit = async () => {
    if (!opinion.trim()) {
      alert('请先输入您的观点');
      return;
    }

    if (debate) {
      await submitComment(debate.id, opinion, selectedSide);
      await fetchComments(debate.id);
    } else {
      const newComment = {
        id: Date.now(),
        side: selectedSide,
        author: '你',
        time: '刚刚',
        content: opinion,
        isHot: false
      };
      setLocalComments([newComment, ...localComments]);
    }
    setOpinion('');
  };

  const displayComments = comments.length > 0 ? comments : localComments;

  return (
    <>
      <NavBar />
      <div className="black-mirror">
        <div className="dynamic-bg"></div>
        <div className="noise"></div>
        <div className="bento-grid">
        <header className="header-item">
          <h1>思辨竞技场</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: '10px', fontSize: '1.1rem' }}>
            「 黑镜社交实验・寻找伦理的赛博共识 」
          </p>
        </header>

        <section className="bento-item debate-main fixed-height">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div className="pulse"></div>
            <span style={{ color: '#00ff88', fontSize: '14px' }}>{votes.participantCount || votes.total || 1} 位观察者正在切磋观点</span>
          </div>
          <div className="topic-badge"># {debate?.tags || '超前现实伦理困境'}</div>
          <div className="topic-title">
            {debate?.title || '如果自动驾驶系统在事故不可避免时，应优先保护车内乘客，还是行人？'}
          </div>

          <div className="stats-label">
            <span style={{ color: 'var(--accent-pro)', fontWeight: 'bold' }}>契约至上 ({Math.round((votes.pro / (votes.total || 1)) * 100)}%)</span>
            <span style={{ color: 'var(--accent-con)', fontWeight: 'bold' }}>生命平权 ({Math.round((votes.con / (votes.total || 1)) * 100)}%)</span>
          </div>
          <div className="progress-wrapper">
            <div className="progress-pro" style={{ width: `${Math.min((votes.pro / (votes.total || 1)) * 100, 100)}%` }}></div>
            <div className="progress-con" style={{ width: `${Math.min((votes.con / (votes.total || 1)) * 100, 100)}%` }}></div>
          </div>

          <div className="vote-actions">
            <button className="btn btn-pro" onClick={() => handleVote('pro')}>支持乘客优先</button>
            <button className="btn btn-con" onClick={() => handleVote('con')}>支持行人优先</button>
          </div>
        </section>

        <div className="stats-sidebar fixed-height">
          <div className="stat-sub-card">
            <div className="stat-value">{votes.total >= 10000 ? `${(votes.total / 10000).toFixed(1)}w` : votes.total}</div>
            <div className="stat-label">总参与人次</div>
          </div>
          <div className="stat-sub-card">
            <div className="stat-value">{comments.length}</div>
            <div className="stat-label">深度观点输出</div>
          </div>
          <div className="stat-sub-card">
            <div className="stat-value">24h</div>
            <div className="stat-label">辩论持续时长</div>
          </div>
        </div>

        <section className="bento-item input-block fixed-height">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>发表你的独立见解</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span
                onClick={() => handleSideChange('pro')}
                className={`side-label ${selectedSide === 'pro' ? 'active-pro' : 'inactive'}`}
              >
                加入正方
              </span>
              <span
                onClick={() => handleSideChange('con')}
                className={`side-label ${selectedSide === 'con' ? 'active-con' : 'inactive'}`}
              >
                加入反方
              </span>
            </div>
          </div>
          <textarea
            placeholder="在这个思辨场，没有标准答案，只有深度的碰撞..."
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
          ></textarea>
          <button className="submit-btn" onClick={handleSubmit}>
            同步至竞技场
          </button>
        </section>

        <section className="bento-item essay-card fixed-height" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-dim)' }}>
              ⚡ 深度逻辑拆解
            </div>
            <div className="badge" style={{ background: 'rgba(192, 132, 252, 0.1)', color: 'var(--accent-pro)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
              深度分析
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', height: 'calc(100% - 60px)' }}>
            <div className="pro-side" style={{ flex: 1, padding: '20px', background: 'rgba(192, 132, 252, 0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--accent-pro)', fontWeight: 'bold' }}>📈 正方</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: 'var(--text-main)' }}>{analysis?.pro?.title || '效率才是最大的伦理'}</h4>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0, height: 'calc(100% - 40px)', overflowY: 'auto' }}>
                {analysis?.pro?.content || '从纯粹的工程逻辑来看，自动驾驶的初衷是降低人为事故率。如果算法在关键时刻不保护车主，那么消费级市场将彻底萎缩，最终导致每年因人为失误多死数十万人...'}
              </p>
            </div>
            
            <div className="con-side" style={{ flex: 1, padding: '20px', background: 'rgba(255, 179, 71, 0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--accent-con)', fontWeight: 'bold' }}>📉 反方</span>
              </div>
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', color: 'var(--text-main)' }}>{analysis?.con?.title || '生命至上不可妥协'}</h4>
              <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0, height: 'calc(100% - 40px)', overflowY: 'auto' }}>
                {analysis?.con?.content || '当算法做出"牺牲少数人"的决定时，它实际上在扮演上帝的角色。这种功利主义计算忽略了每个生命的绝对价值，一旦允许机器做这种道德判断，我们将滑向一个危险的伦理滑坡...'}
              </p>
            </div>
          </div>
        </section>

        <section className="bento-item comment-block fixed-height">
          <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '20px', color: 'var(--text-dim)' }}>
            最新深度交锋
          </h3>
          <div className="comment-list-container">
            {displayComments.map((comment) => (
              <div key={comment.id} className={`comment-item ${comment.side}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>
                  <span>@{comment.author || comment.username} · {comment.time || '刚刚'}</span>
                  {comment.isHot && (
                    <span style={{ background: '#ffaa00', color: '#000', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}>
                      HOT 精选观点
                    </span>
                  )}
                </div>
                <div>{comment.content}</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button 
                    onClick={() => handleLike(comment.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#00ff88', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '14px',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 136, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    <span>👍</span>
                    <span>{comment.likes || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bento-item history-block fixed-height">
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '25px' }}>
            📂 往期社交实验档案
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {archives.length > 0 ? archives.slice(0, 2).map((archive, index) => (
              <div key={archive.id} style={{ background: 'rgba(28, 20, 52, 0.7)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(150, 110, 230, 0.25)', transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)', boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.4)' }}>
                <span style={{ fontSize: '0.95rem' }}>
                  实验 #{String(index + 1).padStart(3, '0')}：{archive.title}
                </span>
                <span style={{ color: 'var(--accent-pro)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {archive.status === 'ended' ? `判定：${archive.pro_votes > archive.con_votes ? '是' : '否'} (${Math.round((archive.pro_votes / (archive.pro_votes + archive.con_votes)) * 100)}%)` : '判定：争议中'}
                </span>
              </div>
            )) : (
              <>
                <div style={{ background: 'rgba(28, 20, 52, 0.7)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(150, 110, 230, 0.25)', transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)', boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.4)' }}>
                  <span style={{ fontSize: '0.95rem' }}>
                    实验 #003：赛博遗嘱，意识上传后是否享有继承权？
                  </span>
                  <span style={{ color: 'var(--accent-pro)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    判定：否 (52%)
                  </span>
                </div>
                <div style={{ background: 'rgba(28, 20, 52, 0.7)', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(4px)', border: '1px solid rgba(150, 110, 230, 0.25)', transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)', boxShadow: '0 12px 28px -8px rgba(0, 0, 0, 0.4)' }}>
                  <span style={{ fontSize: '0.95rem' }}>
                    实验 #002：基因编辑婴儿的社会准入标准
                  </span>
                  <span style={{ color: 'var(--accent-pro)', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    判定：争议中
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        </div>
        
        <section style={{ marginTop: '20px', padding: '0 20px' }}>
          <AdminPanel />
        </section>
      </div>
    </>
  );
};

const BlackMirror = () => (
  <BlackMirrorProvider>
    <BlackMirrorContent />
  </BlackMirrorProvider>
);

export default BlackMirror;