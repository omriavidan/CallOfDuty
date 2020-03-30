const soldiers = require('../collections/soldiers.js');
const urlib = require('url');

function handleSoldierReq(req, soldierData, done) {
  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  const parsedUrlLength = req.url.split("/").length
  const soldierId = req.url.split("/")[2];
  if (parsedUrlLength > 3) {
    return done(new Error())
  }
  if (req.method === "GET") {
    if (parsedUrlLength === 3) {
      if (/tt[0-9]{7}/.test(soldierId)) {
        return soldiers.findSoldier({"id": soldierId}, done)
      }
      return done(new Error())

    } else if (parsedUrl.searchParams.has("name")) {
        const soldierName = parsedUrl.searchParams.get("name")
        return soldiers.findSoldier({"name": soldierName}, done)
    } else if (parsedUrlLength === 2) {
        return soldiers.findSoldier({}, done)
    }
    return done(new Error())
  } else if (req.method === "POST" && parsedUrlLength === 2) {
      return soldiers.insertSoldier(soldierData, done);
  }
  return done(new Error())
}

module.exports.handleSoldierReq = handleSoldierReq;
