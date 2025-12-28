import { useState, useEffect } from 'react';
import { Users, Mail, UserPlus, Shield, Code, Crown } from 'lucide-react';
import { userAPI } from '../api/user';
import useWorkspaceStore from '../store/workspaceStore';
import InviteUserModal from '../components/team/InviteUserModal';

const Team = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadMembers();
    }
  }, [currentWorkspace]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getWorkspaceMembers(currentWorkspace.workspace.id);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
      alert('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return <Crown size={16} className="text-legion-gold" />;
      case 'MANAGER':
        return <Shield size={16} className="text-blue-500" />;
      default:
        return <Code size={16} className="text-gray-500" />;
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

  const canInvite = currentWorkspace?.role === 'ADMIN' || currentWorkspace?.role === 'MANAGER';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-legion-navy flex items-center gap-3">
            <Users size={32} />
            Team
          </h1>
          <p className="text-gray-600 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''} in {currentWorkspace?.workspace.name}
          </p>
        </div>

        {canInvite && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <UserPlus size={20} />
            Invite Member
          </button>
        )}
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading team members...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.user.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              {/* Avatar */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-legion-gold rounded-full flex items-center justify-center">
                    <span className="text-legion-navy font-bold text-lg">
                      {member.user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-legion-navy">{member.user.fullName}</h3>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role)}
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getRoleBadge(member.role)}`}>
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No team members yet</h3>
          <p className="text-gray-500 mb-6">Invite people to collaborate on this workspace</p>
          {canInvite && (
            <button
              onClick={() => setInviteModalOpen(true)}
              className="px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90"
            >
              Invite Your First Member
            </button>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        workspaceId={currentWorkspace?.workspace.id}
        onInviteSent={() => {
          alert('Invitation sent successfully!');
          setInviteModalOpen(false);
        }}
      />
    </div>
  );
};

export default Team;