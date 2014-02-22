/**
 * Created by steve Samson <stevee.samson@gmail.com> on 2/21/14.
 */

require('string-format-js');
var stringbuilder = require('../libs/stringbuilder'),
    _ = require('underscore'),
    pool = require('pg.js');

module.exports = function (dbconfig) {

    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    var
//        postgres://postgres:1234@localhost/postgres
        config = "%s://%s:%s@%s/%s".format('tcp',dbconfig.user,dbconfig.password,dbconfig.host,dbconfig.database),
        connect = function (cb) {
            pool.connect(config, function (err, conn, release) {
                if (err) {
                    (cb && cb(err));
                    return;
                }
                conn['release'] = release;
                conn['destroy'] = pool.end;
                var db_connection = {
                    connection: conn,
                    release: function () {
                        if (this.debug) {
                            console.log('closing db connection...');
                        }

                        this.connection.release();

                        if (this.debug) {
                            console.log('db connection closed');
                        }

                    },
                    destroy: function () {
                        if (this.debug) {
                            console.log('removing db connection...');
                        }
                        this.connection.end();
                        if (this.debug) {
                            console.log('db connection removed');
                        }
                    }
                }
                pgdb.init();
                _.extend(pgdb, db_connection);

                (cb && cb(false, pgdb));
            });
        },
        poolConnection = function () {
            var self = this;
            pool.connect(config,function (err, conn, release) {
                if (err) {
                    console.error(err.message);
                    throw err;
                }
                conn['release'] = release;
                conn['destroy'] = pool.end;
                self.connection = conn;
//                console.log('Obtained new connection from pool.');
            });
        };


    var Mode = {QUERY: 'Query', PROC: 'Procedure'},
    //Private static functions
        toString = function (o) {
            return '' + o.toString();
        },
        stringWrap = function (o) {
            var raw = toString(o);
            return (raw.indexOf("'") != -1) ? raw : "'%s'".format(raw);
        },
        cleantAt = function (string) {

            return string.replace(new RegExp("@", 'g'), '%');
//            return string.replaceAll("@", "%");
        },
        hasOperator = function (string) {
            var has = false;
            string = string.trim();
            if (string.endsWith(">") || string.endsWith(">=") || string.endsWith("<=") || string.endsWith("<") || string.endsWith("<>") || string.endsWith("!=")) {
                has = true;
            }
            return has;
        },
        trim = function (arr) {

            for (var i = 0; i < arr.length; ++i) {
                arr[i] = arr[i].trim();
            }
            return arr;
        },
    //Private non-static functions
        setLastQuery = function (query) {
            this.lastQuery = query;
        },
        addWheres = function (s) {
            this.wheres.push(s);
        },
        addHavings = function (s) {
            this.havings.push(s);
        },
        addSets = function (s) {
            this.sets.push(s);
        },
        compileDelete = function (tableName) {
            var sb = stringbuilder('');
            sb.append("DELETE FROM\n")
                .append(tableName);
            if (this.wheres.length) {
                sb.append("\nWHERE\n")
                    .append(this.wheres.join(" "))
                    .append("\n");
            }
            setLastQuery.call(this, sb.toString());
            reset.call(this);

        },
        compileUpdate = function (tableName) {
            var sb = stringbuilder();
            sb.append("UPDATE \n")
                .append(tableName)
                .append("\n")
                .append("SET\n")
                .append(this.sets.join(','))
                .append("\n");
            if (this.wheres.length) {
                sb.append("WHERE\n")
                    .append(this.wheres.join(" "))
                    .append("\n");
            }
            setLastQuery.call(this, sb.toString());
            reset.call(this);
        },
        compileSelect = function () {
            var sb = stringbuilder();
            sb.append("SELECT \n")
                .append(this.isdistinct ? "DISTINCT\n" : "")
                .append((!_.isNull(this.selects) && this.selects.length) ? this.selects.join(',') : "*")
                .append("\n")
                .append("FROM\n")
                .append(this.froms.join(','))
                .append("\n");

            if (this.joins.length) {
                sb.append(this.joins.join(" "))
                    .append("\n");
            }

            if (this.wheres.length) {
                sb.append("WHERE\n")
                    .append(this.wheres.join(" "))
                    .append("\n");
            }

            if (!_.isNull(this.groupby) && this.groupby.length) {
                sb.append("GROUP BY\n")
                    .append(this.groupby.join(','))
                    .append("\n");
            }

            if (this.havings.length) {
                sb.append("HAVING (\n")
                    .append(this.havings.join(" "))
                    .append("\n)\n");
            }

            if (!_.isNull(this.orderby) && this.orderby.length) {
                sb.append("ORDER BY\n")
                    .append(this.orderby.join(','))
                    .append("\n")
                    .append(this.order)
                    .append("\n");

            }

            if (this.lim > 0) {
                sb.append("LIMIT\n")
                    .append(this.lim)
                    .append("\n");
                if (this.offset > 0) {
                    sb.append("OFFSET\n")
                        .append(this.offset)
                        .append("\n");
                }

            }

            setLastQuery.call(this, sb.toString());
            reset.call(this);
        },
        reset = function () {
            this.offset = 0;
            this.lim = 0;
            this.order = "ASC";
            this.isdistinct = false;
            this.froms = null;
            this.wheres = [];
            this.selects = null;
            this.joins = [];
            this.groupby = null;
            this.havings = [];
            this.orderby = null;
            this.sets = [];
//            this.callable = null;
//            this.procedure = null;
//            this.outPosition = -1;
//            this.outType = -1;
            this.mode = Mode.QUERY;
            if (this.connection) {
                this.release();
                poolConnection.call(this);
            }

            return this;
        };

    var pgdb = {
        lastQuery: '',
        debug: false,
        connection: null,
        getLastQuery: function () {
            return this.lastQuery;
        },
        distinct: function () {
            this.isdistinct = true;
            return this;
        },
        quote: function (string) {
            var simplified = "";
            if (_.isNull(string) || !string.length) {
                simplified = "''";
            }
            if (string.indexOf(",") != -1) {
                var arr = string.split(",");
                for (var i = 0; i < arr.length; ++i) {
                    arr[i] = stringWrap(arr[i]);
                }
                simplified = arr.join(',');
            } else {
                simplified = stringWrap(string);
            }
            return simplified;
        },
        query: function (q, cb) {
            setLastQuery.call(this, q);
            reset.call(this);
            this.connection.query(this.lastQuery, function (err, result) {
                if (err) {
                    (cb && cb(err));
                    return;
                }
                var retval = false;
                switch(result.command)
                {
                    case 'SELECT':
                        retval = result.rows;
                        break;
                    case 'INSERT':
                    case 'UPDATE':
                    case 'DELETE':
                        retval = {affectedRows:result.rows.rowCount};
                        break;


                }
                (cb && cb(false, retval));
            });
        },
        join: function (table, condition, type) {
            this.joins.push("%s JOIN %s ON %s".format(type, table, condition));
            return this;
        },
        limit: function (lim, offset) {
            this.lim = lim;
            if (offset) {
                this.offset = offset;
            }
            return this;
        },
        select: function (select) {
            this.selects = trim(select.split(","));
            return this;
        },
        from: function (from) {
            this.froms = trim(from.split(","));
            return this;
        },
        where: function (column, value) {
            if (column && value) {

                value = _.isString(value) ? stringWrap(value) : toString(value);
                column = hasOperator(column) ? column : "%s =".format(column);
                addWheres.call(this, this.wheres.length ? "AND %s %s".format(column, value) : "%s %s".format(column, value));

            } else if (column && !value) {

                addWheres.call(this, this.wheres.length ? "AND %s".format(column) : "%s".format(column));
            }

            return this;
        },
        set: function (column, value) {
            value = _.isString(value) ? stringWrap(value) : toString(value);
            column = hasOperator(column) ? column : "%s =".format(column);
            addSets.call(this, "%s %s".format(column, value));
            return this;
        },
        orWhere: function (column, value) {
            value = _.isString(value) ? stringWrap(value) : toString(value);
            addWheres.call(this, "OR %s=%s".format(column, value));
            return this;
        },
        whereIn: function (column, value) {

            addWheres.call(this, this.wheres.length ? "AND %s IN (%s)".format(column, value) : "%s IN (%s)".format(column, value));
            return this;
        },
        whereNotIn: function (column, value) {
            addWheres.call(this, this.wheres.length ? "AND %s NOT IN (%s)".format(column, value) : "%s NOT IN (%s)".format(column, value));
            return this;
        },
        orWhereIn: function (column, value) {
            addWheres.call(this, "OR %s IN (%s)".format(column, value));
            return this;
        },
        orWhereNotIn: function (column, value) {
            addWheres.call(this, "OR %s NOT IN (%s)".format(column, value));
            return this;
        },
        like: function (column, value, position) {
            var entry = "";
            if (position == 'left' || position == 'l') {
                entry = this.wheres.length ? "AND %s ILIKE '@%s'".format(column, value) : "%s ILIKE '@%s'".format(column, value);
            }
            if (position == 'right' || position == 'r') {
                entry = this.wheres.length ? "AND %s ILIKE '%s@'".format(column, value) : "%s ILIKE '%s@'".format(column, value);
            }
            if (position == 'both' || position == 'b') {
                entry = this.wheres.length ? "AND %s ILIKE '@%s@'".format(column, value) : "%s ILIKE '@%s@'".format(column, value);
            }
            addWheres.call(this, cleantAt(entry));
            return this;
        },
        orLike: function (column, value, position) {
            var entry = "";
            if (position == 'left' || position == 'l') {
                entry = "OR %s ILIKE '@%s'".format(column, value);
            }
            if (position == 'right' || position == 'r') {
                entry = "OR %s ILIKE '%s@'".format(column, value);
            }
            if (position == 'both' || position == 'b') {
                entry = "OR %s ILIKE '@%s@'".format(column, value);
            }
            addWheres.call(this, cleantAt(entry));
            return this;
        },
        orNotLike: function (column, value, position) {
            var entry = "";
            if (position == 'left' || position == 'l') {
                entry = "OR %s  NOT ILIKE '@%s'".format(column, value);
            }
            if (position == 'right' || position == 'r') {
                entry = "OR %s  NOT ILIKE '%s@'".format(column, value);
            }
            if (position == 'both' || position == 'b') {
                entry = "OR %s  NOT ILIKE '@%s@'".format(column, value);
            }
            addWheres.call(this, cleantAt(entry));
            return this;
        },
        notLike: function (column, value, position) {
            var entry = "";
            if (position == 'left' || position == 'l') {
                entry = this.wheres.length ? "AND %s NOT ILIKE '@%s'".format(column, value) : "%s NOT ILIKE '@%s'".format(column, value);
            }
            if (position == 'right' || position == 'r') {
                entry = this.wheres.length ? "AND %s  NOT ILIKE '%s@'".format(column, value) : "%s  NOT ILIKE '%s@'".format(column, value);
            }
            if (position == 'both' || position == 'b') {
                entry = this.wheres.length ? "AND %s  NOT ILIKE '@%s@'".format(column, value) : "%s  NOT ILIKE '@%s@'".format(column, value);
            }
            addWheres.call(this, cleantAt(entry));
            return this;
        },
        groupBy: function (columns) {
            this.groupby = trim(columns.split(","));
            return this;
        },
        orderBy: function (columns, direction) {
            this.orderby = trim(columns.split(","));
            this.order = direction ? direction : this.order;
            return this;
        },
        having: function (column, value) {
            value = _.isString(value) ? stringWrap(value) : toString(value);
            column = hasOperator(column) ? column : "%s=".format(column);
            addHavings.call(this, this.havings.length ? "AND %s %s".format(column, value) : "%s %s".format(column, value));
            return this;
        },
        orHaving: function (column, value) {
            value = _.isString(value) ? stringWrap(value) : toString(value);
            column = hasOperator(column) ? column : "%s=".format(column);
            addHavings.call(this, "OR %s %s".format(column, value));
            return this;
        },
        insert: function (table, options, cb) {
            var sb = stringbuilder(''),
                vsb = stringbuilder('');

            sb.append("INSERT INTO\n")
                .append(table)
                .append("\n(\n");
            vsb.append("\nVALUES\n(\n");

            var firstEntry = true;

            for (var key in options) {
                if (!firstEntry) {
                    sb.append(",\n");
                    vsb.append(",\n");
                }
                firstEntry = false;
                sb.append(key);
                vsb.append(_.isString(options[key]) ? stringWrap(options[key]) : toString(options[key]));
            }

            sb.append("\n)");
            vsb.append("\n)\nRETURNING *\n");

            setLastQuery.call(this, "%s%s".format(sb.toString(), vsb.toString()));
            reset.call(this);

            this.connection.query(this.lastQuery, function (err, result) {
                if (err) {
                    (cb && cb(err));
                    return;
                }
                (cb && cb(false, result.rowCount? result.rows[result.rowCount - 1] : {}));
            });

        },
        fetch: function (tableOrCb, cb) {

            if (this.mode == Mode.QUERY) {
                if (_.isFunction(tableOrCb)) {
                    if (_.isNull(this.froms) || !this.froms.length) {
                        var err = Error("No table specified for select statement.");
                        (cb && cb(err));
                        return;
                    }

                    compileSelect.call(this);
                    if (this.debug) {
                        console.log(this.lastQuery);
                    }
                    this.connection.query(this.lastQuery, function (err, result) {
                        if (err){
                            (cb && cb(err));
                            return;
                        }
                        (tableOrCb && tableOrCb(false, result.rows));
                    });
                } else if (_.isString(tableOrCb)) {

                    this.froms = [tableOrCb];
                    this.fetch(cb);

                } else {
                    var err = new Error("No table or callback specified for select statement.");
                    (cb && cb(err));
                }

            }

        },
        update: function (table, cb) {
            if (_.isNull(this.sets) || !this.sets.length) {

                var  err = Error("No fields to be set in update statement.");
                (cb && cb(err));
                return;
            }

            compileUpdate.call(this, table);
            if (this.debug) {
                console.log(this.lastQuery);
            }
            this.connection.query(this.lastQuery, function (err, result) {
                if (err){
                    (cb && cb(err));
                    return;
                }


                (cb && cb(false,{affectedRows: result.rowCount}));
            });
        },
        delete: function (tableName, options, cb) {

            if (options && _.isFunction(options)) {
                compileDelete.call(this, tableName);

                if (this.debug) {
                    console.log(this.lastQuery);
                }
                this.connection.query(this.lastQuery, function (err, result) {
                    if (err){
                        (cb && cb(err));
                        return;
                    }
                    (options && options(false, {affectedRows: result.rowCount}));
                });
            } else if (options && _.isObject(options)) {

                for (var k in options) {
                    this.where(k, options[k]);
                }
                this.delete(tableName, cb);
            }


        },
        init: function () {
            this.debug = _.has(dbconfig, 'debug_db');
            return reset.call(this);
        }
    };

    return {
        connect: connect
    }

};