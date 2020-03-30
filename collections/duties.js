const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

function checkData(dutiesData) {
  if (dutiesData["name"] && dutiesData["location"] && dutiesData["days"] && dutiesData["constraints"] && dutiesData["soldiersRequired"] && dutiesData["value"] && Object.keys(dutiesData).length === 7) {
    return true;
  }
  return false;
}

function handleInsertion(dutiesData, done) {
  dutiesData["soldiers"] = [];
  if (checkData(dutiesData) === false) {
    done("One or more fields is invalid");
  } else {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('Duties')
      collection.insertOne(dutiesData, (err) => {
        assert.equal(err, null);
        client.close();
        done(err);
      })
    });
  }
}

module.exports.insertDuty = handleInsertion;