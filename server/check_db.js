const mysql = require('mysql2');
const db = mysql.createConnection({host: 'localhost', user: 'root', password: '', database: 'divide_app'});
db.query('DESCRIBE rides;', (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res, null, 2));
    db.end();
});
