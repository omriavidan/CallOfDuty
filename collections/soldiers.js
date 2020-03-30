const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const soldierFields = 5

function checkData(soldierData) {
  return (/tt[0-9]{7}/.test(soldierData["id"]) &&
  soldierData["name"] != null &&
  soldierData["rank"] != null &&
  soldierData["limitations"] != null &&
  soldierData["duties"] != null &&
  Object.keys(soldierData).length === soldierFields)
}

function insertSoldier(soldierData, done) {
  soldierData["duties"] = soldierData["duties"] || [];
  if (checkData(soldierData) === false) {
    return done("One or more fields are invalid");
  }
  MongoClient.connect(url, function (connectionErr, client) {
    if (connectionErr)
      return done(connectionErr)
    const db = client.db(dbName);
    const collection = db.collection('Soldiers')
    collection.insertOne(soldierData, (err) => {
      client.close();
      done(err);
    })
  });
}

module.exports.insertSoldier = insertSoldier;
