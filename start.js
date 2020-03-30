const http = require('http');
const soldiers = require('./routes/soldiers.js');
const duties = require('./routes/duties.js');
const justiceBoard = require('./routes/justiceBoard.js');
const dutiesUrlLength = 12
const soldiersUrlLength = 14

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
      const soldierUrlValid = ("soldiers" === parsedUrl ||
        (parsedUrl.length > soldiersUrlLength && "soldiers?name=" === parsedUrl.substr(0, soldiersUrlLength)))
      const dutyUrlValid = ("duties" === parsedUrl ||
        (parsedUrl.length > dutiesUrlLength && "duties?name=" === parsedUrl.substr(0, dutiesUrlLength)))
      if (soldierUrlValid) {
        soldiers.handleSoldierReq(req, body, function (err, result) {
          if (err) {
            res.statusCode = 400;
            return res.end(err);
          }
          return res.end(result)
        });
      } else if (dutyUrlValid) {
        duties.handleDutyReq(req, body, function (err, result) {
          if (err) {
            res.statusCode = 400;
            return res.end(err);
          }
          return res.end(result)
        });
      } else if ("justiceBoard" === parsedUrl) {
        justiceBoard.getJusticeBoard(req, function (err, result) {
          if (err) {
            res.statusCode = 400;
            return res.end(err);
          }
          return res.end(result)
        });
      } else {
        res.statusCode = 400;
        res.end();
      }
    });
  }).listen(3000);

  return server;
}

module.exports.server = runServer();