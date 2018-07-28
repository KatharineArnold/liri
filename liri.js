require("dotenv").config();
var fs = require('fs');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var keys = require("./keys");
var request = require('request');
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);


// Read command line arguments
let cmdArgs = process.argv;

// The LIRI command is the second argument
let liriCommand = cmdArgs[2];

//  may contain spaces fix
let liriArg = '';
for (let i = 3; i < cmdArgs.length; i++) {
    liriArg += cmdArgs[i] + ' ';
}

function getTweets() {
    var params = {
        screen_name: 'KatharineArno19',
        count: 20,
    };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //need a loop
            for (let j = 0; j < tweets.length; j++) {
                console.log(tweets[j].text);

            }
        }
    });
}



function getSongInfo(song) {
    let search;
    if (song === '') {
        search = 'The Sign Ace Of Base';
    } else {
        search = song;
    }
    spotify.search({ type: 'track', query: search })
        .then(function (response) {
            let songs = response.tracks.items;
            let firstSong = songs[0];
            //Artist(s)
            //loop through to get all artist NOT WORKING
            // for (let k = 0; k < songs.length; k++) {
            // }
            let artists = firstSong.artists
                .map(artist => artist.name)
                .join(', ');
            console.log("Artist(s): " + artists);

            // console.log("here is the artist" + firstSong.artists);

            // The album that the song is from
            console.log(firstSong.album.name);
            // A preview link of the song from Spotify
            console.log(firstSong.external_urls.spotify);
            // The song's name
        })
        .catch(function (err) {
            console.log(err);
        });
}



function getMovieInfo(movie) {
    let search;
    if (movie === '') {
        search = 'Mr. Nobody';
    } else {
        search = movie;
    }
    // Replace spaces with '+' 
    search = search.split(' ').join('+');

    // Query omdb
    var queryUrl = "https://www.omdbapi.com/?t=" + search + "&y=&plot=short&apikey=trilogy";


    // Send request to OMDB
    request(queryUrl, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Release Year: " + JSON.parse(body).Year);
        };
    });
}


function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function (error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        } else {
            let cmdString = data.split(',');
            let command = cmdString[0].trim();
            let param = cmdString[1].trim();
            runCommand(command, param);
        }

    });
}


function runCommand(command, arg) {
    if (command === `my-tweets`) {
        console.log('Listing my tweets');
        getTweets();

    } else if (command === `spotify-this-song`) {
        getSongInfo(arg);

    } else if (command === `movie-this`) {
        console.log('movie this');
        getMovieInfo(arg);

    } else {
        console.log("Plese enter a valid command")
    };
}



if (liriCommand === `do-what-it-says`) {
    doWhatItSays();
} else {
    runCommand(liriCommand, liriArg)
};