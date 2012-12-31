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
		var flow = require('./_flow');
		app.get('/flow/?', function(req, res, next) {
			res.writeHead(301, {location: '/flow/Main'});
			res.end();
		});

		app.get('/flow/:docName', function(req, res, next) {
			var docName;
			docName = req.params.docName;
			flow(docName, server.model, res, next);
		});

		app.get('/flow/:docName/code', function(req, res, next) {
			var docName = req.params.docName;
			server.model.getSnapshot("flow:" + docName, 
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
  require('redis');
  options.db = {type: 'redis'};
} catch (e) {
	console.log(e);
}

console.log("PageFlows Server Started.");
console.log("Options: ", options);

var port = argv.p;

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

server.listen(port);
console.log("Page Flows running at http://localhost:" + port);

process.title = 'pageflows'
process.on('uncaughtException', function (err) {
  console.error('An error has occurred. Please file a ticket here: https://github.com/josephg/ShareJS/issues');
  console.error('Version ' + sharejs.version + ': ' + err.stack);
});
