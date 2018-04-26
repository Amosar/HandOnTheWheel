const MongoClient = require('mongodb').MongoClient;
const uuidV1 = require('uuid/v1');
const bCrypt = require('bcryptjs');

// Connection URI
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database Name
const dbName = process.env.MONGODB_DBNAME || 'PinPint';

const databaseConnectionErrorMsg = "An error occurred with the database, please contact the Admin or try again later";

/*
Initialize the connection with the database and return a db object that contain the database object
and client object to close the connection with the database properly
 */

function connect(callback) {
    // Use connect method to connect to the server
    MongoClient.connect(url, function (err, client) {
        if (err) {
            console.error(err);
            callback(err);
            return;
        }

        const db = client.db(dbName);
        callback(null, db, client);
    });
}

const local = module.exports = {
    /**
     * Create and add a user to the database
     * @param pseudo - pseudo of the user
     * @param email - email of the user
     * @param password - password of the user
     * @param callback - callback function that return a boolean (Internal error)
     *                     and json file with error (boolean) and message (String) field.
     */
    createUser: function (pseudo, email, password, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, {error: true, message: databaseConnectionErrorMsg});
            local.isUserExist(email, function (err, isUserExist, msg) {
                if (err) return callback(err, {error: true, message: msg});
                if (!isUserExist) {
                    const salt = bCrypt.genSaltSync(10);
                    const hash = bCrypt.hashSync(password, salt);

                    const uuid = uuidV1();

                    const user = db.collection('user');
                    user.insertOne({
                        pseudo: pseudo,
                        email: email,
                        password: hash,
                        uuid: uuid
                    }, function (err) {
                        client.close();
                        if (err) {
                            callback(true, {error: true, message: err.errmsg})
                        } else {
                            callback(false, {error: false, message: "User successfully registered"});
                        }
                    });
                } else {
                    callback(false, {error: true, message: "User already exist"})
                }
            });
        })
    },

    /**
     * Delete a user
     * @param email email of the user that you want to delete
     * @param callback callback function that return a boolean (Internal error)
     *                     and json file with error (boolean) and message (String) field.
     */
    deleteUser: function (email, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, {error: true, message: databaseConnectionErrorMsg});
            const user = db.collection('user');
            user.removeMany({email: email}, function (err) {
                client.close();
                if (err) {
                    callback(true, {error: true, message: err.errmsg})
                } else {
                    callback(false, {error: false, message: "User successfully removed"});
                }
            });
        })
    },

    /**
     * Get a user with his Email address
     * (will be remove or modify with session system)
     * @param email email of the user
     * @param callback  callback function with boolean (Internal error), a user and a message to explain the error
     */
    getUserByEmail: function (email, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, null, databaseConnectionErrorMsg);
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    callback(false, docs[0]);
                } else {
                    callback(false, null, 'No user have been found with the email' + email);
                }
            });
        })
    },

    /**
     * Get user with his UUID
     * @param uuid  UUID of the user
     * @param callback  callback function with boolean (Internal error), a user and a message to explain the error
     */
    getUserByUUID: function (uuid, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, null, databaseConnectionErrorMsg);
            const user = db.collection('user');
            user.find({uuid: uuid}).toArray(function (err, docs) {
                client.close();
                if (docs.length > 0) {
                    callback(false, docs[0]);
                } else {
                    callback(true, null, 'No user have been found with ' + uuid + " id");
                }
            });
        });
    },

    /**
     * Check if the user is in the database with his email address.
     * @param email - email address of the user.
     * @param callback - callback function with two boolean parameter, one for Internal error
     *                      and the other if the user exist or not
     *  .
     */
    isUserExist: function (email, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, false, databaseConnectionErrorMsg);
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, docs) {
                client.close();
                callback(false, docs.length > 0);
            });
        })
    },

    /**
     * Update the password in the database
     * @param email - email adress of the user
     * @param newPassword - new Password of the user
     * @param callback - callback function that return an error or not and a message to explain the error
     */
    updatePassword: function (email, newPassword, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, databaseConnectionErrorMsg);
            const user = db.collection('user');
            user.find({email: email}).toArray(function (err, doc) {
                if (doc.length > 0) {
                    const salt = bCrypt.genSaltSync(10);
                    const hash = bCrypt.hashSync(newPassword, salt);
                    user.updateOne({email: email}, {$set: {"password": hash}}, function (err) {
                        if (err) callback(true, databaseConnectionErrorMsg);
                        client.close();
                        callback(false);
                    });
                } else {
                    callback(true, 'No user have been found with the email : ' + email);
                }
            });
        })
    },

    /**
     * Get all Bars rated by a user
     * @param userUUID  The UUID of the user
     * @param callback  callback function with boolean parameter (Internal Error) and an array of rated bar
     */
    getAllBarRatedByUser: function (userUUID, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, null, databaseConnectionErrorMsg);
            const bars = db.collection('bars');
            bars.find({userUUID: userUUID}).toArray(function (err, bars) {
                client.close();
                if (bars.length > 0) {
                    callback(false, bars)
                } else {
                    callback(false, null)
                }
            })
        })
    },

    /**
     *  Get a bar rated by a user
     * @param userUUID  The UUID of the user
     * @param barId     The google map ID of the bar
     * @param callback  callback function with boolean parameter, the rated bar and a message to explain the error
     */
    getOneBarRatedByUser: function (userUUID, barId, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, null, databaseConnectionErrorMsg);
            const bars = db.collection('bars');
            bars.find({userUUID: userUUID, barID: barId}).toArray(function (err, bar) {
                client.close();
                if (bar.length > 0) {
                    callback(false, bar[0])
                } else {
                    callback(true, null, "no bar found")
                }
            })
        })
    },

    /**
     * Delete a bar rating
     * @param userUUID  The UUID of the user
     * @param barId     The google map ID of the bar
     * @param callback - callback function that return a boolean (Internal error)
     *                     and json file with error (boolean) and message (String) field.
     */
    deleteBarRating: function (userUUID, barId, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, {error: true, message: databaseConnectionErrorMsg});
            const bars = db.collection('bars');
            bars.removeMany({userUUID: userUUID, barID: barId}, function (err) {
                client.close();
                if (err) {
                    callback(false, {error: true, message: err.errmsg})
                } else {
                    callback(false, {error: false, message: "Bar rating successfully removed"});
                }
            });
        })
    },

    /**
     * Rate a bar
     * @param userUUID  The UUID of the user
     * @param barId     The google map ID of the bar
     * @param barName   The name of the Bar
     * @param rating    The rating of the bar (number between 1 and 5)
     * @param comment   The comment of the bar (less than 500 characters)
     * @param callback - callback function with two boolean parameter, one for Internal error
     *                      and the other if the bar is updated or not
     */
    setBarRating: function (userUUID, barId, barName, rating, comment, callback) {
        connect(function (err, db, client) {
            if (err) return callback(true, false, databaseConnectionErrorMsg);
            const bars = db.collection('bars');
            bars.updateOne({userUUID: userUUID, barID: barId}, {
                $set: {
                    userUUID: userUUID,
                    barName: barName,
                    barID: barId,
                    rating: rating,
                    comment: comment
                }
            }, {upsert: true}, function (err, result) {
                if (err) return callback(false, false, databaseConnectionErrorMsg);
                client.close();
                callback(false, result.modifiedCount + result.upsertedCount === 1);
            });

        })
    }
};
