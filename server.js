'use strict';

const express = require('express');
const moviesData = require("./Movie Data/data.json");
const cors = require("cors");
const axios = require('axios').default;
require("dotenv").config();
const bodyParser = require('body-parser');
const { Client } = require('pg')
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const username = process.env.USERNAME;
const password = process.env.PASWORD;
const databaseName = process.env.DATABASE;
const url = `postgres://${username}:${password}@localhost:5432/${databaseName}`
const client = new Client(url)
const port = 3002;
const apiKey = process.env.API_KEY;


class Movie {
    constructor(title, poster_path, overview) {
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

class Error {
    constructor(errorNumber, response) {
        this.status = errorNumber;
        this.responseText = response;
    }
}

class Trend {
    constructor(id, title, release_date, poster_path, overview) {
        this.id = id;
        this.title = title;
        this.release_date = release_date;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

class Certification {
    constructor(certification, meaning, order) {
        this.certification = certification;
        this.meaning = meaning;
        this.order = order;
    }
}

function handleSearch(req, res) {
    let searchWord = query || req.query.searchWord;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${searchWord}&page=2`;
    axios.get(url).then(
        result => {
            let data = result.data.results.map(
                trend => new Trend(trend.id, trend.title, trend.release_date, trend.poster_path, trend.overview)
            );
            res.json(data);
        }
    ).catch((error) => {
        console.log(error);
        res.send("Error in search");
    });
}

function handleAddMovie(req, res) {
    const { title, release_date, poster_path, overview } = req.body;
    let sql = 'INSERT INTO Movies(title,release_date,poster_path,overview) VALUES($1, $2, $3, $4) RETURNING *;' // sql query
    let values = [title, release_date, poster_path, overview];
    client.query(sql, values).then((result) => {
        return res.status(201).json(result.rows[0]);
    }).catch();
}

function handleTranslations(req, res) {
    const url = `https://api.themoviedb.org/3/configuration/primary_translations?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result => {
            let data = result.data;
            res.json(data);
        }
    ).catch((error) => {
        console.log(error);
        res.send("Error in translations");
    });
}

function handleCertification(req, res) {
    const url = `https://api.themoviedb.org/3/certification/movie/list?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result => {
            let source = result.data.certifications;
            let data = [];

            for (const key in source) {
                let subData = source[key].map(
                    (obj) => new Certification(obj.certification, obj.meaning, obj.order)
                );
                data.push(...subData);
            }
            res.json(data);
        }
    ).catch((error) => {
        console.log(error);
        res.send("Error in certification");
    });
}


function handleTrending(req, res) {
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result => {
            let data = result.data.results.map(
                trend => new Trend(trend.id, trend.title, trend.release_date, trend.poster_path, trend.overview)
            );
            res.json(data);
        }
    ).catch((error) => {
        console.log(error);
        res.send("Error in trending");
    });
}

function handleFavorite(req, res) {
    res.send("Welcome to Favorite Page");
}

function handleHomePage(req, res) {
    let movie = new Movie(moviesData.title, moviesData.poster_path, moviesData.overview);
    res.json(movie);
}

function handleError500(err, req, res) {
    let error = new Error(500, 'Sorry, something went wrong');
    res.status(500).json(error);
}

function handleError404(req, res) {
    let error = new Error(404, 'Page Not Found');
    res.status(404).json(error);
}

function handleGet(req, res) {

    let sql = 'SELECT * from Movies;'
    client.query(sql).then((result) => {
        res.json(result.rows);
    }).catch((err) => {
        res.send("Error in getting data from Movies table")
    });
}

function handleDelete(req, res) {
    let id = req.params.id;
    let sql = `DELETE FROM Movies
    WHERE id = ${id} RETURNING *;`;
    client.query(sql).then((result) => {
        res.json(result.rows);
    }).catch((err) => {
        res.send("Error in delete data from Movies table")
    });
}

function handleUpdate(req, res) {
    let id = req.params.id;
    const { title, release_date, poster_path, overview } = req.body;
    let sql = `UPDATE Movies
    SET title ='${title}' ,release_date ='${release_date}' ,poster_path='${poster_path}',overview='${overview}'
    WHERE id=${id} RETURNING *;`;
    client.query(sql).then((result) => {
        res.json(result.rows);
    }).catch((err) => {
        res.send("Error in update data in Movies table")
    });
}

function handleRecord(req,res){
    let id = req.params.id;
    let sql = `SELECT * FROM Movies WHERE id = ${id};`;
    client.query(sql).then((result) => {
        res.json(result.rows);
    }).catch((err) => {
        res.send("Error in get record from Movies table")
    });
}

app.get("/getMovies", handleGet);

app.post("/addMovie", handleAddMovie);

app.delete('/DELETE/:id', handleDelete)
app.get("/getMovie/:id",handleRecord)
app.put("/UPDATE/:id", handleUpdate)

app.get("/translations", handleTranslations);
app.get("/certification", handleCertification)
app.get("/search", handleSearch);
app.get("/trending", handleTrending);
app.get("/favorite", handleFavorite);
app.get("/", handleHomePage);

app.use(handleError404);
app.use(handleError500);


client.connect().then(() => {
    app.listen(port, () => {
        console.log(`Server is listening ${port}`);
    });
})