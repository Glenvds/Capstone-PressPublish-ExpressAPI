const express = require('express');
const artistsRouter = express.Router();


const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");
/*const db = new sqlite3.Database('../database.sqlite', (err) => {
    if (err) { console.log(err); }
    else {
        console.log("Connected to datbase.");
    }
});*/


artistsRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Artist where is_currently_employed = 1", (err, rows) => {
        if (err) { next(err); }
        else { res.status(200).send({ artists: rows }) }
    });
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist where id = ${artistId}`, (err, artist) => {
        if (err) { next(err); }
        else if (artist) {
            req.artist = artist; next();
        }
        else { res.sendStatus(404); }
    })
})

artistsRouter.get("/:artistId", (req, res, next) => {
    res.status(200).json({ artist: req.artist });
});

artistsRouter.post("/", (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        res.sendStatus(400);
    } else {
        const sqlQry = "INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES($name, $dateOfBirth, $biography, $isCurrentlyEmployed);";
        const values = { $name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed };
        db.run(sqlQry, values, function (err) {
            if (err) { next(err); }
            else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, artist) => {
                    if (err) { next(err); }
                    else { res.status(201).send({ artist: artist }); }
                });
            }
        });
    }
});

artistsRouter.put("/:artistId", (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    if (!name || !dateOfBirth || !biography) {
        res.sendStatus(400);
    }

    const sqlQry = "UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $id";
    const values = { $name: name, $dateOfBirth: dateOfBirth, $biography: biography, $isCurrentlyEmployed: isCurrentlyEmployed, $id: req.params.artistId };

    db.run(sqlQry, values, function (err) {
        if (err) { next(err); }
        else {
            db.get("SELECT * FROM Artist WHERE id = $id", { $id: req.params.artistId }, (err, row) => {
                if (err) { next(err); }
                else { res.status(200).send({ artist: row }); }
            });
        }
    });
});


artistsRouter.delete("/:artistId", (req, res,next) => {
    const sqlQry = "UPDATE Artist SET is_currently_employed = 0 WHERE id = $id";
    const values = {$id: req.params.artistId};

    db.run(sqlQry, values, (err) => {
        if(err){next(err);}
        else{
            db.get("SELECT * FROM Artist WHERE id = $id", {$id: req.params.artistId}, (err, artist) => {
                if(err){next(err);}
                else{res.status(200).send({artist: artist});}
            });
        }
    });
});

module.exports = artistsRouter;