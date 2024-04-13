'use strict';
const express = require('express');
const moviesData = require("./data.json");
const app = express();

const port = 3000;

class Movie {
    constructor(title, poster_path, overview) {
        this.title = title;
        this.poster_path = poster_path;
        this.overview = overview;
    }
}

class Error {
    constructor(errorNumber, response){
        this.status = errorNumber;
        this.responseText = response;
    }
}

function handleHomePage(req, res) {
    let movie = new Movie(moviesData.title, moviesData.poster_path, moviesData.overview);
    res.json(movie);
}

function handleFavorite(req, res) {
    res.send("Welcome to Favorite Page");
}


function handleError500(err, req, res) {
    let error = new Error(500,'Sorry, something went wrong');
    res.status(500).json(error);
}

function handleError404(req, res) {
    let error = new Error(404,'Page Not Found');
    res.status(404).json(error);
}


app.get("/favorite", handleFavorite)
app.get("/", handleHomePage)

app.use(handleError404); 
app.use(handleError500); 

function handleListen() {
    console.log(`App listening on port ${port}`);
}


app.listen(port, handleListen);