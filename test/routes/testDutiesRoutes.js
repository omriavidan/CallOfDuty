const expect = require('chai').expect;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;

const DBurl = 'mongodb://localhost:27017';
const dbName = 'myproject';
const dutyName = "hagnash";
const dutyLocation = "soosia";
const dutyDays = "7";
const dutyConstraints = []
const soldiersRequired = "2";
const dutyValue = "10";
const standardDuty = {
  "name": dutyName,
  "location": dutyLocation,
  "days": dutyDays,
  "constraints": dutyConstraints,
  "soldiersRequired": soldiersRequired,
  "value": dutyValue,
  "soldiers": []
}
const url = 'http://localhost:3000/duties';

describe("Duties tests", function () {

  before("Initialaizing db", doneBefore => {
    MongoClient.connect(DBurl, function (dbConnectErr, client) {
      if (dbConnectErr) return doneBefore(dbConnectErr);
      testServer.dbClient = client;
      testServer.collection = client.db(dbName).collection('Duties')
      testServer.solCollection = client.db(dbName).collection('Soldiers')
      doneBefore();
    });
  });

  afterEach("db cleaning", doneAfterEach => {
    testServer.collection.deleteMany({}, (deleteError) => {
      if (deleteError) return doneAfterEach(deleteError);
      testServer.solCollection.deleteMany({}, (deleteError) => {
        if (deleteError) return doneAfterEach(deleteError);
        doneAfterEach();
      })
    })
  });

  after("Closing the server", doneAfter => {
    testServer.close();
    testServer.dbClient.close();
    doneAfter();
  });

  function countRecords(dutyToCount, countRecordsDone) {
    testServer.collection.count(dutyToCount, (countErr, numOfRecords) => {
      if (countErr) return countRecordsDone(countErr)
      return countRecordsDone(numOfRecords);
    })
  }

  function findRecord(dutyToSearch, testFuncDone) {
    testServer.collection.find(dutyToSearch).toArray(function (findErr, docs) {
      if (findErr) return testFuncDone(findErr);
      (docs.length === 1) ? docs = docs[0]: docs
      testFuncDone(JSON.stringify(docs));
    });
  }

  function testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus, testFunc, urlAddon, dutyToSearch, tadone) {
    const Http = new XMLHttpRequest();
    Http.open(httpMethod, url + urlAddon);
    Http.send(testData);
    Http.onreadystatechange = (connectErr) => {
      if (connectErr) return tadone(connectErr);
      if (Http.readyState == 4 && Http.status == httpStatus) {
        if (actualResult === null) actualResult = Http.responseText
        if (testFunc) {
          testFunc(dutyToSearch, (res) => {
            res ? expectedResults = res : res
            expect(actualResult).to.eql(res);
            return tadone();
          })
        } else {
          expect(actualResult).to.eql(expectedResults);
          return tadone();
        }
      }
    }
  }

  describe("Duties post test", function () {

    it("Should be able to return correct respone when the duty's data is not valid", function (done) {
      httpMethod = "POST", expectedResults = "One or more fields is invalid", actualResult = null
      testData = (JSON.stringify({
        "name": "hagnash",
        "location": "soosia",
        "constraints": "none",
        "soldiersRequired": "2",
        "value": "10"
      }));
      httpStatus = 404, testFunc = null, urlAddon = "", dutyToSearch = {}
      testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })

    it("Should be able to return correct respone when the duty has been added to the database", function (done) {
      httpMethod = "POST", expectedResults = '', actualResult = null
      testData = JSON.stringify(standardDuty)
      httpStatus = 200, testFunc = null, urlAddon = "", dutyToSearch = {}
      testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })
  });

  describe("Duties get test", function () {

    it("Should be able to return correct respone when the duties path doesn't contain id", function (done) {
      httpMethod = "GET", expectedResults = null, actualResult = null, testData = null
      httpStatus = 200, testFunc = findRecord, urlAddon = "", dutyToSearch = {}
      testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })

    it("Should be able to return correct respone when the duty's path contain specific duty id", function (done) {
      testServer.collection.insertOne(standardDuty, (insertErr, docInserted) => {
        if (insertErr) return done(insertErr);
        httpMethod = "GET", expectedResults = null, actualResult, testData = null
        httpStatus = 200, testFunc = findRecord, urlAddon = "/" + (docInserted["insertedId"].toString())
        dutyToSearch = {
          "_id": docInserted["insertedId"]
        }
        testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
          testFunc, urlAddon, dutyToSearch, done)
      })
    });

    it("Should be able to return correct respone when the duty path contains name", function (done) {
      testServer.collection.insertOne(standardDuty, (insertErr, docInserted) => {
        if (insertErr) return done(insertErr);
        httpMethod = "GET", expectedResults = null, actualResult = null, testData = null
        httpStatus = 200, testFunc = findRecord, urlAddon = "?name=hagnash"
        dutyToSearch = {
          "_id": docInserted["insertedId"]
        }
        testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
          testFunc, urlAddon, dutyToSearch, done)
      })
    })

    it("Should be able to return correct respone when the duties path contains wrong id", function (done) {
      httpMethod = "GET", expectedResults = "invalid duty ID", actualResult = null
      testData = JSON.stringify(standardDuty)
      httpStatus = 404, testFunc = null, urlAddon = "/45436456456", dutyToSearch = {}
      testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })
  });

  describe("Duties delete test", function () {
    it("Should delete the inserted duty from the database", function (done) {
      testServer.collection.insertOne(standardDuty, (insertErr, docInserted) => {
        if (insertErr) return done(insertErr);
        httpMethod = "DELETE", expectedResults = null, actualResult = 0, testData = null
        httpStatus = 200, testFunc = countRecords, urlAddon = "/" + (docInserted["insertedId"].toString())
        dutyToSearch = {}
        testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
          testFunc, urlAddon, dutyToSearch, done)
      })
    })

    it("Should be able to return correct respone when trying to delete non-existent duty", function (done) {
      httpMethod = "DELETE", expectedResults = "invalid duty ID", actualResult = null, testData = null
      httpStatus = 404, testFunc = null, urlAddon = "/435435", dutyToSearch = {}
      testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus,
        testFunc, urlAddon, dutyToSearch, done)
    })
  });
});
