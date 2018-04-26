const dbHandler = require('./include/Db_Handler.js');


module.exports = function (app) {
    /*
    Allow the user to rate a bar
    Need an active session initialized with the login method and a valid google map barID
    Return a json that contain:
        - an error field (boolean) and a message field to explain the error if something is wrong
        - a field isRated(boolean) to now if the bar isRated by the user, a message is present if it is not
            and if the bar is Rated a rating and comment field are present with the bar rating information
     */
    app.post('/getBarRatingByUser', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;

        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });

        } else if (barID === undefined || barID === "") {
            res.status(400).json({error: true, message: "the BarID parameter need to be specified"})
        } else {
            dbHandler.getUserByEmail(email, function (err, user, msg) {
                if (err) return res.status(500).json({error: true, message: msg});
                dbHandler.getOneBarRatedByUser(user.uuid, barID, function (err, bar, message) {
                    if (err) {
                        res.status(500).json({isRated: false, message: message})
                    } else {
                        if (bar) {
                            res.status(200).json({isRated: true, rating: bar.rating, comment: bar.comment})
                        } else {
                            res.status(200).json({isRated: false, message: message})
                        }
                    }
                })
            });
        }
    });

    /*
    Allow the user to delete a barRating
    Need an active session initialized with the login method and a valid google map barID
    If the bar rating is deleted refresh the page else return a json that contain a message field to explain the error
    */
    app.post('/deleteBarRating', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;

        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });

        } else if (barID === undefined || barID === "") {
            res.status(400).json({error: true, message: "the BarID parameter need to be specified"})
        } else {
            dbHandler.getUserByEmail(email, function (err, user, msg) {
                if (err) return res.status(500).json({error: true, message: msg});
                dbHandler.deleteBarRating(user.uuid, barID, function (err, rep) {
                    if (err) {
                        res.status(500).json(rep);
                    } else {
                        if (rep.error) {
                            res.status(200).json(rep);
                        } else {
                            res.redirect('/bar');
                        }
                    }
                })
            });
        }
    });

    /*
    Allow the user to update a barRating
    Need an active session initialized with the login method, a valid google map barID, the name of the bar,
        the new rate and the new comment
    return a json that contain the field updated to said if the bar rating is updated or not
        And a field message to explain the error.
    */
    app.post('/updateRating', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;
        const barName = req.body.barName;
        const rating = req.body.rating;
        const comment = req.body.comment;

        const paramErr = [];
        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                updated: false,
                error: true,
                message: "You need to be authenticated to do that"
            });
            return;
        }
        if (barID === undefined || barID === "") paramErr.push("barID");
        if (rating === undefined || rating === "") paramErr.push("rating");

        if (paramErr.length > 0) {
            res.status(400).json({
                updated: false,
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            dbHandler.getUserByEmail(email, function (err, user, msg) {
                if (err) return res.status(500).json({updated: false, error: true, message: msg});
                dbHandler.setBarRating(user.uuid, barID, barName, rating, comment, function (err, updated, msg) {
                    if (err) return res.status(500).json({updated: false, error: true, message: msg});
                    res.status(200).json({updated: updated});
                })
            });
        }

    });
};
