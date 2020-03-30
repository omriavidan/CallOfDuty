const http = require('http');
const fs = require('fs');
const soldiers = require('./routs/soldiers.js');
const duties = require('./routs/duties.js');
const justiceBoard = require('./routs/justiceBoard.js');

http.createServer(function (req, res) {
  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    if (body !== "") {
      body = JSON.parse(body);
    }
    const parsedUrl = req.url.split("/");
    console.log(parsedUrl);
    if (/soldiers.*/.test(parsedUrl[1]) && parsedUrl.length < 4) {
      soldiers.handleSoldierReq(req, body, function (err, result) {
        if (err) {
          res.end(err);
        } else {
          console.log(result);
          res.end(result);
        }
      });
    } else if (/duties.*/.test(parsedUrl[1]) && parsedUrl.length < 5) {
      console.log(body);
      duties.handleDutyReq(req, body, function (err, result) {
        if (err) {
          res.end(err);
        } else {
          console.log(result);
          res.end(result);
        }
      });
    } else if (/justiceBoard/.test(parsedUrl[1]) && parsedUrl.length < 3) {
      justiceBoard.getJusticeBoard(function (err, result) {
        if (err) {
          res.end(err);
        } else {
          console.log(result);
          res.end(result);
        }
      });
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
}).listen(3000);