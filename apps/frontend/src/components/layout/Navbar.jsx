import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import WorkspaceSwitcher from '../workspace/WorkspaceSwitcher';
import useAuthStore from '../../store/authStore';
import useWorkspaceStore from '../../store/workspaceStore';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const clearWorkspace = useWorkspaceStore((state) => state.clearWorkspace);

  const handleLogout = () => {
    logout();
    clearWorkspace();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-legion-navy flex items-center justify-between px-6 shadow-lg">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src="/legion-logo.png" alt="Legion" className="w-10 h-10" />
          <span className="text-2xl font-bold text-legion-gold">LEGION</span>
        </div>

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-10 border border-transparent rounded-lg text-white placeholder-gray-400 focus:bg-opacity-20 focus:border-legion-gold focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
          <Bell size={20} className="text-white" />
        </button>

        {/* User Menu */}
        <Dropdown
          trigger={
            <button className="flex items-center gap-2 px-3 py-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all">
              <div className="w-8 h-8 bg-legion-gold rounded-full flex items-center justify-center">
                <User size={16} className="text-legion-navy" />
              </div>
              <span className="text-white font-medium hidden md:block">
                {user?.fullName || 'User'}
              </span>
            </button>
          }
        >
          <DropdownItem
            icon={<User size={16} />}
            label="Profile"
            onClick={() => navigate('/profile')}
          />
          <DropdownItem
            icon={<Settings size={16} />}
            label="Settings"
            onClick={() => navigate('/settings')}
          />
          <DropdownDivider />
          <DropdownItem
            icon={<LogOut size={16} />}
            label="Logout"
            onClick={handleLogout}
            danger
          />
        </Dropdown>
      </div>
    </nav>
  );
};

export default Navbar;