const dbHandler = require('./include/Db_Handler.js');

const session = require("express-session");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bCrypt = require('bcryptjs');

//Strategy use to authenticate the user with passport
passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, done) {
        dbHandler.getUserByEmail(email, function (err, user, msg) {
            if (err) return done(null, false, {message: msg});
            if (!user) return done(null, false, {message: 'Incorrect username.'});
            bCrypt.compare(password, user.password, function (err, res) {
                if (res === true) {
                    done(null, user);
                } else {
                    done(null, false, {message: 'Wrong password.'});
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.uuid);
});

passport.deserializeUser(function (uuid, done) {
    dbHandler.getUserByUUID(uuid, function (err, user) {
        if (err) {
            return done(err);
        }
        done(null, user);
    });
});

module.exports = function (app) {
    //parameter use for the authentification system (need to be improve to use another method than Memory storage)
    app.use(session({secret: "john", resave: false, saveUninitialized: false}));
    app.use(passport.initialize());
    app.use(passport.session());

    /*
    Allow the user to be logged on the website
    Need a valid email and password send into the post request
    Return a json that contain an error field (boolean) and a message field to explain the error.
     */
    app.post('/login', function (req, res) {
        passport.authenticate('local', function (err, user, info) {
            if (err) {
                res.status(500).json(err);
            } else {
                if (!user) {
                    res.status(200).json({
                        error: true,
                        message: info.message
                    })
                } else {
                    req.logIn(user, function (err) {
                        if (err) {
                            res.status(500).json(err);
                        }
                        req.session.email = req.body.email;
                        res.status(200).json({
                            error: false
                        });
                    });
                }
            }
        })(req, res);
    });

    /*
    Allow the user to logOut from the website
    Need an active session initialized with the login method
    Redirect the user to the home page
     */
    app.get('/logout', function (req, res) {
            req.logout();
        req.session.destroy();
            res.redirect('/');
        }
    );

    /*
    Allow the user to register on the website
    Need valid login, email and password parameters into the post request
    Return a json that contain an error field (boolean) and a message field to explain the error
     */
    app.post('/register', function (req, res) {
            const login = req.body.login;
            const email = req.body.email;
            const password = req.body.password;

            const paramErr = [];

            if (login === undefined || login === "") paramErr.push("login");
            if (email === undefined || email === "") paramErr.push("email");
            if (password === undefined || password === "") paramErr.push("password");

            if (paramErr.length > 0) {
                res.status(400).json({
                    error: 'true',
                    message: "One or more parameters are empty or missing: ",
                    param: paramErr
                });
            } else {
                if (validateEmail(email)) {
                    dbHandler.createUser(login, email, password, function (err, rep) {
                        if (err) {
                            res.status(500).json(rep);
                        } else {
                            res.status(200).json(rep);
                        }
                    });
                } else {
                    res.status(200).json({error: 'true', message: "Email address is not valid"});
                }
            }
        }
    );

    /*
    Allow the user to change his password on the website
    Need an active session initialized with the login method, the old and the new user password parameter into the post request
    Return a json that contain an error field (boolean) and a message field to explain the error
     */
    app.post('/changePassword', function (req, res) {
        const email = req.session.email;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        const paramErr = [];
        if (email === undefined || email === "") res.status(400).json({
            error: true,
            message: "You need to be authenticated to do that"
        });
        if (oldPassword === undefined || oldPassword === "") paramErr.push("oldPassword");
        if (newPassword === undefined || newPassword === "") paramErr.push("newPassword");

        if (paramErr.length > 0) {
            res.status(400).json({
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            if (oldPassword === newPassword) {
                res.status(200).json({
                    error: 'true',
                    message: "You new password need to different from the old"
                });
            } else if (validateEmail(email)) {
                if (req.isAuthenticated()) {
                    dbHandler.getUserByEmail(email, function (err, user, msg) {
                        if (err) return res.status(500).json({error: true, message: msg});
                        if (!user) return res.status(200).json({error: true, message: 'Incorrect username.'});

                        bCrypt.compare(oldPassword, user.password, function (err, result) {
                            if (result === true) {
                                dbHandler.updatePassword(email, newPassword, function (err, msg) {
                                    if (err) res.status(500).json({error: true, message: msg});
                                    res.status(200).json({error: false, message: 'Password change with success'})
                                });
                            } else {
                                res.status(200).json({error: true, message: 'Wrong password.'})
                            }
                        });
                    })
                } else {
                    res.status(200).json({error: 'true', message: "You need to be authenticated to do that"});
                }
            } else {
                res.status(200).json({error: 'true', message: "Email address is not valid"});
            }

        }
    });

    /*
    Allow the user to delete his account on the website
    Need an active session initialized with the login method, the user email and his password parameter into the post request
    Return a json that contain an error field (boolean) and a message field to explain the error
     */
    app.post('/deleteAccount', function (req, res) {
        const email = req.body.email;
        const password = req.body.password;

        const paramErr = [];

        if (email === undefined || email === "") paramErr.push("email");
        if (password === undefined || password === "") paramErr.push("password");

        if (paramErr.length > 0) {
            res.status(400).json({
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            if (validateEmail(email)) {
                if (req.isAuthenticated()) {
                    dbHandler.getUserByEmail(email, function (err, user, msg) {
                        if (err) return res.status(500).json({error: true, message: msg});
                        if (!user) return res.status(400).json({error: 'true', message: 'Incorrect username.'});

                        bCrypt.compare(password, user.password, function (err, result) {
                            if (result === true) {
                                req.logout();
                                dbHandler.deleteUser(email, function (err, rep) {
                                    if (err) {
                                        res.status(500).json(rep);
                                    } else {
                                        if (rep.error) {
                                            res.status(200).json(rep);
                                        } else {
                                            res.redirect('/');
                                        }
                                    }
                                });
                            } else {
                                res.status(200).json({error: true, message: 'Wrong password.'})
                            }
                        })
                    })
                } else {
                    res.status(200).json({error: 'true', message: "You need to be authenticated to do that"});
                }
            } else {
                res.status(200).json({error: 'true', message: "Email address is not valid"});
            }
        }
    });

    //return true if the user is logged or false if the user isn't logged on the website
    app.post("/userIsLogged", function (req, res) {
        res.status(200).json({result: req.isAuthenticated()});
    });
};

//Validate the user email with a regex String
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
