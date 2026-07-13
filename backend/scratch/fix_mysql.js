const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'An1meParadise@2026',
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err);
    process.exit(1);
  }
  console.log('🔌 Connected to MySQL server.');

  connection.query(
    "ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY 'An1meParadise@2026';",
    (err, results) => {
      if (err) {
        console.error('❌ Alter user query failed:', err);
      } else {
        console.log('✅ Alter user query executed successfully.');
      }

      connection.query('FLUSH PRIVILEGES;', (err) => {
        if (err) {
          console.error('❌ Flush privileges failed:', err);
        } else {
          console.log('✅ Privileges flushed.');
        }

        connection.end();
        console.log('👋 Connection closed.');
      }
    );
  });
});
