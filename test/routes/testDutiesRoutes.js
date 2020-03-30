const expect = require('chai').expect;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;

const dbUrl = 'mongodb://localhost:27017';
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

  before("Initialaizing db", done => {
    MongoClient.connect(dbUrl, function (dbConnectErr, client) {
      if (dbConnectErr) return done(dbConnectErr);
      testServer.dbClient = client;
      testServer.collection = client.db(dbName).collection('Duties')
      testServer.solCollection = client.db(dbName).collection('Soldiers')
      done();
    });
  });

  afterEach("db cleaning", done => {
    testServer.collection.deleteMany({}, (deleteError) => {
      if (deleteError) return done(deleteError);
      testServer.solCollection.deleteMany({}, (deleteError) => {
        if (deleteError) return done(deleteError);
        done();
      })
    })
  });

  after("Closing the server", done => {
    testServer.close();
    testServer.dbClient.close();
    done();
  });
  
  function testsAssistant(httpMethod, expectedResults, actualResult, testData, httpStatus, testFunc, urlAddon, dutyToSearch, done) {
    const Http = new XMLHttpRequest();
    Http.open(httpMethod, url + urlAddon);
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

  describe("Duties post test", function () {
    it("Should be able to return correct respone when the duty's data is not valid", function (done) {
      httpMethod = "POST", expectedResults = "One or more fields are invalid", actualResult = null
      testData = (JSON.stringify({
        "name": "hagnash",
        "location": "soosia",
        "constraints": "none",
        "soldiersRequired": "2",
        "value": "10"
      }));
      httpStatus = 400, testFunc = null, urlAddon = "", dutyToSearch = {}
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
});
