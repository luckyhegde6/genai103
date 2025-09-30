import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

export default function ResultChart({rows=[]}){
  // pick first numeric column for demo
  if(!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const numericCol = cols.find(c => typeof rows[0][c] === 'number');
  if(!numericCol) return null;
  const data = rows.map((r, i) => ({ name: i+1, value: r[numericCol] }));
  return (
    <div style={{width: '100%', height: 250}} className="mt-4">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
