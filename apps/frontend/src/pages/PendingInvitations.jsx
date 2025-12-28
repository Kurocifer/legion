import { useEffect, useState } from 'react';
import { Card, Button, Empty, Spin, message } from 'antd';
import { MailCheck } from 'lucide-react';
import { invitationAPI } from '../api/invitation';
import { useNavigate } from 'react-router-dom';

const PendingInvitations = ({ invitations }) => {
  const navigate = useNavigate();

  if (!invitations || invitations.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No pending invitations"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {invitations.map((inv) => (
        <Card key={inv.id} className="border-2 border-legion-gold">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">
                {inv.workspace.name}
              </h3>
              <p className="text-gray-500">
                Role: {inv.role}
              </p>
            </div>
            <Button
              type="primary"
              icon={<MailCheck size={16} />}
              onClick={() => navigate(`/invite/${inv.token}`)}
            >
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PendingInvitations;
