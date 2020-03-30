const expect = require('chai').expect;
const assert = require('assert');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;
const DBurl = 'mongodb://localhost:27017';
const dbName = 'myproject';

describe("Duties tests", function () {
  const serverUrl = 'http://localhost:3000/duties';

  after("Closing the server", function (doneAfter) {
    testServer.close();
    doneAfter();
  });

  describe("Duties post test", function () {

    it("Should be able to return correct respone when the duty's data is not valid", function (done) {
      const Http = new XMLHttpRequest();
      const url = serverUrl;
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "name": "hagnash",
        "location": "soosia",
        "constraints": "none",
        "soldiersRequired": "2",
        "value": "10"
      }));
      Http.onreadystatechange = (stateErr) => {
        if (stateErr) {
          done(stateErr);
        } else {
          if (Http.readyState == 4 && Http.status == 200) {
            expect(Http.responseText).to.eql("One or more fields is invalid");
            done();
          }
        }
      }
    })

    it("Should be able to return correct respone when the duty has been added to the database", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", serverUrl);
      Http.send(JSON.stringify({
        "name": "hagnash",
        "location": "soosia",
        "days": "7",
        "constraints": "none",
        "soldiersRequired": "2",
        "value": "10"
      }));
      Http.onreadystatechange = (stateErr) => {
        if (stateErr) {
          done(stateErr);
        } else {
          if (Http.readyState == 4 && Http.status == 200) {
            MongoClient.connect(DBurl, function (err, client) {
              assert.equal(null, err);
              const db = client.db(dbName);
              const collection = db.collection('Duties')
              collection.deleteOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": "none",
                "soldiersRequired": "2",
                "value": "10"
              }, (deleteError) => {
                client.close();
                if (deleteError) {
                  done(deleteError)
                } else {
                  expect(Http.responseText).to.eql('');
                  done();
                }
              })
            });
          }
        }
      }
    })
  });

  describe("Duties get test", function () {

    it("Should be able to return correct respone when the duties path doesn't contain id", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", serverUrl);
      Http.send();
      Http.onreadystatechange = (stateErr) => {
        if (Http.readyState == 4 && Http.status == 200) {
          if (stateErr) {
            done(stateErr);
          } else {
            MongoClient.connect(DBurl, function (err, client) {
              assert.equal(null, err);
              const db = client.db(dbName);
              const collection = db.collection('Duties')
              collection.find({}).toArray(function (err, docs) {
                client.close();
                if (err) {
                  done(err);
                } else {
                  if (docs.length === 1) {
                    docs = docs[0];
                  }
                  expect(Http.responseText).to.eql(JSON.stringify(docs));
                  done();
                }
              });
            });
          }
        }
      }
    })

    it("Should be able to return correct respone when the duty's path contain specific duty id", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('Duties')
        collection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": "none",
          "soldiersRequired": "2",
          "value": "10"
        }, (err, docInserted) => {
          assert.equal(err, null);
          const Http = new XMLHttpRequest();
          Http.open("GET", serverUrl + "/" + (docInserted["insertedId"].toString()));
          Http.send();
          Http.onreadystatechange = (stateErr) => {
            if (stateErr) {
              done(stateErr);
            } else {
              if (Http.readyState == 4 && Http.status == 200) {
                let dutyToSearch = {};
                dutyToSearch["_id"] = docInserted["insertedId"];
                collection.find(
                  dutyToSearch
                ).toArray(function (err, docs) {
                  assert.equal(err, null);
                  if (docs.length === 1) {
                    docs = docs[0];
                  }
                  expect(Http.responseText).to.eql(JSON.stringify(docs));
                  collection.deleteOne({
                    "_id": docInserted["insertedId"]
                  }, (deleteError) => {
                    client.close();
                    if (deleteError) {
                      done(deleteError)
                    } else {
                      done();
                    }
                  })
                });
              }
            }
          }
        })
      });
    })

    it("Should be able to return correct respone when the duty path contains name", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('Duties')
        collection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": "none",
          "soldiersRequired": "2",
          "value": "10"
        }, (err, docInserted) => {
          assert.equal(err, null);
          const Http = new XMLHttpRequest();
          Http.open("GET", serverUrl + "?name=hagnash");
          Http.send();
          Http.onreadystatechange = (stateErr) => {
            if (stateErr) {
              done(stateErr);
            } else {
              if (Http.readyState == 4 && Http.status == 200) {
                let dutyToSearch = {};
                dutyToSearch["_id"] = docInserted["insertedId"];
                collection.find(
                  dutyToSearch
                ).toArray(function (err, docs) {
                  assert.equal(err, null);
                  if (docs.length === 1) {
                    docs = docs[0];
                  }
                  expect(Http.responseText).to.eql(JSON.stringify(docs));
                  collection.deleteOne({
                    "_id": docInserted["insertedId"]
                  }, (deleteError) => {
                    client.close();
                    if (deleteError) {
                      done(deleteError)
                    } else {
                      done();
                    }
                  })
                });
              }
            }
          }
        })
      });
    })

    it("Should be able to return correct respone when the duties path contains wrong id", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", serverUrl + "/45436456456");
      Http.send();
      Http.onreadystatechange = (stateErr) => {
        if (stateErr) {
          done(stateErr);
        } else {
          if (Http.readyState == 4 && Http.status == 200) {
            expect(Http.responseText).to.eql("invalid duty ID");
            done();
          }
        }
      }
    })
  });
});