const http = require('http');
const https = require('https');
const net = require('net');
const { spawn } = require('child_process');

// The target site that all requests will redirect to if not a supported URL
const site = "https://m.inftab.com"; 

// Extracts the host and port from a string in the format "host:port"
function getHostPortFromString(hostString, defaultPort) {
  const regex = /^([^:]+)(:([0-9]+))?$/;
  const result = regex.exec(hostString);
  if (result) {
    const host = result[1];
    const port = result[2] ? result[3] : defaultPort;
    return [host, port];
  }
  return [hostString, defaultPort];
}

// Creates the main HTTP server
const server = http.createServer((req, res) => {
  // Log the incoming request headers and URL
  console.log(req.headers);
  console.log(req.url);
  console.log("Serving HTTP request");

  // Handle the request based on the URL
  if (req.url === "/") {
    console.log("pong");
    res.writeHead(200);
    res.write("I'm alive");
    res.end();
  } else if (req.url === "http://connectivitycheck.gstatic.com/generate_204" ||
             !req.url || !(req.url.startsWith("https://") || req.url.startsWith("http://"))) {
    // Redirect to the target site if the URL is not supported
    res.writeHead(302, { Location: site });
    res.write("That's not where you want to go!");
    res.end();
  } else {
    // Make a request to the URL and pipe the response back to the client
    const outReq = (req.url.startsWith("https") ? https : http).request(req.url, {
      headers: req.headers,
      method: req.method
    });
    outReq.on("response", outRes => {
      res.writeHead(outRes.statusCode, outRes.headers);
      outRes.pipe(res, true);
    });
    outReq.on("error", err => {
      res.writeHead(500);
      res.write(err.name);
      res.write(err.message);
      res.end();
    });
    req.pipe(outReq, true);
  }
});

// Handles incoming CONNECT requests
server.on("connect", (req, socket, bodyhead) => {
  console.log("Connect event.");
  const [host, port] = getHostPortFromString(req.url, 443);
  console.log("Proxying HTTPS request");

  // Connect to the target host and proxy the request and response
  const proxySocket = new net.Socket();
  proxySocket.connect(port, host, () => {
    proxySocket.write(bodyhead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
});
  proxySocket.on("error", (err) => {
  console.log(err.name);
  console.log(err.message);
  socket.end();
});
});

// Listen on the specified port
  server.listen(process.env.PORT || 8080, () => {
  console.log(Server listening on ${server.address().port});
});
