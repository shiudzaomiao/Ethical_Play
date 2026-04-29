import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/" className="logo">Ethical Play</Link>
      </div>
      <div className="nav-center">
        <Link to="/home" className="nav-item">首页</Link>
        <Link to="/plot" className="nav-item">剧情</Link>
        <Link to="/ai-scenario/select-role" className="nav-item">AI情景</Link>
        <Link to="/museum" className="nav-item">博物馆</Link>
        <Link to="/knowledge" className="nav-item">知识维度</Link>
        <Link to="/black-mirror" className="nav-item">论辩场</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="admin-link">管理后台</Link>
            )}
            <span className="username">你好, {user.username}</span>
            <button onClick={logout} className="logout-btn">退出</button>
          </>
        ) : (
          <Link to="/login" className="login-link">登录</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
