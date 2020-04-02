const express = require('express');
const seriesRouter = express.Router();
const issuesRouter = require('./issues');
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "../database.sqlite");

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM Series", (err, rows) => {
        if(err){next(err);}
        else {
            res.status(200).send({series: rows});
        }
    });

});

seriesRouter.param("seriesId", (req, res, next, seriesId) => {
    db.get("SELECT * FROM Series WHERE id = $id", {$id: seriesId}, (err, serie) => {
        if(err){next(err);}
        else if(serie) {
            req.series = serie;
            next();
        } else {
            res.sendStatus(404);
        }
        
    })
});

seriesRouter.get("/:seriesId", (req, res, next) => {
    res.status(200).send({series: req.series});
});

seriesRouter.post("/", (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    if(!name || !description){res.sendStatus(400);}
    else{
        db.run("INSERT INTO Series (name, description) VALUES ($name, $description)", {$name: name, $description: description}, function(err){
            if(err){next(err);}
            else{
                db.get("SELECT * FROM Series WHERE id = $id", {$id: this.lastID}, (err, serie) => {
                    if(err){next(err);}
                    else{
                        res.status(201).send({series: serie});
                    }
                })
            }
        });
    }

});

seriesRouter.put("/:seriesId", (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if(!name || !description) {res.sendStatus(400);}
    else{
        db.run("UPDATE Series SET name=$name, description=$description WHERE id = $id",{$name: name, $description: description, $id: req.series.id}, (err) => {
            if(err){next(err);}
            else{
                db.get("SELECT * FROM Series WHERE id = $id", {$id: req.series.id}, (err, serie) => {
                    if(err){next(err);}
                    else{
                        res.status(200).send({series: serie});
                    }
                })
            }
        } )
    }
});

seriesRouter.delete("/:seriesId", (req, res, next) => {
    db.get("SELECT * FROM Issue WHERE series_id = $sId", {$sId: req.params.seriesId}, (err, iss) => {
        if(err){next(err);}
        else if(iss){res.sendStatus(400);}
        else{
            db.run("DELETE FROM Series WHERE id = $sId", {$sId: req.params.seriesId}, (err) =>{
                if(err){next(err);}
                else{
                    res.sendStatus(204);
                }
            })
        }
    })
});


module.exports = seriesRouter;