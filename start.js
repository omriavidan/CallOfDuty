const http = require('http');
const soldiers = require('./routs/soldiers.js');
const duties = require('./routs/duties.js');
const justiceBoard = require('./routs/justiceBoard.js');

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
      if (/soldiers.*/.test(parsedUrl)) {
        soldiers.handleSoldierReq(req, body, function (err, result) {
          if (err) {
            res.end(err);
          } else {
            res.end(result);
          }
        });
      } else if (/duties.*/.test(parsedUrl)) {
        duties.handleDutyReq(req, body, function (err, result) {
          if (err) {
            res.end(err);
          } else {
            res.end(result);
          }
        });
      } else if (/justiceBoard/.test(parsedUrl)) {
        justiceBoard.getJusticeBoard(function (err, result) {
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
