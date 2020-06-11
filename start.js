const http = require('http');
const soldiers = require('./routes/soldiers.js');
const duties = require('./routes/duties.js');
const justiceBoard = require('./routes/justiceBoard.js');

function runServer() {
  let server = http.createServer(function (req, res) {
    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      if (body !== "") {
        body = JSON.parse(body);
      }
      const parsedUrl = (req.url.split("/"))[1];
      if ("soldiers" === parsedUrl ||
        (parsedUrl.length > 14 && "soldiers?name=" === parsedUrl.substr(0, 14))) {
        soldiers.handleSoldierReq(req, body, function (err, result) {
          if (err) {
            res.statusCode = 404;
            res.end(err);
          } else {
            res.end(result);
          }
        });
      } else if ("duties" === parsedUrl ||
      (parsedUrl.length > 12 && "duties?name=" === parsedUrl.substr(0, 12))) {
        duties.handleDutyReq(req, body, function (err, result) {
          if (err) {
            res.statusCode = 404;
            res.end(err);
          } else {
            res.end(result);
          }
        });
      } else if (/justiceBoard/.test(parsedUrl)) {
        justiceBoard.getJusticeBoard(req, function (err, result) {
          if (err) {
            res.end(err);
          } else {
            res.end(result);
          }
        });
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
  }).listen(3000);

  return server;
}

module.exports.server = runServer();
