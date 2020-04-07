const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID
const assert = require('assert');
const url = 'mongodb://localhost:27017';
const dbName = 'myproject';
const jb = require('../routs/justiceboard.js');
const async = require('async');

function checkData(dutiesData) {
  if (!(dutiesData["name"] && dutiesData["location"] && dutiesData["days"] && dutiesData["constraints"] && dutiesData["soldiersRequired"] && dutiesData["value"])) {
    return false;
  }
  return true;
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
    }
    if (dutyName) {
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
        collection.deleteOne({
          "_id": ObjectId(dutyId)
        }, (deleteError) => {
          client.close();
          done(deleteError);
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
    done("One or more fields is invalid");
  } else {
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
          collection.updateOne(dutyToSearch, {
            $set: dataToUpdate
          }, function (err, result) {
            assert.equal(err, null);
            assert.equal(1, result.result.n);
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

function scheduleDuty(dutyId, done) {
  jb.getJusticeBoard((err, jBoard) => {
    if (err) {
      done(err);
    } else {
      const json = JSON.parse(jBoard)
      jBoard = Object.keys(json).map(function (key) {
          return json[key];
        })
        .sort(function (a, b) {
          return a.score > b.score;
        });
      jBoard = Object.assign([], jBoard);
      MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        const dutyCollection = db.collection('Duties');
        const solCollection = db.collection('Soldiers');
        dutyCollection.find({
          "_id": ObjectId(dutyId)
        }).toArray(function (err, duty) {
          assert.equal(err, null);
          duty = duty[0];
          let numSolToSchedule = Number(duty["soldiersRequired"]) - duty["soldiers"].length;
          async.forEachOf(jBoard, (soldier, key, doneSol) => {
            solCollection.find({
              "id": soldier["id"]
            }).toArray(function (err, sol) {
              sol = sol[0];
              if (!(numSolToSchedule <= 0 || (sol.limitations.some(r => duty.constraints.includes(r))))) {
                numSolToSchedule -= 1;
                solCollection.updateOne({
                  "id": soldier["id"]
                }, {
                  $push: {
                    "duties": duty["_id"]
                  }
                }, function (err, result) {
                  assert.equal(err, null);
                  assert.equal(1, result.result.n);
                  dutyCollection.updateOne({
                    "_id": ObjectId(dutyId)
                  }, {
                    $push: {
                      "soldiers": soldier["id"]
                    }
                  }, function (err, result) {
                    assert.equal(err, null);
                    assert.equal(1, result.result.n);
                    doneSol();
                  });
                });
              } else {
                doneSol();
              }
            })
          }, err => {
            client.close();
            if (err) {
              done(err);
            } else {
              done(null, "Great success");
            }
          })
        });
      })
    }
  })
}

module.exports.scheduleDuty = scheduleDuty;
module.exports.insertDuty = handleInsertion;
module.exports.findDuty = handleFind;
module.exports.deleteDuty = handleDelete;
module.exports.updateDuty = updateDuty;