import React from 'react';
import GoogleClassroomIntegration from '../../components/GoogleClassroomIntegration';

const GoogleClassroom: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <GoogleClassroomIntegration />
      </div>
    </div>
  );
};

export default GoogleClassroom;
