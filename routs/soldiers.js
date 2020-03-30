const soldiers = require('../collections/soldiers.js');
const urlib = require('url');

function handleSoldierReq(req, data, done) {

  const parsedUrlString = req.url.split("/");

  const parsedUrl = new urlib.URL("http://localhost:3000/" + req.url);
  if (req.method === "GET") {
    if (parsedUrlString.length === 3 && /tt[0-9]{7}/.test(parsedUrlString[2])) {
      soldiers.findSoldier(parsedUrlString[2], null, done)
    } else if (parsedUrl.searchParams.has("name")) {
      soldiers.findSoldier(null, parsedUrl.searchParams.get("name"), done)
    } else if (parsedUrlString.length === 2) {
      soldiers.findSoldier(null, null, done)
    } else {
      done("invalid url request")
    }
  } else if (req.method === "POST" && parsedUrlString.length === 2) {
    soldiers.insertSoldier(data, done);
  }
}

module.exports.handleSoldierReq = handleSoldierReq;