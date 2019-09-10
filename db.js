var mysql = require('mysql');
var connection = mysql.createConnection({
	  multipleStatements: true,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'anp2'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;