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
        "name":"hagnash",
        "location":"soosia",
        "constraints":"none",
        "soldiersRequired":"2",
        "value":"10"
    }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("One or more fields is invalid");
          done();
        }
      }
    })

    it("Should be able to return correct respone when the duty has been added to the database", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", serverUrl);
      Http.send(JSON.stringify({
        "name":"hagnash",
        "location":"soosia",
        "days":"7",
        "constraints":"none",
        "soldiersRequired":"2",
        "value":"10"
    }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          MongoClient.connect(DBurl, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection('Duties')
            collection.deleteOne({
              "name":"hagnash",
              "location":"soosia",
              "days":"7",
              "constraints":"none",
              "soldiersRequired":"2",
              "value":"10"
            }, (deleteError) => {
              client.close();
              expect(Http.responseText).to.eql('');
              done();
            })
          });
        }
      }
    })
  });
});