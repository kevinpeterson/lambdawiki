var connect = require('connect'),
	sharejs = require('share'),
	hat = require('hat').rack(32, 36);

var argv = require('optimist').
	usage("Usage: $0 [-p portnum]").
	default('p', 8000).
	alias('p', 'port').
	argv;

var server = connect(
	connect.favicon(),
	connect.static(__dirname + '/'),
	connect.router(function (app) {
		var renderer = require('./_static');
		app.get('/static/:docName', function(req, res, next) {
			var docName;
			docName = req.params.docName;
			renderer(docName, server.model, res, next);
		});
		var flow = require('./_lambda');
		app.get('/lambda/?', function(req, res, next) {
			res.writeHead(301, {location: '/lambda/main'});
			res.end();
		});

		app.get('/lambda/:docName', function(req, res, next) {
			var docName;
			docName = req.params.docName;
			flow(docName, server.model, res, next);
		});

		app.get('/lambda/:docName/code', function(req, res, next) {
			var docName = req.params.docName;
			server.model.getSnapshot("lambda:" + docName, 
				function(error, data){
					if(! error){
						res.writeHead(200, { 'Content-Type': 'application/json' });
						var jsonData = {data: data.snapshot};
						res.end(JSON.stringify(jsonData));
					} else {
						res.writeHead(404, { 'Content-Type': 'application/json' });
						res.end();
					}
				}
			);
		});
	})
);

var options = {
  db: {type: 'none'},
  browserChannel: {cors: '*'},
  auth: function(client, action) {
		// This auth handler rejects any ops bound for docs starting with 'readonly'.
    if (action.name === 'submit op' && action.docName.match(/^readonly/)) {
      action.reject();
    } else {
      action.accept();
    }
  }
};

// Lets try and enable redis persistance if redis is installed...
try {
	if (process.env.REDISTOGO_URL) {
		require('redis');
		var rtg = require("url").parse(process.env.REDISTOGO_URL);
		options.db = {
			type: 'redis',
			hostname: rtg.hostname,
			port: rtg.port,
			auth: rtg.auth
		};
	} else if (process.env.DATABASE_URL) {
		require('pg');
		options.db = {
			uri: process.env.DATABASE_URL,
			type: 'pg',
			create_tables_automatically: true
		};
	} else {
		require('redis');
		options.db = {type: 'redis'};
	}
} catch (e) {
	console.log(e);
	throw e;
}

console.log("LambdaWiki Server Started.");
console.log("Options: ", options);

var port = process.env.PORT || argv.p;

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

server.listen(port);
console.log("LambdaWiki running at http://localhost:" + port);

process.title = 'lambdaWiki'
process.on('uncaughtException', function (err) {
  console.error('An error has occurred. Please file a ticket here: https://github.com/josephg/ShareJS/issues');
  console.error('Version ' + sharejs.version + ': ' + err.stack);
});
