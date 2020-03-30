
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const dutiesFields = 7

function checkData(dutiesData) {
  return (dutiesData["name"] != null) &&
    (dutiesData["location"] != null) &&
    (dutiesData["days"] != null) &&
    (dutiesData["constraints"] != null) &&
    (dutiesData["soldiersRequired"] != null) &&
    (dutiesData["value"] != null) &&
    (Object.keys(dutiesData).length === dutiesFields)
}

function handleInsertion(dutiesData, done) {
  dutiesData["soldiers"] = dutiesData["soldiers"] || [];
  if (checkData(dutiesData) === false) {
    done("One or more fields are invalid");
  } else {
    MongoClient.connect(url, function (err, client) {
      if(err) return done(err)
      const db = client.db(dbName);
      const collection = db.collection('Duties')
      collection.insertOne(dutiesData, (insertErr) => {
        if(insertErr) return done(insertErr)
        client.close();
        done(err);
      })
    });
  }
}

function handleFind(dutyId, dutyName, done) {
  MongoClient.connect(url, function (err, client) {
    if(err) return done(err)
    const db = client.db(dbName);
    const collection = db.collection('Duties')
    let dutyToSearch = {};
    if (dutyId) {
      if (/[0-9a-fA-F]{24}/.test(dutyId)) {
        dutyToSearch["_id"] = ObjectId(dutyId);
      } else {
        done("invalid duty ID");
      }
    } else if (dutyName) {
      dutyToSearch["name"] = dutyName;
    }
    collection.find(dutyToSearch).toArray(function (findErr, docs) {
      if(findErr) return done(findErr)
      if (docs.length === 1) {
        docs = docs[0];
      }
      client.close();
      done(err, JSON.stringify(docs));
    });
  });
}

module.exports.insertDuty = handleInsertion;
module.exports.findDuty = handleFind;
