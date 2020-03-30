const MongoClient = require('mongodb').MongoClient;

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

module.exports.insertDuty = handleInsertion;