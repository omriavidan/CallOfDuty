const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const attributes = ["name"]

function checkData(soldierData) {
  if (/tt[0-9]{7}/.test(soldierData["id"]) && soldierData["name"] && soldierData["rank"] && soldierData["limitations"] && Object.keys(soldierData).length === 5) {
    return true;
  }
  return false;
}

function handleInsertion(soldierData, done) {
  soldierData["duties"] = [];
  if (checkData(soldierData) === false) {
    done("One or more fields is invalid");
  } else {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('Soldiers')
      collection.insertOne(soldierData, (err) => {
        client.close();
        done(err);
      })
    });
  }
}

module.exports.insertSoldier = handleInsertion;
