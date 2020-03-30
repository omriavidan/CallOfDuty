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
      if(deleteError) return done(deleteError);
      done();
    })
  });

  after("Closing the server", done => {
    testServer.close();
    testServer.dbClient.close();
    done();
  });

  function findRecord(soldierToSearch, done) {
    testServer.collection.find(soldierToSearch).toArray(function (findErr, docs) {
      if(findErr) return done(findErr, null);
      (docs.length === 1) ? docs = docs[0]: docs
      done(null, JSON.stringify(docs));
    });
  }

  function testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, soldierToSearch, done) {
    const Http = new XMLHttpRequest();
    Http.open(httpMethod, url + urlAddon);
    Http.send(testData);
    Http.onreadystatechange = (connectErr) => {
      if(connectErr) return done(connectErr);
      if (Http.readyState == 4 && Http.status == httpStatus) {
        if (testFunc) {
          testFunc(soldierToSearch, (testFuncErr, res) => {
            if(testFuncErr) return done(testFuncErr)
            if(res) expectedResults = res
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
      httpStatus = 400, testFunc = null, urlAddon = "", solToSearch = {}
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
      httpStatus = 400, testFunc = null, urlAddon = "", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })
  });

  describe("Soldiers get test", function () {
    it("Should return all of the soldiers when the soldier path doesn't contain id or name", function (done) {
      httpMethod = "GET", expectedResults = null, testData = null
      httpStatus = 200, testFunc = findRecord, urlAddon = "", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })

    it("Should return the soldier when the soldier path contain the soldier id", function (done) {
      httpMethod = "GET", expectedResults = null, testData = null
      httpStatus = 200, testFunc = findRecord, urlAddon = "/" + solId, solToSearch = {"id" : solId}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })

    it("Should return the soldier when the soldier path contains name", function (done) {
      httpMethod = "GET", expectedResults = null, testData = null
      httpStatus = 200, testFunc = findRecord, urlAddon = "/" + solId, solToSearch = {"name" : solName}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })

    it("Should return an empty array when the soldier path contains wrong data", function (done) {
      httpMethod = "GET", expectedResults = '[]', testData = null
      httpStatus = 200, testFunc = null, urlAddon = "/tt8145644", solToSearch = {}
      testsAssistant(httpMethod, expectedResults, testData, httpStatus, testFunc, urlAddon, solToSearch, done)
    })
  });
});
