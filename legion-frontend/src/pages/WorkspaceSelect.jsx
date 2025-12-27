import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Empty, Spin, message } from 'antd';
import { Building2, Plus, LogOut } from 'lucide-react';
import { workspaceAPI } from '../api/workspace';
import useWorkspaceStore from '../store/workspaceStore';
import useAuthStore from '../store/authStore';

const WorkspaceSelect = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const data = await workspaceAPI.getMyWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      message.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'gold',
      MANAGER: 'blue',
      DEVELOPER: 'default',
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-legion-light flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-legion-light">
      {/* Header */}
      <div className="bg-legion-navy text-white py-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/legion-logo.png" alt="Legion" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">LEGION</h1>
        </div>
        <Button 
          icon={<LogOut size={16} />} 
          onClick={handleLogout}
          type="text"
          className="text-white hover:text-legion-gold"
        >
          Logout
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-legion-navy mb-2">
            Select a Workspace
          </h2>
          <p className="text-gray-600">
            Choose which workspace you want to work in
          </p>
        </div>

        {workspaces.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No workspaces yet"
          >
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={() => navigate('/workspace/create')}
              size="large"
            >
              Create Your First Workspace
            </Button>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <Card
                key={ws.workspace.id}
                hoverable
                onClick={() => handleSelectWorkspace(ws)}
                className="border-2 border-gray-200 hover:border-legion-gold transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-legion-navy rounded-lg flex items-center justify-center">
                      <Building2 className="text-legion-gold" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-legion-navy mb-1">
                        {ws.workspace.name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        @{ws.workspace.slug}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    count={ws.role} 
                    color={getRoleBadgeColor(ws.role)}
                  />
                </div>
              </Card>
            ))}

            <Card
              hoverable
              onClick={() => navigate('/workspace/create')}
              className="border-2 border-dashed border-gray-300 hover:border-legion-tech-blue bg-gray-50 flex items-center justify-center"
              style={{ minHeight: '120px' }}
            >
              <div className="text-center">
                <Plus className="mx-auto mb-2 text-legion-tech-blue" size={32} />
                <p className="text-legion-tech-blue font-medium">
                  Create New Workspace
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSelect;