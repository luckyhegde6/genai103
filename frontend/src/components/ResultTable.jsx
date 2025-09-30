import React from 'react';
export default function ResultTable({rows=[]}){
  if(!rows.length) return null;
  const keys = Object.keys(rows[0]);
  return (
    <table className="w-full mt-4 border-collapse">
      <thead><tr>{keys.map(k=> <th key={k} className="border px-2 py-1">{k}</th>)}</tr></thead>
      <tbody>
        {rows.map((r,i)=> <tr key={i}>{keys.map(k => <td key={k} className="border px-2 py-1">{String(r[k])}</td>)}</tr>)}
      </tbody>
    </table>
  );
}
