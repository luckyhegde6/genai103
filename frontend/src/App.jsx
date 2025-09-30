import React from 'react';
import QueryBox from './components/QueryBox';
export default function App(){
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">SQL Copilot — Local</h1>
      <QueryBox />
    </div>
  );
}
