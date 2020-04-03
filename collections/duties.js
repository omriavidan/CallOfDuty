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

function checkUpdateData(dutiesData) {
  let legalAttr = ["name", "location", "days", "constraints", "soldiersRequired", "value", "soldiers"]
  for (let attr in dutiesData) {
    if (!(legalAttr.includes(attr))) {
      return false;
    }
  }
  return true;
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

function handleDelete(dutyId, done) {
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
    }
    collection.find(dutyToSearch).toArray(function (findErr, record) {
      if(findErr) return done(findErr)
      if (record.length === 1 && record[0]["soldiers"].length === 0) {
        collection.deleteOne(dutyToSearch, (deleteError) => {
          client.close();
          if (deleteError) {
            done(deleteError);
          }
          done();
        })
      } else {
        client.close();
        done("Duty is already scheduled and can't be deleted");
      }
    });
  });
}

function updateDuty(dutyId, dataToUpdate, done) {
  if (checkUpdateData(dataToUpdate) === false) {
    done("One or more fields are invalid");
  } else {
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
      }
      collection.find(dutyToSearch).toArray(function (findErr, record) {
        if(findErr) return done(findErr)
        if (record.length === 1 && record[0]["soldiers"].length === 0) {
          collection.updateOne(dutyToSearch, {
            $set: dataToUpdate
          }, function (err) {
            client.close();
            done(err);
          });
        } else {
          client.close();
          done("Duty is already scheduled and can't be deleted");
        }
      });
    });
  }
}

module.exports.insertDuty = handleInsertion;
module.exports.findDuty = handleFind;
module.exports.deleteDuty = handleDelete;
module.exports.updateDuty = updateDuty;
