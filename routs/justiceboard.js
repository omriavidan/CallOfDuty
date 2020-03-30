const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async = require('async');

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

function getSoldiersDb(db, doneS) {
  const collection = db.collection('Soldiers')
  collection.find({}).toArray(function (err, docs) {
    assert.equal(err, null);
    doneS(err, docs);
  });
}

function calcDutiesScore(db, duties, doneGet) {
  const collection = db.collection('Duties')
  let dutyToSearch = {};
  let sum = 0;
  async.forEachOf(duties, (duty, key, doneDuty) => {
    dutyToSearch["_id"] = duty;
    collection.find(dutyToSearch).toArray(function (err, docs) {
      assert.equal(err, null);
      docs = docs[0];
      sum += Number(docs.value);
      doneDuty(err);
    });
  }, (err) => {
    doneGet(err, sum.toString());
  })
}

function getJusticeBoard(done) {
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    getSoldiersDb(db, (err, soldiers) => {
      if (err) {
        done("No such database")
      }
      let justiceBoard = [];
      async.forEachOf(soldiers, (soldier, key, doneSol) => {
        calcDutiesScore(db, soldier.duties, (err, dutiesSum) => {
          justiceBoard.push({
            "id": soldier["id"],
            "score": dutiesSum
          });
          doneSol(err, dutiesSum);
        })
      }, err => {
        client.close();
        done(err, JSON.stringify(justiceBoard));
      })

    })
  });
}

module.exports.getJusticeBoard = getJusticeBoard;