const duties = require('../collections/duties.js');
const urlib = require('url');

function handleDutyReq(req, data, done) {
  const parsedUrlString = req.url.split("/");
  if (req.method === "OPTIONS") {
    req.method = req.headers["access-control-request-method"];
  }
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  if (req.method === "GET") {
    if (parsedUrlString.length === 3) {
      duties.findDuty(parsedUrlString[2], null, done)
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
    duties.deleteDuty(parsedUrlString[2], done)
  } else if (req.method === "PATCH" && parsedUrlString.length === 3) {
    duties.updateDuty(parsedUrlString[2], data, done)
  } else if (req.method === "PUT" && parsedUrlString[3] === "schedule" && parsedUrlString.length === 4) {
    duties.scheduleDuty(parsedUrlString[2], done)
  } else {
    done("invalid url request")
  }
}

module.exports.handleDutyReq = handleDutyReq;