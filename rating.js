const dbHandler = require('./include/Db_Handler.js');


module.exports = function (app) {
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

    app.post('/deleteBar', function (req, res) {
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

    app.post('/updateRating', function (req, res) {
        const email = req.session.email;
        const barID = req.body.barID;
        const barName = req.body.barName;
        const rating = req.body.rating;
        const comment = req.body.comment;

        const paramErr = [];
        if (!req.isAuthenticated() || email === undefined || email === "") {
            res.status(400).json({
                error: true,
                message: "You need to be authenticated to do that"
            });
            return;
        }
        if (barID === undefined || barID === "") paramErr.push("barID");
        if (rating === undefined || rating === "") paramErr.push("rating");

        if (paramErr.length > 0) {
            res.status(400).json({
                error: 'true',
                message: "One or more parameters are empty or missing: ",
                param: paramErr
            });
        } else {
            dbHandler.getUserByEmail(email, function (err, user, msg) {
                if (err) return res.status(500).json({error: true, message: msg});
                dbHandler.setBarRating(user.uuid, barID, barName, rating, comment, function (err, updated, msg) {
                    if (err) return res.status(500).json({error: true, message: msg});
                    res.status(200).json({updated: updated});
                })
            });
        }

    });
};
