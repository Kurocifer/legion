import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Mail, Trash2 } from 'lucide-react';
import { invitationAPI } from '../api/invitation';
import { userAPI } from '../api/user';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';
import InviteUserModal from '../components/team/InviteUserModal';

const Settings = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const user = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [members, setMembers] = useState([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace && activeTab === 'members') {
      loadMembers();
    } else if (currentWorkspace && activeTab === 'invitations') {
      loadInvitations();
    }
  }, [currentWorkspace, activeTab]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getWorkspaceMembers(currentWorkspace.workspace.id);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await invitationAPI.getWorkspaceInvitations(currentWorkspace.workspace.id);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: 'bg-legion-gold text-legion-navy',
      MANAGER: 'bg-blue-500 text-white',
      DEVELOPER: 'bg-gray-500 text-white',
    };
    return badges[role] || badges.DEVELOPER;
  };

  const isAdmin = currentWorkspace?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h2>
        <p className="text-gray-600">Only workspace admins can access settings</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-legion-navy flex items-center gap-3">
          <SettingsIcon size={32} />
          Workspace Settings
        </h1>
        <p className="text-gray-600 mt-1">{currentWorkspace?.workspace.name}</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-legion-navy border-b-2 border-legion-gold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'members'
                ? 'text-legion-navy border-b-2 border-legion-gold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'invitations'
                ? 'text-legion-navy border-b-2 border-legion-gold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Invitations
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={currentWorkspace.workspace.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Workspace name cannot be changed after creation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workspace Slug
                </label>
                <input
                  type="text"
                  value={currentWorkspace.workspace.slug}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Role
                </label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadge(currentWorkspace.role)}`}>
                  {currentWorkspace.role}
                </span>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-legion-navy">
                  Workspace Members ({members.length})
                </h2>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
                >
                  <Mail size={16} />
                  Invite Member
                </button>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading members...</p>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.user.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-legion-gold rounded-full flex items-center justify-center">
                          <span className="text-legion-navy font-bold">
                            {member.user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user.fullName}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-legion-navy">
                  Pending Invitations ({invitations.length})
                </h2>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 flex items-center gap-2"
                >
                  <Mail size={16} />
                  Send New Invite
                </button>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading invitations...</p>
              ) : invitations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No pending invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{invitation.email}</p>
                        <p className="text-sm text-gray-500">
                          Invited as {invitation.role} • Expires{' '}
                          {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(invitation.role)}`}>
                        {invitation.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspaceId={currentWorkspace?.workspace.id}
        onInviteSent={() => {
          setInviteModalOpen(false);
          if (activeTab === 'invitations') {
            loadInvitations();
          }
        }}
      />
    </div>
  );
};

export default Settings;