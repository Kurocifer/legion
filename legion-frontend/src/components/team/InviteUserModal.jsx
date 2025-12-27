import { useState } from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';
import { invitationAPI } from '../../api/invitation';

const InviteUserModal = ({ isOpen, onClose, workspaceId, onInviteSent }) => {
  const [loading, setLoading] = useState(false);
  const [invitationToken, setInvitationToken] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    role: 'DEVELOPER',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invitation = await invitationAPI.createInvitation({
        email: formData.email,
        workspaceId: workspaceId,
        role: formData.role,
      });

      setInvitationToken(invitation.token);
      // Don't close modal - show token instead
    } catch (error) {
      console.error('Failed to create invitation:', error);
      alert(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/invite/accept/${invitationToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'DEVELOPER' });
    setInvitationToken(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-legion-navy">Invite Team Member</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {invitationToken ? (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 font-semibold mb-2">✓ Invitation Created!</p>
              <p className="text-sm text-green-700">
                Share this link with <strong>{formData.email}</strong>
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-600 mb-2">Invitation Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/invite/accept/${invitationToken}`}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-3 py-2 bg-legion-tech-blue text-white rounded hover:opacity-90 flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              This invitation expires in 7 days. The user can also manually enter the token on the invite page.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setInvitationToken(null);
                  setFormData({ email: '', role: 'DEVELOPER' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Invite Another
              </button>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="colleague@company.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              />
            </div>

            {/* Role */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legion-gold focus:border-transparent"
              >
                <option value="DEVELOPER">Developer - Can create/edit tasks</option>
                <option value="MANAGER">Manager - Can manage sprints & invite users</option>
                <option value="ADMIN">Admin - Full workspace control</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the appropriate permission level for this user
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-legion-gold text-legion-navy rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    <Mail size={16} />
                    Send Invite
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteUserModal;