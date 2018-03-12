const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var bcrypt = require('bcryptjs');
const uuidv1 = require('uuid/v1');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'PintPint';

function connect(callback){
    // Use connect method to connect to the server
    MongoClient.connect(url, function(err, client) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        var db = client.db(dbName);
        callback(db)

        client.close();
    });
}

function createUser(login, email, password) {
    connect(function (db) {
        isUserExist(email)
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt)
        console.debug("hashed password"+hash);

        api_key = uuidv1();

        //TODO add mongoDB code
    })
}

function checkLogin(email, password) {
    connect(function (db) {
        //Todo get user with MongoDB


        if(userExist /*TODO good check*/){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            if(bcrypt.compareSync(TODOdbPassword /*TODO DbPassword*/, hash)){
                return true;
            }else{
                return false;
            }
        }
        var hash = bcrypt.hashSync(password, salt)
        console.debug("hashed password"+hash);

        api_key = uuidv1();

        //TODO add mongoDB code
    })
}

function isValidApiKey(api_key) {
    //TODO add mongoDB code
    return $num_rows > 0;
}

function isUserExist(email){
    //TODO add mongoDB code
}