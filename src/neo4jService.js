import neo4j from 'neo4j-driver';
import { neo4jConfig } from './config';

// Neo4j 데이터베이스 연결 설정
const driver = neo4j.driver(
  neo4jConfig.uri, 
  neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password)
);

export async function fetchData() {
  const session = driver.session();
  
  try {
    console.log('Neo4j 데이터베이스에 쿼리 실행 중...');

    // 양방향 관계를 모두 포함하여 쿼리 실행
    const result = await session.run(`
      MATCH (n)-[r]->(m) RETURN n, r, m
      UNION
      MATCH (n)<-[r]-(m) RETURN n, r, m
    `);
    
    console.log('쿼리 결과:', result);

    const nodes = [];
    const links = [];

    result.records.forEach(record => {
      const nNode = record.get('n');
      const mNode = record.get('m');
      
      // 노드가 존재하는지 확인
      if (!nNode || !mNode) {
        console.error('노드 정보가 없습니다.');
        return;
      }
      
      // ID 값 또는 name, value 값 사용
      const nName = nNode.properties.name || nNode.properties.value || `Node_${nNode.identity}`;
      const mName = mNode.properties.name || mNode.properties.value || `Node_${mNode.identity}`;

      const nProperties = nNode.properties || {};
      const mProperties = mNode.properties || {};

      // 중복된 노드 추가 방지
      if (!nodes.some(node => node.name === nName)) {
        nodes.push({ name: nName, ...nProperties });
      }
      if (!nodes.some(node => node.name === mName)) {
        nodes.push({ name: mName, ...mProperties });
      }

      // 유효한 노드일 때만 링크 생성
      links.push({
        source: nName,
        target: mName,
        relationship: record.get('r').type
      });

      console.log('생성된 링크:', { source: nName, target: mName, relationship: record.get('r').type });
    });

    console.log('최종 노드:', nodes);
    console.log('최종 링크:', links);

    return { nodes, links };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { nodes: [], links: [] };
  } finally {
    await session.close();
    console.log('Neo4j 세션 닫힘');
  }
}
