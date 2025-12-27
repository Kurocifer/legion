import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Mail, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dropdown, { DropdownItem, DropdownDivider } from '../common/Dropdown';
import useWorkspaceStore from '../../store/workspaceStore';
import { workspaceAPI } from '../../api/workspace';

const WorkspaceSwitcher = () => {
  const navigate = useNavigate();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceChange = (workspace) => {
    setCurrentWorkspace(workspace);
    window.location.reload();
  };

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { label: 'Admin', class: 'bg-legion-gold text-legion-navy' },
      MANAGER: { label: 'Manager', class: 'bg-blue-500 text-white' },
      DEVELOPER: { label: 'Dev', class: 'bg-gray-500 text-white' },
    };
    return badges[role] || badges.DEVELOPER;
  };

  if (!currentWorkspace) {
    return null;
  }

  const badge = getRoleBadge(currentWorkspace.role);

  return (
    <Dropdown
      trigger={
        <button className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {currentWorkspace.workspace.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${badge.class}`}>
                {badge.label}
              </span>
            </div>
          </div>
          <ChevronDown size={16} className="text-white" />
        </button>
      }
      align="left"
    >
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-xs text-gray-500 uppercase font-semibold">Your Workspaces</p>
      </div>

      {workspaces.map((ws) => {
        const wsBadge = getRoleBadge(ws.role);
        const isCurrent = ws.workspace.id === currentWorkspace.workspace.id;

        return (
          <button
            key={ws.workspace.id}
            onClick={() => !isCurrent && handleWorkspaceChange(ws)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-100 transition-colors ${
              isCurrent ? 'bg-legion-gold bg-opacity-10' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{ws.workspace.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${wsBadge.class}`}>
                {wsBadge.label}
              </span>
            </div>
            {isCurrent && <Check size={16} className="text-legion-gold" />}
          </button>
        );
      })}

      <DropdownDivider />

      <DropdownItem
        icon={<Plus size={16} />}
        label="Create Workspace"
        onClick={() => navigate('/workspace/create')}
      />

      <DropdownItem
        icon={<Mail size={16} />}
        label="Join with Invite"
        onClick={() => navigate('/invite/accept')}
      />
    </Dropdown>
  );
};

export default WorkspaceSwitcher;