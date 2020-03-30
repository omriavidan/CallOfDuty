const expect = require('chai').expect;
const assert = require('assert');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;
const DBurl = 'mongodb://localhost:27017';
const dbName = 'myproject';

describe("Soldiers tests", function () {
  const serverUrl = 'http://localhost:3000/soldiers';

  after("Closing the server", function (doneAfter) {
    testServer.close();
    doneAfter();
  });

  describe("Soldiers post test", function () {

    it("Should be able to return correct respone when the soldier data is missing fields", function (done) {
      const Http = new XMLHttpRequest();
      const url = serverUrl;
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "id": "tt8145643",
        "name": "lior",
        "limitations": ["yeshiva"]
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("One or more fields is invalid");
          done();
        }
      }
    })

    it("Should be able to return correct respone when the soldier has been added to the database", function (done) {
      const Http = new XMLHttpRequest();
      const url = 'http://localhost:3000/soldiers';
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "id": "tt8145643",
        "name": "lior",
        "rank": "segen",
        "limitations": ["yeshiva"]
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          MongoClient.connect(DBurl, function (err, client) {
            assert.equal(null, err);
            const db = client.db(dbName);
            const collection = db.collection('Soldiers')
            collection.deleteOne({
              "id": "tt8145643"
            }, (deleteError) => {
              client.close();
              expect(Http.responseText).to.eql('');
              done();
            })
          });
        }
      }
    })

    it("Should be able to return correct respone when the soldier data has extra fields", function (done) {
      const Http = new XMLHttpRequest();
      const url = serverUrl;
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "id": "tt8145643",
        "name": "lior",
        "stam": "lol",
        "limitations": ["yeshiva"]
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("One or more fields is invalid");
          done();
        }
      }
    })
  });
});