import React, { useState, useEffect } from 'react';
import { fetchData } from './neo4jService';
import GraphViewer from './GraphViewer';

function App() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    async function getData() {
      const data = await fetchData();
      // 데이터가 있는지 확인하고 기본값 설정
      if (data) {
        setNodes(data.nodes || []);
        setLinks(data.links || []);
      }
    }
    getData();
  }, []);

  return (
    <div className="App">
      <h1>Neo4j Graph Visualization</h1>
      <GraphViewer nodes={nodes} links={links} />
    </div>
  );
}

export default App;
