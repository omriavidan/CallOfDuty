const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
<<<<<<< HEAD
const ObjectId = require('mongodb').ObjectID
=======
>>>>>>> 3d04f2a... Implemented duties delete
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

function handleFind(dutyId, dutyName, done) {
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
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
    collection.find(dutyToSearch).toArray(function (err, docs) {
      assert.equal(err, null);
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
    assert.equal(null, err);
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
    collection.find(dutyToSearch).toArray(function (err, record) {
      assert.equal(err, null);
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

module.exports.insertDuty = handleInsertion;
module.exports.findDuty = handleFind;
<<<<<<< HEAD
=======
module.exports.deleteDuty = handleDelete;
>>>>>>> 3d04f2a... Implemented duties delete
