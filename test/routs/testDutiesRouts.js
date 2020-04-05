const expect = require('chai').expect;
const assert = require('assert');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const testServer = require("../../start.js").server;
const MongoClient = require('mongodb').MongoClient;
const async = require('async');
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

  describe("Duties delete test", function () {

    it("Should be able to return correct respone when trying to delete correct duty", function (done) {
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
          "value": "10",
          "soldiers": []
        }, (err, docInserted) => {
          assert.equal(err, null);
          const Http = new XMLHttpRequest();
          Http.open("DELETE", serverUrl + "/" + (docInserted["insertedId"].toString()));
          Http.send();
          Http.onreadystatechange = (stateErr) => {
            if (stateErr) {
              done(stateErr);
            } else {
              if (Http.readyState == 4 && Http.status == 200) {
                expect(Http.responseText).to.eql("");
                if (Http.responseText !== "") {
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
                } else {
                  client.close();
                  done();
                }
              }
            }
          }
        })
      });
    })

    it("Should be able to return correct respone when trying to delete non-existent duty", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("DELETE", serverUrl + "/435435");
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

  describe("Duties update test", function () {

    it("Should be able to return correct respone when trying to update correct duty", function (done) {
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
          "value": "10",
          "soldiers": []
        }, (err, docInserted) => {
          assert.equal(err, null);
          const Http = new XMLHttpRequest();
          Http.open("PATCH", serverUrl + "/" + (docInserted["insertedId"].toString()));
          Http.send(JSON.stringify({
            "location": "yair",
            "days": "4"
          }));
          Http.onreadystatechange = (stateErr) => {
            if (stateErr) {
              done(stateErr);
            } else {
              if (Http.readyState == 4 && Http.status == 200) {
                expect(Http.responseText).to.eql("");
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
              }
            }
          }
        })
      });
    })

    it("Should be able to return correct respone when trying to update with wrong fields", function (done) {
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
          "value": "10",
          "soldiers": []
        }, (err, docInserted) => {
          assert.equal(err, null);
          const Http = new XMLHttpRequest();
          Http.open("PATCH", serverUrl + "/" + (docInserted["insertedId"].toString()));
          Http.send(JSON.stringify({
            "location": "yair",
            "lol": "4"
          }));
          Http.onreadystatechange = (stateErr) => {
            if (stateErr) {
              done(stateErr);
            } else {
              if (Http.readyState == 4 && Http.status == 200) {
                expect(Http.responseText).to.eql("One or more fields is invalid");
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
              }
            }
          }
        })
      });
    })

    it("Should be able to return correct respone when trying to update a non-existent duty", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("PATCH", serverUrl + "/435435");
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

  describe("Duties scheduling test", function () {

    it("Should be able to return correct respone when trying to schedule a duty with 2 soldiers required and 2 soldiers in the database", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": [],
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }, (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  let arr = [];
                  arr.push(dutiesInserted.insertedId);
                  doneWf(null, dutiesInserted.insertedId);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertMany([{
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": []
              }, {
                "id": "tt8145647",
                "name": "guy",
                "rank": "kama",
                "limitations": ["yeshiva"],
                "duties": []
              }], (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    expect(Http.responseText).to.eql("Great success");
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
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })

    it("Should be able to return correct respone when trying to schedule a duty with 1 soldiers required and 2 soldier in the database", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": [],
                "soldiersRequired": "1",
                "value": "10",
                "soldiers": []
              }, (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  let arr = [];
                  arr.push(dutiesInserted.insertedId);
                  doneWf(null, dutiesInserted.insertedId);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertMany([{
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": []
              }, {
                "id": "tt8145647",
                "name": "guy",
                "rank": "kama",
                "limitations": ["yeshiva"],
                "duties": []
              }], (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    expect(Http.responseText).to.eql("Great success");
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
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })

    it("Should be able to return correct respone when trying to schedule a duty with 2 soldiers required and 1 soldier in the database", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": [],
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }, (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  let arr = [];
                  arr.push(dutiesInserted.insertedId);
                  doneWf(null, dutiesInserted.insertedId);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertOne({
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": []
              }, (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    expect(Http.responseText).to.eql("Great success");
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
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })

    it("Should be able to return correct respone when trying to schedule a duty no soldiers matching because of limitations", function (done) {
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
                "constraints": [],
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }, {
                "name": "anaf",
                "location": "mabat",
                "days": "1",
                "constraints": [],
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }], (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  doneWf(null, dutiesInserted.insertedIds[0]);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertMany([{
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": [data]
              }, {
                "id": "tt8145647",
                "name": "guy",
                "rank": "kama",
                "limitations": ["yeshiva"],
                "duties": []
              }], (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    let collection = db.collection('Soldiers')
                    collection.find({
                      "id": "tt8145647"
                    }).toArray(function (err, soldier) {
                      expect(soldier[0].duties.length).to.eql(1);
                      collection = db.collection('Duties')
                      collection.deleteMany({}, (deleteError) => {
                        if (deleteError) {
                          doneWf(deleteError)
                        }
                        collection = db.collection('Soldiers')
                        collection.deleteMany({}, (deleteError) => {
                          doneWf(deleteError);
                        })
                      })
                    });
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })

    it("Should be able to return correct respone when trying to schedule a duty with crossing limitations", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": ["amida"],
                "soldiersRequired": "2",
                "value": "10",
                "soldiers": []
              }, (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  doneWf(null, dutiesInserted.insertedId);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertOne({
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": []
              }, (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    let collection = db.collection('Soldiers')
                    collection.find({
                      "id": "tt8145643"
                    }).toArray(function (err, soldier) {
                      expect(soldier[0].duties.length).to.eql(0);
                      collection = db.collection('Duties')
                      collection.deleteMany({}, (deleteError) => {
                        if (deleteError) {
                          doneWf(deleteError)
                        }
                        collection = db.collection('Soldiers')
                        collection.deleteMany({}, (deleteError) => {
                          doneWf(deleteError);
                        })
                      })
                    });
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })

    it("Should not be able to schedule a duty that is already scheduled", function (done) {
      MongoClient.connect(DBurl, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        async.waterfall([
            function (doneWf) {
              let collection = db.collection('Duties')
              collection.insertOne({
                "name": "hagnash",
                "location": "soosia",
                "days": "7",
                "constraints": [],
                "soldiersRequired": "1",
                "value": "10",
                "soldiers": ["tt8145643"]
              }, (err, dutiesInserted) => {
                if (err) {
                  done(err)
                } else {
                  doneWf(null, dutiesInserted.insertedId);
                }
              });
            },
            function (data, doneWf) {
              let collection = db.collection('Soldiers')
              collection.insertMany([{
                "id": "tt8145643",
                "name": "lior",
                "rank": "segen",
                "limitations": ["amida"],
                "duties": [data]
              }, {
                "id": "tt8145647",
                "name": "guy",
                "rank": "kama",
                "limitations": ["yeshiva"],
                "duties": []
              }], (err) => {
                if (err) {
                  doneWf(err);
                } else {
                  doneWf(null, data);
                }
              });
            },
            function (data, doneWf) {
              const Http = new XMLHttpRequest();
              Http.open("PUT", serverUrl + "/" + data + "/schedule");
              Http.send();
              Http.onreadystatechange = (stateErr) => {
                if (stateErr) {
                  done(stateErr);
                } else {
                  if (Http.readyState == 4 && Http.status == 200) {
                    let collection = db.collection('Soldiers')
                    collection.find({
                      "id": "tt8145643"
                    }).toArray(function (err, soldierWithDuty) {
                      collection.find({
                        "id": "tt8145647"
                      }).toArray(function (err, soldierWithoutDuty) {
                        expect(soldierWithDuty[0].duties.length + soldierWithoutDuty[0].duties.length).to.eql(1);
                        collection = db.collection('Duties')
                        collection.deleteMany({}, (deleteError) => {
                          if (deleteError) {
                            doneWf(deleteError)
                          }
                          collection = db.collection('Soldiers')
                          collection.deleteMany({}, (deleteError) => {
                            doneWf(deleteError);
                          })
                        })
                      });
                    });
                  }
                }
              }
            }
          ],
          function (err) {
            client.close();
            done(err);
          });
      });
    })
  });
});