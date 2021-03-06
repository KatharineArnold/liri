//load required node modules
require("dotenv").config();
var fs = require('fs');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var keys = require("./keys");
var request = require('request');
//load keys
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);


// Read command line arguments
let cmdArgs = process.argv;

// The LIRI command is at index 2 
let liriCommand = cmdArgs[2];

//  spaces fix and grab argument from index 3
let liriArg = '';
for (let i = 3; i < cmdArgs.length; i++) {
    liriArg += cmdArgs[i] + ' ';
}


//twitter function
function getTweets() {
    var params = {
        screen_name: 'KatharineArno19',
        count: 20,
    };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //need a loop to get all tweets
            for (let j = 0; j < tweets.length; j++) {
                console.log(tweets[j].text);

            }
        }
    });
}


//spotify function
function getSongInfo(song) {
    let search;
    //if no song is specified search ace of base the sign
    if (song === '') {
        search = 'The Sign Ace Of Base';
    } else {
        search = song;
    }
    spotify.search({ type: 'track', query: search })
        .then(function (response) {
            let songs = response.tracks.items;
            let firstSong = songs[0];
            //more than one artisit may be listed for one song join them all with a ,
            let artists = firstSong.artists
                .map(artist => artist.name)
                .join(', ');
            //the artist(s)
            console.log("Artist(s): " + artists);
            // The song's name
            console.log("Song:" + firstSong.name);
            // The album that the song is from
            console.log("Album:" + firstSong.album.name);
            // A preview link of the song from Spotify
            console.log("Link:" + firstSong.external_urls.spotify);
        })
        .catch(function (err) {
            console.log(err);
        });
}




//imdb function
function getMovieInfo(movie) {
    let search;
    //if no movie specified search mr nobody
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
            let movieData = JSON.parse(body);
            console.log("Title: " + movieData.Title);
            console.log("Release Year: " + movieData.Year);
            console.log("IMDB Rating: " + movieData.imdbRating);
            //call function that loops through ratings to get rotton tomatoes
            let rating = getRottonTomatoes(movieData);
            console.log("Rotten Tomatoes Rating: " + rating);
            console.log("Country Movie Produced: " + movieData.Country);
            console.log("Language: " + movieData.Language);
            console.log("Plot: " + movieData.Plot);
            console.log("Actors: " + movieData.Actors);
        };
    });
}

//loop through ratings to get rotton tomatoes rating
function getRottonTomatoes(movieData) {
    for (let k = 0; k < movieData.Ratings.length; k++) {
        let currentRating = movieData.Ratings[k];
        if (currentRating.Source === "Rotten Tomatoes") {
            return currentRating.Value
        }
    }
}

//random text function
function doWhatItSays() {
    //read the .txt file
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        } else {
            //seperate at ,
            let cmdString = data.split(',');
            //get first string and trim white space
            let command = cmdString[0].trim();
            //get index one or one argument only in txt file
            let param = (cmdString[1] || "").trim();
            //run command function
            runCommand(command, param);
        }

    });
}

//function to act on specific commands
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


//if user input is do what it says run that function, otherwise run function to act on other commands
if (liriCommand === `do-what-it-says`) {
    doWhatItSays();
} else {
    runCommand(liriCommand, liriArg)
};