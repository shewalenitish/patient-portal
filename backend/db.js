const Database = require('better-sqlite3');
const db = new Database('./database.sqlite');


// Run migration
const fs = require('fs');
const sql = fs.readFileSync('./migrations.sql', 'utf8');
db.exec(sql);


module.exports = db;