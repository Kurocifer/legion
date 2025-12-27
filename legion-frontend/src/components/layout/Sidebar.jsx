import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  List, 
  Users, 
  BarChart3, 
  Settings,
  FolderKanban,
  Swords
} from 'lucide-react';
import useWorkspaceStore from '../../store/workspaceStore';
import useAuthStore from '../../store/authStore';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid size={20} />,
      path: '/dashboard',
    },
    {
      key: 'board',
      label: 'Board',
      icon: <FolderKanban size={20} />,
      path: '/board',
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: <List size={20} />,
      path: '/tasks',
    },
    {
      key: 'team',
      label: 'Team',
      icon: <Users size={20} />,
      path: '/team',
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
      path: '/reports',
    },

      {
    key: 'bleach',
    label: 'Bleach?',
    icon: <Swords size={20} />,
    path: '/bleach',
  },
  ];

  // Only show settings for ADMIN
  if (currentWorkspace?.role === 'ADMIN') {
    menuItems.push({
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      path: '/settings',
    });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-60 bg-gray-50 border-r border-gray-200 h-full">
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2
              transition-all duration-200
              ${isActive(item.path)
                ? 'bg-legion-gold bg-opacity-10 text-legion-navy font-semibold border-l-3 border-legion-gold'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <span className={isActive(item.path) ? 'text-legion-gold' : 'text-gray-500'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;