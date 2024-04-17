'use strict';

const express = require('express');
const moviesData = require("./Movie Data/data.json");
const cors = require("cors");
const axios = require('axios').default;
require("dotenv").config();

const app = express();
app.use(cors());

const port = 3000;
const apiKey = process.env.API_KEY;
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

class Trend {
    constructor(id,title,release_date,poster_path,overview){
        this.id= id;
        this.title=title;
        this.release_date = release_date;
        this.poster_path = poster_path;
        this.overview = overview; 
    }
}

class Certification {
    constructor(certification,meaning,order){
        this.certification =certification;
        this.meaning= meaning;
        this.order = order;
    }
}

function handleHomePage(req, res) {
    let movie = new Movie(moviesData.title, moviesData.poster_path, moviesData.overview);
    res.json(movie);
}

function handleFavorite(req, res) {
    res.send("Welcome to Favorite Page");
}

function handleTrending(req,res){
    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result=>{
            let data = result.data.results.map(
                trend => new Trend(trend.id,trend.title,trend.release_date,trend.poster_path,trend.overview)
            );
             res.json(data);
        }
        // console.log(result)
    ).catch((error)=>{
        console.log(error);
        res.send("Error in trending");
    });
}

function handleSearch(req, res){
    let searchWord = req.query.searchWord;
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${searchWord}&page=2`;
    axios.get(url).then(
        result=>{
            let data = result.data.results.map(
                trend => new Trend(trend.id,trend.title,trend.release_date,trend.poster_path,trend.overview)
            );
             res.json(data);
        }
    ).catch((error)=>{
        console.log(error);
        res.send("Error in search");
    })
}

function handleCertification(req,res){
    const url = `https://api.themoviedb.org/3/certification/movie/list?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result=>{
            let source = result.data.certifications;
            let data = [];

            for (const key in source) {
                let subData = source[key].map(
                    (obj) => new Certification(obj.certification,obj.meaning,obj.order)
                );
                data.push(...subData);
            }
            res.json(data);
        }
    ).catch((error)=>{
        console.log(error);
        res.send("Error in certification");
    });
}

function handleTranslations(req,res){
    const url = `https://api.themoviedb.org/3/configuration/primary_translations?api_key=${apiKey}&language=en-US`;
    axios.get(url).then(
        result=>{
            let data = result.data;
            res.json(data);
        }
    ).catch((error)=>{
        console.log(error);
        res.send("Error in translations");
    });


}

function handleError500(err, req, res) {
    let error = new Error(500,'Sorry, something went wrong');
    res.status(500).json(error);
}

function handleError404(req, res) {
    let error = new Error(404,'Page Not Found');
    res.status(404).json(error);
}


app.get("/translations",handleTranslations);
app.get("/certification",handleCertification)
app.get("/search",handleSearch );
app.get("/trending",handleTrending );
app.get("/favorite", handleFavorite);
app.get("/", handleHomePage);

app.use(handleError404); 
app.use(handleError500); 

function handleListen() {
    console.log(`App listening on port ${port}`);
}


app.listen(port, handleListen);