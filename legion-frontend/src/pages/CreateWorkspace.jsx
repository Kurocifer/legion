import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { Building2, ArrowLeft } from 'lucide-react';
import { workspaceAPI } from '../api/workspace';
import useWorkspaceStore from '../store/workspaceStore';

const CreateWorkspace = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const [form] = Form.useForm();

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    form.setFieldsValue({ slug });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const workspace = await workspaceAPI.createWorkspace(values);
      
      const workspaceMember = {
        workspace: workspace,
        role: 'ADMIN', // Creator is always ADMIN
      };
      
      setCurrentWorkspace(workspaceMember);
      message.success(`Workspace "${workspace.name}" created!`);
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-legion-light">
      {/* Header */}
      <div className="bg-legion-navy text-white py-6 px-8 flex items-center gap-3">
        <Button
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/workspaces')}
          type="text"
          className="text-white hover:text-legion-gold"
        />
        <div className="flex items-center gap-3">
          <img src="/legion-logo.png" alt="Legion" className="w-10 h-10" />
          <h1 className="text-2xl font-bold">LEGION</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-legion-navy rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="text-legion-gold" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-legion-navy mb-2">
            Create New Workspace
          </h2>
          <p className="text-gray-600">
            Set up a workspace for your team to collaborate
          </p>
        </div>

        <Card className="shadow-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              label="Workspace Name"
              name="name"
              rules={[
                { required: true, message: 'Please enter workspace name' },
                { min: 3, message: 'Name must be at least 3 characters' },
              ]}
            >
              <Input 
                placeholder="Acme Corporation" 
                onChange={handleNameChange}
              />
            </Form.Item>

            <Form.Item
              label="Workspace Slug"
              name="slug"
              extra="This will be used in URLs. Only lowercase letters, numbers, and dashes."
              rules={[
                { required: true, message: 'Please enter workspace slug' },
                { 
                  pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 
                  message: 'Only lowercase letters, numbers, and dashes allowed' 
                },
                { min: 3, message: 'Slug must be at least 3 characters' },
              ]}
            >
              <Input placeholder="acme-corp" />
            </Form.Item>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You will be the administrator of this workspace. 
                You can invite team members after creation.
              </p>
            </div>

            <Form.Item>
              <div className="flex gap-3">
                <Button 
                  onClick={() => navigate('/workspaces')}
                  size="large"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                  className="flex-1"
                >
                  Create Workspace
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default CreateWorkspace;