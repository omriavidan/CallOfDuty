const duties = require('../collections/duties.js');
const urlib = require('url');

function handleDutyReq(req, data, done) {
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  const urlParams = req.url.split("/")[2];
  const parsedUrlLength = req.url.split("/").length;
  if (parsedUrlLength >= 5) {
    return done(new Error("Bad request, route not found"))
  }
  if (req.method === "GET") {
    if (parsedUrlLength === 3) {
      return duties.findDuty(urlParams, null, done)
    } else if (parsedUrl.searchParams.has("name")) {
      return duties.findDuty(null, parsedUrl.searchParams.get("name"), done)
    } else if (parsedUrlLength === 2) {
      return duties.findDuty(null, null, done)
    }
    return done(new Error("Bad request, no such path"))

  } else if (req.method === "POST" && parsedUrlLength === 2) {
    return duties.insertDuty(data, done);
  }
  return done(new Error("Bad request, not a POST or GET request"))
}

module.exports.handleDutyReq = handleDutyReq;
