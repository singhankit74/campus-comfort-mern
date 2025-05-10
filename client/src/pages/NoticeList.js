import React from 'react';
import Notice from '../components/Notice/Notice';
import { Card } from 'antd';

const NoticeList = () => {
  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-12">
          <Card title="Important Notices" className="shadow-sm">
            <Notice />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NoticeList; 