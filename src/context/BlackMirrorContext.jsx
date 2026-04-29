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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAdmin(user?.role === 'admin');
  }, [user]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const fetchCurrentDebate = async () => {
    try {
      const res = await fetch('http://localhost:5999/api/debates/current');
      const data = await res.json();
      setDebate(data);
      return data;
    } catch (err) {
      console.error('获取当前辩题失败:', err);
      return null;
    }
  };

  const fetchVoteStats = async (debateId) => {
    try {
      const res = await fetch(`http://localhost:5999/api/votes/stats/${debateId}`);
      const data = await res.json();
      setVotes(data);
      return data;
    } catch (err) {
      console.error('获取投票统计失败:', err);
      return { pro: 0, con: 0, total: 0 };
    }
  };

  const fetchUserVote = async (debateId) => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:5999/api/votes/status/${debateId}`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      setUserVote(data.voted ? data.side : null);
      return data;
    } catch (err) {
      console.error('获取用户投票状态失败:', err);
      return null;
    }
  };

  const submitVote = async (debateId, side) => {
    if (!user) {
      alert('请先登录');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5999/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ debate_id: debateId, side })
      });
      const data = await res.json();
      if (res.ok) {
        setUserVote(side);
        await fetchVoteStats(debateId);
      } else {
        alert(data.msg || '投票失败');
      }
      return data;
    } catch (err) {
      console.error('投票失败:', err);
      alert('投票失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (debateId) => {
    try {
      const res = await fetch(`http://localhost:5999/api/comments/${debateId}`);
      const data = await res.json();
      setComments(data);
      return data;
    } catch (err) {
      console.error('获取评论失败:', err);
      return [];
    }
  };

  const submitComment = async (debateId, content, side) => {
    if (!user) {
      alert('请先登录');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5999/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          ...getAuthHeader()
        },
        body: JSON.stringify({ debate_id: debateId, content, side })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchComments(debateId);
      } else {
        alert(data.msg || '发表评论失败');
      }
      return data;
    } catch (err) {
      console.error('发表评论失败:', err);
      alert('发表评论失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleCommentLike = async (commentId) => {
    try {
      const res = await fetch(`http://localhost:5999/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && debate) {
        await fetchComments(debate.id);
      }
      return data;
    } catch (err) {
      console.error('点赞失败:', err);
      alert('点赞失败，请重试');
      return null;
    }
  };

  const toggleHotComment = async (commentId, isHot) => {
    if (!isAdmin) {
      alert('权限不足');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5999/api/comments/${commentId}/hot`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ is_hot: isHot })
      });
      const data = await res.json();
      if (res.ok && debate) {
        await fetchComments(debate.id);
      }
      return data;
    } catch (err) {
      console.error('标记精选失败:', err);
      alert('标记精选失败，请重试');
      return null;
    }
  };

  const fetchAnalysis = async (debateId) => {
    try {
      const res = await fetch(`http://localhost:5999/api/analysis/${debateId}`);
      const data = await res.json();
      setAnalysis(data);
      return data;
    } catch (err) {
      console.error('获取深度拆解失败:', err);
      return { pro: null, con: null };
    }
  };

  const saveAnalysis = async (debateId, side, title, content) => {
    if (!isAdmin) {
      alert('权限不足');
      return;
    }
    setLoading(true);
    try {
      // 先检查是否已有该辩题该立场的分析
      const existingAnalysis = side === 'pro' ? analysis.pro : analysis.con;
      
      let res;
      if (existingAnalysis) {
        // 更新现有分析
        res = await fetch(`http://localhost:5999/api/analysis/${existingAnalysis.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ title, content })
        });
      } else {
        // 创建新分析
        res = await fetch('http://localhost:5999/api/analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader()
          },
          body: JSON.stringify({ debate_id: debateId, side, title, content })
        });
      }
      
      const data = await res.json();
      if (res.ok) {
        await fetchAnalysis(debateId);
      } else {
        alert(data.msg || '保存深度拆解失败');
      }
      return data;
    } catch (err) {
      console.error('保存深度拆解失败:', err);
      alert('保存深度拆解失败，请重试');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchArchives = async () => {
    try {
      const res = await fetch('http://localhost:5999/api/debates');
      const data = await res.json();
      setArchives(data.filter(d => d.status === 'ended'));
      return data;
    } catch (err) {
      console.error('获取往期档案失败:', err);
      return [];
    }
  };

  return (
    <BlackMirrorContext.Provider value={{
      debate,
      votes,
      userVote,
      comments,
      analysis,
      archives,
      isAdmin,
      loading,
      fetchCurrentDebate,
      fetchVoteStats,
      fetchUserVote,
      submitVote,
      fetchComments,
      submitComment,
      toggleCommentLike,
      toggleHotComment,
      fetchAnalysis,
      saveAnalysis,
      fetchArchives
    }}>
      {children}
    </BlackMirrorContext.Provider>
  );
};

export const useBlackMirror = () => useContext(BlackMirrorContext);