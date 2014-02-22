/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/10/14.
 *
 */

var chai = require('chai'),
    should = require('chai').should(),
//change the config appropriately for your database
    slicks_postgres = require('../dist/slicks-postgres')({
        host: 'localhost',
        user: 'tester',
        database: 'todo',
        password: 'tester'
//        ,
//        debug_db: true
    }),
    db = null;

describe('#Slicks-PostgreSQL', function () {

    before(function (done) {
        slicks_postgres.connect(function (err, _db) {
            if (err) {
                throw err;
            }
            db = _db;
            done();
        })
    });

    after(function () {
        db.destroy();
    });

    describe('#Delete with "delete"', function () {
        it('Should delete all records in "task_owners" table without error', function (done) {
            db.delete('task_owners', function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });

    describe('#Delete with "delete"', function () {
        it('Should delete all record from "todu" table without error', function (done) {
            db.delete('todu', function (err, res) {
                if (err) {
                    throw err;
                }
                done();
            });
        });
    });
    describe('#Insert with "insert" ', function () {
        it('Should insert into "task_owners" table without error and return insert id that equals 1', function (done) {
            db.insert('task_owners', {id: 1, name: 'Test owner'}, function (err, res) {
                if (err) {
                    throw err;
                }
                res.id.should.equal(1);
                done();
            });
        });
    });

    describe('#Insert with "insert" ', function () {
        it('Should insert into "todu" table without error and return insert id that equals 1', function (done) {
            db.insert('todu', {id: 1, task: 'Do dishes', task_owner: 1}, function (err, res) {
                if (err) {
                    throw err;
                }
                res.id.should.equal(1);
                done();
            });
        });
    });

    describe('#Insert multiple with "query"', function () {
        it('Should insert multiple records into "todu" table with "query" without error', function (done) {
            var q = "insert into todu (id, task, task_owner) values (2,'Vacuum the floor',1),(3, 'Iron my shirt', 1)";
            db.query(q, function (err, res) {
                if (err) {
                    throw err;
                }

                done();
            });
        });
    });

    describe('#Fetch records', function () {
        it('Should retrieve all records in "todu"  table with "fetch" without error, records length should be 3', function (done) {
            db.fetch('todu', function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.should.have.length(3);
                done();
            });
        });
    });


    describe('#Query records with "query"', function () {
        it('Should retrieve all records in "todu"  table with "query" without error, records length should be 3', function (done) {
            var q = "select * from todu";
            db.query(q, function (err, rows) {
                if (err) {
                    throw err;
                }
                rows.should.have.length(3);
                done();
            });
        });
    });


    describe('#GreaterThan clause', function () {
        it('Should retrieve all records with id greater than 1 in "todu"  table with "where >" without error, records length should be 2', function (done) {
            db.where('id >', 1)
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);
                    done();
                });
        });
    });

    describe('#GreaterThanOrEquals clause', function () {
        it('Should retrieve all records with id greater than  or equals 1 in "todu"  table with "where >=" without error, records length should be 3', function (done) {
            db.where('id >=', 1)
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);
                    done();
                });
        });
    });


    describe('#LessThan clause', function () {
        it('Should retrieve all records with id less than 2 in "todu"  table with "where <" without error, records length should be 1', function (done) {
            db.where('id <', 2)
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);
                    done();
                });
        });
    });

    describe('#LessThanOrEquals clause', function () {
        it('Should retrieve all records with id less than  or equals 2 in "todu"  table with "where <=" without error, records length should be 2', function (done) {
            db.where('id <=', 2)
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);
                    done();
                });
        });
    });

    describe('#Limit clause', function () {
        it('Should retrieve ONLY 2 records in "todu"  table with "limit" of 2 without error, records length should be 2', function (done) {
            db.limit(2)
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);
                    done();
                });
        });
    });

    describe('#OrderBy DESC clause', function () {
        it('Should retrieve ALL records in "todu"  table with "orderby" of "desc" without error, records length should be 3, first record id should be 3', function (done) {
            db.orderBy('id', 'desc')
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);
                    rows[0].id.should.equal(3);
                    done();
                });
        });
    });

    describe('#OrderBy ASC clause', function () {
        it('Should retrieve ALL records in "todu"  table with "orderby" of "asc"  without error, records length should be 3, first record id should be 1', function (done) {
            db.orderBy('id', 'asc')
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);
                    rows[0].id.should.equal(1);
                    done();
                });
        });
    });

    describe('#OrderBy clause', function () {
        it('Should retrieve ALL records in "todu"  table with just "orderby"  without error, records length should be 3, first record id should be 1', function (done) {
            db.orderBy('id')
                .fetch('todu', function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);
                    rows[0].id.should.equal(1);
                    done();
                });
        });
    });

    describe('#Select fields', function () {
        it('Should retrieve ONLY "id" and "task" from all records in "todu"  table with "select" without error, field "task_owner" should be undefined in any records', function (done) {
            db.select('id, task')
                .from('todu')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    var a_rec = rows[0];
                    chai.expect(a_rec.task_owner).to.be.undefined;
                    done();
                });
        });
    });

    describe('#Where clause', function () {
        it('Should retrieve ONLY ONE record, from  "todu"  table, record id should equal 2', function (done) {
            db.select('id, task')
                .from('todu')
                .where('id', 2)
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);
                    var rec = rows[0];
                    rec.id.should.equal(2);
                    done();
                });
        });
    });

    describe('#WhereIn clause', function () {
        it('Should retrieve all records with ids 1 and 3 from  "todu"  table, record length should equal 2', function (done) {
            db.select('todu.*')
                .from('todu')
                .whereIn('id', "1,3")
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);

                    done();
                });
        });
    });

    describe('#OrWhereIn clause', function () {
        it('Should retrieve all records with ids 1, 2 and 3 from  "todu"  table, record length should equal 3', function (done) {
            db.select('todu.*')
                .from('todu')
                .where('id', 2)
                .orWhereIn('id', "1,3")
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);

                    done();
                });
        });
    });

    describe('#WhereNotIn clause', function () {
        it('Should retrieve all records with ids not amongst 1, 2 and 3 from  "todu"  table, record length should equal 0', function (done) {
            db.select('todu.*')
                .from('todu')
                .whereNotIn('id', "1,2,3")
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(0);

                    done();
                });
        });
    });

    describe('#OrWhereNotIn clause', function () {
        it('Should retrieve all records with ids 2 or ids not amongst 1 and 3 from  "todu"  table, record length should equal 1', function (done) {
            db.select('todu.*')
                .from('todu')
                .where('id', 2)
                .orWhereNotIn('id', "1,3")
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);

                    done();
                });
        });
    });

    describe('#Like clause', function () {
        it('Should retrieve all records with task like "Vacuum" from  "todu"  table, record length should equal 1', function (done) {
            db.select('todu.*')
                .from('todu')
                .like('task', 'vacuum', 'b')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);

                    done();
                });
        });
    });

    describe('#OrLike clause', function () {
        it('Should retrieve all records with task like "Vacuum"  or with task like "iron" from  "todu"  table, record length should equal 2', function (done) {
            db.select('todu.*')
                .from('todu')
                .like('task', 'vacuum', 'b')
                .orLike('task', 'iron', 'b')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);

                    done();
                });
        });
    });

    describe('#NotLike clause', function () {
        it('Should retrieve all records with task not like "Vacuum" from  "todu"  table, record length should equal 2', function (done) {
            db.select('todu.*')
                .from('todu')
                .notLike('task', 'vacuum', 'b')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);

                    done();
                });
        });
    });

    describe('#OrNotLike clause', function () {
        it('Should retrieve all records with task not like "Vacuum" or task not like "Vacuum" from  "todu"  table, record length should equal 2', function (done) {
            db.select('todu.*')
                .from('todu')
                .where('id', 2)
                .orNotLike('task', 'dishes', 'b')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);

                    done();
                });
        });
    });

    describe('#Join clause', function () {

        it('Should retrieve all records(with ALL fields from todu and the "name" field from task_owners tables) by using "join", record length should equal 3 and field "name" should be defined', function (done) {

            db.select('t.*, o.name')
                .from('todu t')
                .join('task_owners o', 't.task_owner = o.id', 'left')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(3);
                    var a_rec = rows[0];
                    chai.expect(a_rec.name).to.be.defined;

                    done();
                });

        });
    });


    describe('#GroupBy clause(Aggregate)', function () {

        it('Should retrieve a single record containing the "name" from "task_owners" table and "tasks" as "todu" counts  from "todu" table for the specific task_owner"  by using "groupby", record length should equal 1 and fields "name"  and "tasks" should be defined', function (done) {

            db.select('o.name, count(*) tasks')
                .from('task_owners o')
                .join('todu t', 't.task_owner = o.id', 'left')
                .groupBy('o.name')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);
                    var a_rec = rows[0];
                    chai.expect(a_rec.tasks).to.be.defined;
                    chai.expect(a_rec.name).to.be.defined;

                    done();
                });

        });
    });


    describe('#Having clause( with Aggregate)', function () {

        it('Should retrieve a single record containing the "name" from "task_owners" table and "tasks" as "todu" counts  from "todu" table with record having "task" greater than 2, record length should equal 1 and fields "name"  and "tasks" should be defined', function (done) {

            db.select('o.name, count(*) tasks')
                .from('task_owners o')
                .join('todu t', 't.task_owner = o.id', 'left')
                .groupBy('o.name')
                .having('count(*) >', 2)
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);
                    var a_rec = rows[0];
                    chai.expect(a_rec.tasks).to.be.defined;
                    chai.expect(a_rec.name).to.be.defined;

                    done();
                });

        });
    });

    describe('#OrHaving clause( with Aggregate)', function () {

        it('Should retrieve a single record containing the "name" from "task_owners" table and "tasks" as "todu" counts  from "todu" table with record having "tasks" greater than 2 or having "tasks" equals 3, record length should equal 1 and fields "name"  and "tasks" should be defined', function (done) {

            db.select('o.name, count(*) tasks')
                .from('task_owners o')
                .join('todu t', 't.task_owner = o.id', 'left')
                .groupBy('o.name')
                .having('count(*) >', 2)
                .orHaving('count(*)', 3)
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(1);
                    var a_rec = rows[0];
                    chai.expect(a_rec.tasks).to.be.defined;
                    chai.expect(a_rec.name).to.be.defined;

                    done();
                });

        });
    });


    describe('#Update ', function () {
        it('Should update "todu" table. Should return 2 as number of affectedRows', function (done) {

            db.set('task', 'Updated Todo')
                .whereIn('id', '1,3')
                .update('todu', function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.affectedRows.should.equal(2);

                    done();
                });
        });
    });

    describe('#Distinct ', function () {
        it('Should return 1 as record length', function (done) {

            db.select('task')
                .distinct()
                .from('todu')
                .fetch(function (err, rows) {
                    if (err) {
                        throw err;
                    }
                    rows.should.have.length(2);

                    done();
                });
        });
    });

    describe('#Delete ', function () {
        it('Should delete from "todu" table and return 1 as number of affectedRows', function (done) {

            db.where('id', 2)
            .delete('todu', function (err, res) {
                    if (err) {
                        throw err;
                    }
                    res.affectedRows.should.equal(1);

                    done();
                });

        });
    });


});


//slicks_postgres.connect(function (err, db) {
//    if (err) {
//        throw err;
//    }
//    console.log('connected to db!');
//    try {
//        db.select('o.name, count(*) tasks')
//            .from('task_owners o')
//            .join('todu t', 't.task_owner = o.id', 'left')
//            .groupBy('o.name')
//            .having('tasks >', 2)
//            .orHaving('tasks', 4)
//            .fetch(function (err, rows) {
//                if (err) {
//                    console.log('Error: ' + err.message);
//                    return;
//                }
//                console.log(rows);
//            });
//        db.select('o.name, count(*) tasks')
//            .from('task_owners o')
//            .join('todu t','t.task_owner = o.id','left')
//            .groupBy('o.name')
//            .having('tasks >',2)
//            .orHaving('tasks', 4)
//            .fetch(function(err, rows){
//                console.log(rows);
//                db.destroy();
//            });
//
//        db.where('id', 5).delete('todu', function (err, r) {
//            console.log(r);
//            db.destroy();
//        });
//
//
//        db.select('t.*, o.name')
//            .from('todu t')
//            .join('task_owners o', 't.task_owner = o.id', 'left')
//            .whereIn('o.id', '6,7,9')
//            .orderBy('t.created_date', 'desc')
//            .fetch(function (rows) {
//                console.log(rows);
//            });
//
//        for (var i = 0; i < 10; ++i) {
//            db.insert('task_owners', {name: 'Task Owner' + (i + 1)}, function (r) {
//                db.insert('todu', {task: 'Task' + (i + 1), task_owner: r.insertId });
//            });
//        }
//
//        db.set('task_owner', 3)
//            .whereIn('id', '11,8,9,10')
//            .update('todu', function (r) {
//                console.log(r);
//                db.destroy();
//            });
//
//        db.like('task', 'out', 'l')
//            .orLike('task', 'repeated', 'b')
//            .whereIn('id', '1,3')
//            .get('todu', function (r) {
//                console.log(r);
//                db.release();
//            });
//
//        db.delete('todu', function (r) {
//            console.log(r);
//            db.destroy();
//        });
//    } catch (e) {
//        console.log('Error: ' + e);
//        db.destroy();
//    }
//
//});
//
//





