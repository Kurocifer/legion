import { useState } from 'react';
import { User, Mail, Shield, Calendar, Briefcase, Swords, Zap, Flame, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useWorkspaceStore from '../store/workspaceStore';

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [bankaiActivated, setBankaiActivated] = useState(false);

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { label: 'Admin', class: 'bg-legion-gold text-legion-navy', icon: Shield },
      MANAGER: { label: 'Manager', class: 'bg-blue-500 text-white', icon: Briefcase },
      DEVELOPER: { label: 'Developer', class: 'bg-gray-500 text-white', icon: User },
    };
    return badges[role] || badges.DEVELOPER;
  };

  const activateBankai = () => {
    setBankaiActivated(true);
    setTimeout(() => setBankaiActivated(false), 3000);
  };

  const roleBadge = getRoleBadge(currentWorkspace?.role);
  const RoleIcon = roleBadge.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-legion-navy flex items-center gap-3">
          <User size={32} />
          My Profile
        </h1>
        <p className="text-gray-600 mt-1">View your account information and workspace role</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-legion-navy to-legion-tech-blue p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-legion-gold rounded-full flex items-center justify-center shadow-lg">
              <span className="text-legion-navy font-bold text-4xl">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">{user?.fullName}</h2>
              <p className="text-blue-100 flex items-center gap-2">
                <Mail size={16} />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8">
          <h3 className="text-xl font-bold text-legion-navy mb-6">Account Information</h3>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Full Name
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <User size={20} className="text-gray-400" />
                <span className="text-gray-900 font-medium">{user?.fullName}</span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Mail size={20} className="text-gray-400" />
                <span className="text-gray-900 font-medium">{user?.email}</span>
              </div>
            </div>

            {/* Current Workspace */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Current Workspace
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Briefcase size={20} className="text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {currentWorkspace?.workspace.name}
                </span>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Your Role
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <RoleIcon size={20} className="text-gray-400" />
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleBadge.class}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Member Since
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Calendar size={20} className="text-gray-400" />
                <span className="text-gray-900 font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Coming Soon Notice */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={24} className="text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-blue-900 mb-2">
              Profile Editing Coming Soon
            </h4>
            <p className="text-blue-800 mb-3">
              We're working on letting you update your profile information. For now, your profile is view-only.
            </p>
            <p className="text-sm text-blue-700">
              <strong>Spoiler Alert:</strong> This feature is on the roadmap... somewhere... maybe... probably not. :)
            </p>
            <p className="text-sm text-blue-700 mt-1">
              (Yeah I wouldn't bet on that either)
            </p>
          </div>
        </div>
      </div>

      {/* Fun Stats Card */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-legion-navy mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-legion-gold">∞</p>
            <p className="text-sm text-gray-600 mt-1">Tasks Created</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">∞</p>
            <p className="text-sm text-gray-600 mt-1">Tasks Completed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">100%</p>
            <p className="text-sm text-gray-600 mt-1">Awesomeness</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">∞</p>
            <p className="text-sm text-gray-600 mt-1">Coffee Consumed</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-4 italic">
          These stats are totally real and not made up at all trust me bro
        </p>
      </div>
    </div>
  );
};

export default Profile;