import React, {useState} from 'react';
import axios from 'axios';
import ResultTable from './ResultTable';
import ResultChart from './ResultChart';
import { FaMagic, FaPlay } from 'react-icons/fa';

export default function QueryBox(){
  const [nl, setNl] = useState('');
  const [llmSql, setLlmSql] = useState(null);
  const [rows, setRows] = useState([]);
  const [plan, setPlan] = useState(null);
  const [hints, setHints] = useState([]);

  async function handleSuggest(){
    const { data } = await axios.post('/api/suggest', { prompt: nl });
    if (data.llm) {
      setLlmSql(data.llm);
    } else setLlmSql({ sql: data.raw || 'LLM did not return JSON' });
  }

  async function handleExecute(){
    if(!llmSql?.sql) return alert('no sql');
    const exec = await axios.post('/api/execute', { sql: llmSql.sql, params: llmSql.params || [] });
    setRows(exec.data.rows || []);
    const explain = await axios.post('/api/explain', { sql: llmSql.sql });
    setPlan(explain.data.plan);
    setHints(explain.data.hints || []);
  }

  return (
    <div>
      <textarea value={nl} onChange={e=>setNl(e.target.value)} rows={4} className="w-full p-3 border rounded shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ask: e.g. Show total orders per customer in March 2023"/>
      <div className="flex gap-2 mt-2">
        <button onClick={handleSuggest} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Suggest SQL <FaMagic className="ml-2" />
        </button>
        <button onClick={handleExecute} className="flex items-center px-4 py-2 bg-green-600 text-white rounded shadow-md hover:bg-green-700 focus:outline-none focus:ring-green-500">
          Execute SQL <FaPlay className="ml-2" />
        </button>
      </div>
      {llmSql && (
        <div className="mt-4 p-3 border rounded bg-gray-50 shadow-md">
          <h3 className="font-semibold">LLM SQL</h3>
          <pre className="text-sm whitespace-pre-wrap font-mono bg-gray-100 p-2 rounded">{llmSql.sql}</pre>
          <div className="mt-2 text-sm text-gray-700">{llmSql.explain}</div>
        </div>
      )}
      {hints.length>0 && <div className="mt-2 text-yellow-700"><strong>Hints:</strong> {hints.join(' • ')}</div>}
      {rows.length>0 && <div className="mt-4">
        <ResultTable rows={rows} />
        <ResultChart rows={rows} />
      </div>}
    </div>
  );
}
