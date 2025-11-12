import React from 'react';
import { Pizza } from 'lucide-react';

const Loading = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin text-primary mb-4">
        <Pizza size={64} />
      </div>
      <p className="text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default Loading;
