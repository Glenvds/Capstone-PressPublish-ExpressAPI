const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

issuesRouter.get("/", (req, res, next) => {
    console.log("in iss: " + req.series.id);
    db.all("SELECT * FROM Issue WHERE series_id = $sId", {$sId: req.series.id}, (err, issues) => {
        if(err){next(err);}
        else{
            res.status(200).send({issues: issues});
        }
    });
});

issuesRouter.post("/", (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if(!name || !issueNumber || !publicationDate || !artistId){res.sendStatus(400);}
    else{
        db.get("SELECT * FROM Artist WHERE id = $aId", {$aId: artistId}, (err, artist) => {
            if(err){next(err);}
            else if(!artist){res.sendStatus(400);}
            else{
                const sqlQ = "INSERT INTO Issue (name, issue_number, publication_date, series_id, artist_id) VALUES ($name, $issueNumber, $publicationDate, $sId, $aId)";
                const values = {$name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $sId: req.series.id, $aId: artistId};
                db.run(sqlQ, values, function(err){
                    if(err){next(err);}
                    else{
                        db.get("SELECT * FROM Issue WHERE id = $id", {$id: this.lastID}, (err, iss) => {
                            if(err){next(err);}
                            else{
                                res.status(201).send({issue: iss});
                            }                            
                        });
                    }
                });
            }
        })
    }

});

issuesRouter.param("issueId", (req, res, next, issueId) => {
    const sqlQ = "SELECT * FROM Issue WHERE id = $issueId";
    const values = {$issueId: issueId};
    db.get(sqlQ, values, (err, issue) => {
        if(err){next(err);}
        else if(issue){
            req.issue = issue; next()
        } else {
            res.sendStatus(404);
        }
    })
});

issuesRouter.put("/:issueId", (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;

    if(!name || !issueNumber || !publicationDate || !artistId){res.sendStatus(400);}
    else{
        db.get("SELECT * FROM Artist WHERE id = $aId", {$aId: artistId}, (err, artist) => {
            if(err){next(err);}
            else if(!artist){res.sendStatus(400);}
            else{
                //const sqlQu = `UPDATE Issue SET name = ${name}, issue_number = ${issueNumber}, publication_date = ${publicationDate}, artist_id = ${artistId}, series_id = ${req.series.id} WHERE id = ${req.params.issueId}`;
                //const sqlQ = "UPDATE Issue SET name = $n, issue_number = $iN, publication_date = $pd, artist_id = $aId, series_id = $sId WHERE id = $iId";
                const values = {$name: name, $issueNumber: issueNumber, $publicationDate: publicationDate, $artistId: artistId, $seriesId: req.series.id, $issueId: req.params.issueId};
                db.run("UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = $seriesId WHERE id = $issueId", values, (err) => {
                    if(err){console.log("err in de put run"); next(err);}
                    else{
                        db.get("SELECT * FROM Issue WHERE id = $iId", {$iId: req.params.issueId}, (err, iss) => {
                            if(err){next(err);}
                            else{
                                res.status(200).send({issue: iss});
                            }
                        });
                    }
                });
            }

        });
    }

});

issuesRouter.delete("/:issueId", (req, res, next) => {
    db.run("DELETE FROM Issue WHERE id = $iId", {$iId: req.params.issueId}, (err) => {
        if(err){next(err);}
        else{
            res.sendStatus(204);
        }
    })
});


module.exports = issuesRouter;