const duties = require('../collections/duties.js');
const urlib = require('url');

function handleDutyReq(req, data, done) {
  const parsedUrlString = req.url.split("/");
  if (parsedUrlString.length >= 4) {
    done("invalid url request");
  }
  if (req.method === "OPTIONS") {
    req.method = req.headers["access-control-request-method"];
  }
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  const urlParams = parsedUrlString[2];
  if (req.method === "GET") {
    if (parsedUrlString.length === 3) {
      duties.findDuty(urlParams, null, done)
    } else if (parsedUrl.searchParams.has("name")) {
      duties.findDuty(null, parsedUrl.searchParams.get("name"), done)
    } else if (parsedUrlString.length === 2) {
      duties.findDuty(null, null, done)
    } else {
      done("invalid url request")
    }
  } else if (req.method === "POST" && parsedUrlString.length === 2) {
    duties.insertDuty(data, done);
  } else if (req.method === "DELETE" && parsedUrlString.length === 3) {
    duties.deleteDuty(urlParams, done)
  } else if (req.method === "PATCH" && parsedUrlString.length === 3) {
    duties.updateDuty(urlParams, data, done)
  } else if (req.method === "PUT" && parsedUrlString[3] === "schedule" && parsedUrlString.length === 4) {
    duties.scheduleDuty(urlParams, done)
  } else {
    done("invalid url request")
  }
}

module.exports.handleDutyReq = handleDutyReq;
