const soldiers = require('../collections/soldiers.js');
const urlib = require('url');

function handleSoldierReq(req, soldierData, done) {
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  const parsedUrlLength = req.url.split("/").length
  const soldierId = req.url.split("/")[2];
  if (parsedUrlLength > 3) {
    return done(new Error("Bad request, route not found"))
  }
  if (req.method === "GET") {
    if (parsedUrlLength === 3) {
      if (/tt[0-9]{7}/.test(soldierId)) {
        return soldiers.findSoldier({"id": soldierId}, done)
      }
      return done(new Error("Bad request, sodlier Id should be in ttxxxxxxx format"))

    } else if (parsedUrl.searchParams.has("name")) {
        const soldierName = parsedUrl.searchParams.get("name")
        return soldiers.findSoldier({"name": soldierName}, done)
    } else if (parsedUrlLength === 2) {
        return soldiers.findSoldier({}, done)
    }
    return done(new Error("Bad request, no such path"))
  } else if (req.method === "POST" && parsedUrlLength === 2) {
      return soldiers.insertSoldier(soldierData, done);
  }
  return done(new Error("Bad request, not a POST or GET request"))
}

module.exports.handleSoldierReq = handleSoldierReq;
