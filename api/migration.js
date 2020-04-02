const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

/*db.run("CREATE TABLE IF NOT EXISTS Artist (id integer not null PRIMARY KEY, name text not null, date_of_birth text not null, biography text not null, is_currently_employed integer default 1)", (err, row) => {
    if(err){console.log(err);}

});*/

/*db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ('glen', '141510', 'pro', '1')", (err, row) => {
    console.log(err);
});*/

/*db.all("SELECT * FROM Artist", (err, row) => {
    if(err){console.log(err);}
    else{console.log(row);}
});*/


/*db.run("CREATE TABLE IF NOT EXISTS Series (id integer not null, name text not null, description text not null, PRIMARY KEY(id))", (err, row) => {
    if(err){console.log(err);}
});*/

db.run("CREATE TABLE IF NOT EXISTS Issue (id integer not null, name text not null, issue_number integer not null, publication_date text not null, artist_id integer not null, series_id integer not null, PRIMARY KEY(id), FOREIGN KEY(artist_id) references Artist(id), FOREIGN KEY(series_id) references Series(id))", (err) => {
    console.log(err);
});

