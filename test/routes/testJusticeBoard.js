const expect = require('chai').expect;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;
const async = require('async');

const DBurl = 'mongodb://localhost:27017';
const dbName = 'myproject';
const standardDuty_1 = {
  "name": "hagnash",
  "location": "soosia",
  "days": "7",
  "constraints": "none",
  "soldiersRequired": "2",
  "value": "10",
  "soldiers": []
}
const standardDuty_2 = {
  "name": "anaf",
  "location": "mabat",
  "days": "1",
  "constraints": "none",
  "soldiersRequired": "2",
  "value": "10",
  "soldiers": []
}
const standatdSol_1 = {
  "id": "tt8145643",
  "name": "lior",
  "rank": "segen",
  "limitations": ["amida"],
  "duties": []
}
const standatdSol_2 = {
  "id": "tt8145647",
  "name": "guy",
  "rank": "kama",
  "limitations": ["yeshiva"],
  "duties": []
}

describe("JusticeBoard tests", function () {
  const url = 'http://localhost:3000/justiceBoard';

  before("Initialaizing db", function (done) {
    MongoClient.connect(DBurl, function (dbConnectErr, client) {
      if (dbConnectErr) return done(dbConnectErr);
      testServer.dbClient = client;
      testServer.collection = client.db(dbName).collection('Duties')
      testServer.solCollection = client.db(dbName).collection('Soldiers')
      done();
    });
  });

  afterEach("db cleaning", function (done) {
    testServer.collection.deleteMany({}, (deleteError) => {
      if (deleteError) return done(deleteError);
      testServer.solCollection.deleteMany({}, (deleteError) => {
        if (deleteError) return done(deleteError);
        done();
      })
    })
  });

  after("Closing the server", function (done) {
    testServer.close();
    testServer.dbClient.close();
    done();
  });

  function testsAssistant(httpMethode, expectedResults, actualResult, testData, httpStatus, testFunc, urlAddon, dutyToSearch, done) {
    const Http = new XMLHttpRequest();
    Http.open(httpMethode, url + urlAddon);
    Http.send(testData);
    Http.onreadystatechange = (connectErr) => {
      if (connectErr) return done(connectErr);
      if (Http.readyState == 4 && Http.status == httpStatus) {
        if (actualResult === null) actualResult = Http.responseText
        if (testFunc) {
          testFunc(dutyToSearch, (res) => {
            res ? expectedResults = res : res
            expect(actualResult).to.eql(res);
            return done();
          })
        } else {
          expect(actualResult).to.eql(expectedResults);
          return done();
        }
      }
    }
  }

  describe("justice Board get test", function () {
    it("Should be able to return correct respone when trying to get justice Board", function (done) {
      async.series([
          function (next) {
            testServer.collection.insertMany([standardDuty_1, standardDuty_2], (insertErr, dutiesInserted) => {
              next(insertErr);
            });
          },
          function (next) {
            testServer.solCollection.insertMany([standatdSol_1, standatdSol_2], (insertErr, dutiesInserted) => {
              next(insertErr);
            });
          },
          function (next) {
            httpMethode = "GET", expectedResults = '[{"id":"tt8145643","score":"0"},{"id":"tt8145647","score":"0"}]', actualResult = null, testData = null
            httpStatus = 200, testFunc = null, urlAddon = "", dutyToSearch = null
            testsAssistant(httpMethode, expectedResults, actualResult, testData, httpStatus,
              testFunc, urlAddon, dutyToSearch, next)
          }
        ],
        function (err) {
          done(err);
        });
    })

    it("Should be able to return correct respone when trying to get justice Board with no soldiers", function (done) {
      httpMethode = "GET", expectedResults = '[]', actualResult = null, testData = null
      httpStatus = 200, testFunc = null, urlAddon = "", dutyToSearch = null
      testsAssistant(httpMethode, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })
  });
});
