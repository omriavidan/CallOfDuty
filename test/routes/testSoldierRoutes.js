const expect = require('chai').expect;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'myproject';
const solId = "tt8145643";
const solName = "lior";
const rank = "kama";
const limitations = ["yeshiva"]
const standartSol = JSON.stringify({
  "id": solId,
  "name": solName,
  "rank": rank,
  "limitations": limitations
})
const url = 'http://localhost:3000/soldiers';

describe("Soldiers tests", function () {
  before("Initialaizing db", done => {
    MongoClient.connect(dbUrl, function (dbConnectErr, client) {
      if (dbConnectErr) return done(dbConnectErr);
      testServer.dbClient = client;
      testServer.collection = client.db(dbName).collection('Soldiers')
      done();
    });

  });

  afterEach("db cleaning", done => {
    testServer.collection.deleteMany({}, (deleteError) => {
      if (deleteError) return done(deleteError);
      done();
    })
  });

  after("Closing the server", done => {
    testServer.close();
    testServer.dbClient.close();
    done();
  });

  function testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, soldierToSearch, done) {
    const Http = new XMLHttpRequest();
    Http.open(httpMethod, url + urlAddon);
    Http.send(testData);
    Http.onreadystatechange = (connectErr) => {
      if (connectErr) return done(connectErr);
      if (Http.readyState == 4 && Http.status == httpStatus) {
        if (testFunc) {
          testFunc(soldierToSearch, (testFuncErr, res) => {
            if (testFuncErr) return done(testFuncErr)
            if (res) expectedResults = res
            expect(Http.responseText).to.eql(expectedResults);
            return done();
          })
        } else {
          expect(Http.responseText).to.eql(expectedResults);
          return done();
        }
      }
    }
  }

  describe("Soldiers post test", function () {
    it("Should return an error message when the soldier data is missing fields", function (done) {
      httpMethod = "POST", expectedResults = "One or more fields are invalid"
      testData = JSON.stringify({
        "id": solId,
        "name": solName,
        "limitations": limitations
      })
      httpStatus = 404, testFunc = null, urlAddon = "", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })

    it("Should return an empty response when the soldier has been added to the database", function (done) {
      httpMethod = "POST", expectedResults = '', testData = standartSol
      httpStatus = 200, testFunc = null, urlAddon = "", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })

    it("Should return error message when the soldier data has extra fields", function (done) {
      httpMethod = "POST", expectedResults = "One or more fields are invalid",
        testData = JSON.stringify({
          "id": solId,
          "name": solName,
          "stam": "lol",
          "limitations": limitations
        })
      httpStatus = 404, testFunc = null, urlAddon = "", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })
  });
});
