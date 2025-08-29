import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'senha@123',
  database: 'ControlHub'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

export default db;
