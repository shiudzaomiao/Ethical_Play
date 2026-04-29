import { useState } from 'react';
import { useBlackMirror } from '../../context/BlackMirrorContext';

const AdminPanel = () => {
  const { isAdmin, debate, analysis, fetchAnalysis, saveAnalysis } = useBlackMirror();
  const [activeTab, setActiveTab] = useState('analysis');
  const [proTitle, setProTitle] = useState('');
  const [proContent, setProContent] = useState('');
  const [conTitle, setConTitle] = useState('');
  const [conContent, setConContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSaveAnalysis = async (side) => {
    if (!debate) return;
    
    const title = side === 'pro' ? proTitle : conTitle;
    const content = side === 'pro' ? proContent : conContent;
    
    if (!title || !content) {
      setMessage('请填写标题和内容');
      return;
    }

    try {
      await saveAnalysis(debate.id, side, title, content);
      await fetchAnalysis(debate.id);
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('保存失败，请重试');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h3>⚙️ 管理员面板</h3>
      </div>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          深度拆解管理
        </button>
        <button 
          className={`tab-btn ${activeTab === 'debate' ? 'active' : ''}`}
          onClick={() => setActiveTab('debate')}
        >
          辩题管理
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {activeTab === 'analysis' && debate && (
        <div className="analysis-grid">
          <div className="analysis-card pro-card">
            <div className="card-header">
              <div className="side-badge pro">📈 正方</div>
              <h4>深度拆解</h4>
            </div>
            <input
              type="text"
              placeholder="输入正方拆解标题"
              value={proTitle}
              onChange={(e) => setProTitle(e.target.value)}
              className="analysis-input"
              defaultValue={analysis?.pro?.title}
            />
            <textarea
              placeholder="输入正方深度拆解内容..."
              value={proContent}
              onChange={(e) => setProContent(e.target.value)}
              className="analysis-textarea"
              defaultValue={analysis?.pro?.content}
            />
            <button 
              className="save-btn pro-btn"
              onClick={() => handleSaveAnalysis('pro')}
            >
              保存
            </button>
          </div>

          <div className="analysis-card con-card">
            <div className="card-header">
              <div className="side-badge con">📉 反方</div>
              <h4>深度拆解</h4>
            </div>
            <input
              type="text"
              placeholder="输入反方拆解标题"
              value={conTitle}
              onChange={(e) => setConTitle(e.target.value)}
              className="analysis-input"
              defaultValue={analysis?.con?.title}
            />
            <textarea
              placeholder="输入反方深度拆解内容..."
              value={conContent}
              onChange={(e) => setConContent(e.target.value)}
              className="analysis-textarea"
              defaultValue={analysis?.con?.content}
            />
            <button 
              className="save-btn con-btn"
              onClick={() => handleSaveAnalysis('con')}
            >
              保存
            </button>
          </div>
        </div>
      )}

      {activeTab === 'debate' && (
        <div className="debate-management">
          <p>辩题管理功能正在开发中...</p>
          <p className="hint">当前辩题: {debate?.title || '无'}</p>
        </div>
      )}

      <style>{`
        .admin-panel {
          --accent-pro: #c084fc;
          --accent-con: #ffb347;
          --text-main: #f0eefc;
          --text-dim: #b9acdf;
          --card-bg: rgba(20, 12, 38, 0.7);
          --card-border: 1px solid rgba(150, 110, 230, 0.25);
          
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          background: var(--card-bg);
          border: var(--card-border);
          border-radius: 24px;
          padding: 30px;
          backdrop-filter: blur(8px);
          box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.4);
          box-sizing: border-box;
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .admin-panel:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: #ad82f0;
          background: rgba(32, 20, 58, 0.85);
          box-shadow: 0 20px 35px -8px rgba(120, 70, 210, 0.4);
        }
        
        .panel-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: var(--card-border);
        }
        
        .panel-header h3 {
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
          letter-spacing: 2px;
          background: linear-gradient(90deg, var(--accent-pro), var(--accent-con));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .tabs {
          display: flex;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .tab-btn {
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
          border: none;
          font-size: 1rem;
          background: rgba(192, 132, 252, 0.1);
          color: var(--accent-pro);
          border: 1px solid var(--accent-pro);
        }
        
        .tab-btn:hover {
          background: var(--accent-pro);
          color: #000;
          box-shadow: 0 0 25px rgba(192, 132, 252, 0.3);
        }
        
        .tab-btn.active {
          background: var(--accent-pro);
          color: #000;
          box-shadow: 0 0 25px rgba(192, 132, 252, 0.3);
        }
        
        .message {
          padding: 15px 20px;
          margin-bottom: 20px;
          border-radius: 12px;
          font-size: 1rem;
          text-align: center;
          backdrop-filter: blur(4px);
        }
        
        .message.success {
          background: rgba(192, 132, 252, 0.1);
          border: 1px solid var(--accent-pro);
          color: var(--accent-pro);
        }
        
        .message.error {
          background: rgba(255, 68, 68, 0.1);
          border: 1px solid #ff4444;
          color: #ff4444;
        }
        
        .analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .analysis-card {
          background: rgba(28, 20, 52, 0.7);
          border: var(--card-border);
          border-radius: 20px;
          padding: 25px;
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }
        
        .analysis-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: #ad82f0;
          background: rgba(32, 20, 58, 0.85);
          box-shadow: 0 20px 35px -8px rgba(120, 70, 210, 0.4);
        }
        
        .pro-card {
          border-right: 6px solid var(--accent-pro);
        }
        
        .con-card {
          border-left: 6px solid var(--accent-con);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .side-badge {
          padding: 8px 14px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: bold;
        }
        
        .side-badge.pro {
          background: rgba(192, 132, 252, 0.1);
          color: var(--accent-pro);
          border: 1px solid var(--accent-pro);
        }
        
        .side-badge.con {
          background: rgba(255, 179, 71, 0.1);
          color: var(--accent-con);
          border: 1px solid var(--accent-con);
        }
        
        .card-header h4 {
          color: var(--text-main);
          font-size: 1.1rem;
          margin: 0;
          font-weight: 600;
        }
        
        .analysis-input {
          width: 100%;
          background: rgba(28, 20, 52, 0.7);
          border: 1px solid #6b4e9e;
          border-radius: 12px;
          padding: 15px;
          color: var(--text-main);
          margin-bottom: 15px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: 0.3s;
          font-family: inherit;
          backdrop-filter: blur(4px);
        }
        
        .analysis-input:focus {
          outline: none;
          border-color: var(--accent-pro);
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.3);
        }
        
        .analysis-input::placeholder {
          color: var(--text-dim);
        }
        
        .analysis-textarea {
          width: 100%;
          height: 150px;
          background: rgba(28, 20, 52, 0.7);
          border: 1px solid #6b4e9e;
          border-radius: 12px;
          padding: 15px;
          color: var(--text-main);
          margin-bottom: 20px;
          font-size: 1rem;
          resize: vertical;
          box-sizing: border-box;
          transition: 0.3s;
          font-family: inherit;
          backdrop-filter: blur(4px);
        }
        
        .analysis-textarea:focus {
          outline: none;
          border-color: var(--accent-pro);
          box-shadow: 0 0 15px rgba(192, 132, 252, 0.3);
        }
        
        .analysis-textarea::placeholder {
          color: var(--text-dim);
        }
        
        .save-btn {
          width: 100%;
          padding: 15px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
          border: none;
          font-size: 1rem;
        }
        
        .save-btn.pro-btn {
          background: rgba(192, 132, 252, 0.1);
          color: var(--accent-pro);
          border: 1px solid var(--accent-pro);
        }
        
        .save-btn.pro-btn:hover {
          background: var(--accent-pro);
          color: #000;
          box-shadow: 0 0 25px rgba(192, 132, 252, 0.3);
        }
        
        .save-btn.con-btn {
          background: rgba(255, 179, 71, 0.1);
          color: var(--accent-con);
          border: 1px solid var(--accent-con);
        }
        
        .save-btn.con-btn:hover {
          background: var(--accent-con);
          color: #000;
          box-shadow: 0 0 25px rgba(255, 179, 71, 0.3);
        }
        
        .debate-management {
          padding: 40px;
          background: rgba(28, 20, 52, 0.7);
          border: var(--card-border);
          border-radius: 20px;
          text-align: center;
          backdrop-filter: blur(4px);
        }
        
        .debate-management p {
          color: var(--text-dim);
          font-size: 1rem;
          margin: 0;
        }
        
        .debate-management .hint {
          color: var(--text-dim);
          font-size: 0.9rem;
          margin-top: 10px;
        }
        
        @media (max-width: 768px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
          
          .admin-panel {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;