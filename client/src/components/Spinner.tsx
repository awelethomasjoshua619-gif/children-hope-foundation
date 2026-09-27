import React from 'react';

export const Spinner: React.FC = () => (
  <div className="p-12 text-center">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
  </div>
);
