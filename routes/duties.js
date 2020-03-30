const duties = require('../collections/duties.js');
const urlib = require('url');

function handleDutyReq(req, data, done) {
  const parsedUrlString = req.url.split("/");
  if (parsedUrlString.length >= 5) {
    return done(new Error())
  }
  if (req.method === "OPTIONS") {
    req.method = req.headers["access-control-request-method"];
  }
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  const urlParams = parsedUrlString[2];
  if (req.method === "GET") {
    if (parsedUrlString.length === 3) {
      return duties.findDuty(urlParams, null, done)
    } else if (parsedUrl.searchParams.has("name")) {
      return duties.findDuty(null, parsedUrl.searchParams.get("name"), done)
    } else if (parsedUrlString.length === 2) {
      return duties.findDuty(null, null, done)
    }
    return done(new Error())

  } else if (req.method === "POST" && parsedUrlString.length === 2) {
    return duties.insertDuty(data, done);
  } else if (req.method === "DELETE" && parsedUrlString.length === 3) {
    return duties.deleteDuty(urlParams, done)
  }
  return done(new Error())
}

module.exports.handleDutyReq = handleDutyReq;
