const MongoClient = require('mongodb').MongoClient;
const async = require('async');

const url = 'mongodb://localhost:27017';
const dbName = 'myproject';

function getSoldiersDb(db, doneS) {
  const collection = db.collection('Soldiers')
  collection.find({}).toArray(function (err, docs) {
    if(err){
      doneS(err)
    } else {
    doneS(err, docs);
    }
  });
}

function calcDutiesScore(db, duties, done) {
  const collection = db.collection('Duties')
  let dutyToSearch = {};
  let sum = 0;
  async.forEachOf(duties, (duty, key, next) => {
    dutyToSearch["_id"] = duty;
    collection.find(dutyToSearch).toArray(function (findErr, docs) {
      if(findErr) return done(findErr)
      docs = docs[0];
      sum += Number(docs.value);
      next();
    });
  }, (err) => {
    done(err, sum.toString());
  })
}

function getJusticeBoard(req, done) {
  if (req != null) {
    const parsedUrlString = req.url.split("/");
    if (parsedUrlString.length >= 5) {
      done("invalid url request");
    }
  }
  MongoClient.connect(url, function (err, client) {
    if(err) return done(err)
    const db = client.db(dbName);
    getSoldiersDb(db, (err, soldiers) => {
      if (err) return done(err)
      let justiceBoard = [];
      async.forEachOf(soldiers, (soldier, key, next) => {
        calcDutiesScore(db, soldier.duties, (err, dutiesSum) => {
          justiceBoard.push({
            "id": soldier["id"],
            "score": dutiesSum
          });
          next(err, dutiesSum);
        })
      }, err => {
        client.close();
        done(err, JSON.stringify(justiceBoard));
      })
    })
  });
}

module.exports.getJusticeBoard = getJusticeBoard;
