console.log("Keep alive has arrived!");
const http = require('http');
const https = require('https');

// const server = http.createServer(function(req, res) {
// 	console.log("pong");
// 	res.writeHead(200);
// 	res.write("I'm alive");
// 	res.end();
// });

function start () {
	// server.listen(80);
	setInterval(() => {
		console.log("ping");
		const requise = https.request("https://PingBack.SpaceSaver2000.repl.co/", { method: "POST" });
		requise.write("https://GabbProxyPlayit.GamerGoat112.repl.co/");
		requise.end();
	}, 120000);
}

module.exports = start;