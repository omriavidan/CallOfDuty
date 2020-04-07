const expect = require('chai').expect;
const assert = require('assert');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;
const async = require('async');
const DBurl = 'mongodb://localhost:27017';
const dbName = 'myproject';

describe("JusticeBoard tests", function () {
  const serverUrl = 'http://localhost:3000/justiceBoard';

  after("Closing the server", function (doneAfter) {
    testServer.close();
    doneAfter();
  });

  describe("justice Board get test", function () {

    it.only("Should be able to return correct respone when trying to get justice Board", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertMany([{
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": "none",
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }, {
                "name": "anaf",
                "location": "mabat",
                "days": "1",
                "constraints": "none",
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }], (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  let arr = [];
                  arr.push(dutiesInserted.insertedIds);
                  doneWf(null, arr);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertMany([{
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": "amida",
                "duties": []
              }, {
                "id": "tt8145647",
                "name": "guy",
                "rank": "kama",
                "limitations": "yeshiva",
                "duties": []
              }], (err, soldiersInserted) => {
                if (err) {
                  doneWf(err);
                } else {
                  data.push(soldiersInserted.insertedIds);
                  doneWf(null);
                }
              });
            },
            function (doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("GET", serverUrl);
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    expect(Http.responseText).to.eql('[{"id":"tt8145643","score":"0"},{"id":"tt8145647","score":"0"}]');
                    if (Http.responseText !== "") {
                      let collection = db.collection('Duties')
                      collection.deleteMany({}, (deleteError) => {
                        if (deleteError) {
                          doneWf(deleteError)
                        }
                        let collection = db.collection('Soldiers')
                        collection.deleteMany({}, (deleteError) => {
                          doneWf(deleteError);
                        })
                      })
                    } else {
                      doneWf(err);
                    }
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            if (err) {
              done();
            } else {
              done(err);
            }
          });
      });
    })

    it.only("Should be able to return correct respone when trying to get justice Board with no soldiers", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", serverUrl);
      Http.send();
      Http.onreadystatechange = (stateErr) => {
        if (stateErr) {
          done(stateErr);
        } else {
          if (Http.readyState == 4 && Http.status == 200) {
            expect(Http.responseText).to.eql('[]');
            done();
          }
        }
      }
    })
  });
});