const { Client } = require('pg');
require('dotenv').config();

async function checkConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('데이터베이스 연결 시도 중...');
    await client.connect();
    console.log('✅ 연결 성공!');
    const res = await client.query('SELECT NOW()');
    console.log('현재 시간:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ 연결 실패:', err.message);
  }
}

checkConnection();
