// 导入路由核心组件
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// 导入页面组件
import Home from '../pages/Home/index';
import MainHome from '../pages/MainHome';
import SelectRole from '../pages/SelectRole/index';
import EthicalCase from '../pages/EthicalCase/index.jsx';
import MutiRound from '../pages/mutiRound/index.jsx';
import History from '../pages/History/index.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import AdminDashboard from '../pages/Admin/AdminDashboard.jsx';
import PersonalityIntro from '../pages/PersonalityIntro/index';
import Knowledge from '../pages/Knowledge/index.jsx';
import Museum from '../pages/museum/index.jsx';
import NotFound from '../pages/NotFound/index';
import BlackMirror from '../pages/BlackMirror';
import Plot from '../pages/Plot/index';
import { useAuth, AuthProvider } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// 路由守卫组件
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 管理员路由守卫
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log('[AdminRoute] user:', user, 'loading:', loading);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>正在验证权限...</div>;
  }

  if (!user || user.role !== 'admin') {
    console.warn('[AdminRoute] Access Denied:', user);
    return <Navigate to="/" replace />;
  }

  console.log('[AdminRoute] Access Granted.');
  return children;
};

// 导入Link组件
import { Link } from 'react-router-dom';

// 留空页面组件
const EmptyPage = ({ title }) => {
  // 特殊处理AI情景页面
  if (title === "AI情景") {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f0f1e',
        color: 'white',
        padding: '2rem'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#7c3aed' }}>AI情景</h1>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          <Link to="/ai-scenario/select-role" style={{
            backgroundColor: '#1a1a2e',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>选择角色</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>选择不同的职业角色</p>
          </Link>
          <Link to="/ai-scenario/ethical-case" style={{
            backgroundColor: '#1a1a2e',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>伦理案例</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>处理伦理决策案例</p>
          </Link>
          <Link to="/ai-scenario/muti-round" style={{
            backgroundColor: '#1a1a2e',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>多轮对话</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>与AI进行多轮对话</p>
          </Link>
          <Link to="/ai-scenario/personality-intro" style={{
            backgroundColor: '#1a1a2e',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>角色介绍</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>了解角色背景</p>
          </Link>
          <Link to="/ai-scenario/history" style={{
            backgroundColor: '#1a1a2e',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            textDecoration: 'none',
            color: 'white',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#7c3aed' }}>伦理足迹</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>查看历史记录</p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f1e',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <h1>{title}</h1>
      <p style={{ color: '#d1d5db', marginTop: '1rem' }}>页面正在建设中...</p>
    </div>
  );
};

// 1. 创建路由规则
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <MainHome />
      </ProtectedRoute>
    )
  },
  {
    path: '/plot',
    element: (
      <ProtectedRoute>
        <Plot />
      </ProtectedRoute>
    )
  },
  {
    path: '/ai-scenario',
    element: <EmptyPage title="AI情景" />
  },
  {
    path: '/ai-scenario/select-role',
    element: (
      <ProtectedRoute>
        <SelectRole />
      </ProtectedRoute>
    )
  },
  {
    path: '/ai-scenario/ethical-case',
    element: (
      <ProtectedRoute>
        <EthicalCase />
      </ProtectedRoute>
    )
  },
  {
    path: '/ai-scenario/muti-round',
    element: (
      <ProtectedRoute>
        <MutiRound />
      </ProtectedRoute>
    )
  },
  {
    path: '/ai-scenario/personality-intro',
    element: (
      <ProtectedRoute>
        <PersonalityIntro />
      </ProtectedRoute>
    )
  },
  {
    path: '/ai-scenario/history',
    element: (
      <ProtectedRoute>
        <History />
      </ProtectedRoute>
    )
  },
  {
    path: '/museum',
    element: <Museum />
  },
  {
    path: '/knowledge',
    element: <Knowledge />
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    )
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/black-mirror',
    element: (
      <ProtectedRoute>
        <BlackMirror />
      </ProtectedRoute>
    )
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

// 2. 封装路由组件，供全局使用
const AppRouter = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default AppRouter;
