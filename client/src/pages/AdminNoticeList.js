import React from 'react';
import AdminNotice from '../components/Notice/AdminNotice';
import { Card } from 'antd';

const AdminNoticeList = () => {
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-12">
          <Card title="Notice Management" className="shadow-sm">
            <AdminNotice />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminNoticeList; 