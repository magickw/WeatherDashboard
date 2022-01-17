//Declares global variables. I declared variables with "const" rather than "var", because I watched hours of videos on Youtube
//before I started to code, in which most of them used const, for example, https://www.youtube.com/watch?v=6trGQWzg2AI
const searchInput = $("#city-input");
const cityNameEl = $(".cityName");
const searchHistoryEl = $(".history");
//The following variables will be used to show the weather of the searched city.
const currentDateEl = $(".currentDate");
const weatherIconEl = $(".weather-icon");
const tempEl = $(".temp");
const humidityEl = $(".humidity");
const windSpeedEl = $(".windSpeed");
const uvIndexEl = $(".uv-Index");
//The following variable will be used to generate the forcast cards
const forcastCardEl = $(".forcast-cards");

// Read the search history item as string then convert to JSON object
let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

//openweather.org's API key which will be used to fetch the weather
const apiKey = "723b345acdd52204dfb9a13e95119b61";

//Search button event listener
$(".searchBtn").on("click", function(event) {
    event.preventDefault();
    //When the user enters nothing
    if (searchInput.val() === "") {
        //Alert the user that they need to enter a city name
        alert("Please enter a city");
        return;
    } else {
        //uses the push() method to add the search inputs to the search history
        searchHistory.push(searchInput.val());
        //Window refresh. Once the window is refreshed, the search term will show up immediately in the search history. 
        window.location.reload();
        //Uses the localStorage.setItem() to store and JSON.stringfy the search history 
    localStorage.setItem("search", JSON.stringify(searchHistory));
    };
    //Run the following function to get weather by the user's search term
    getWeather(searchInput.val());
});

//Clear button event listener to clear the search history
$(".clearBtn").on("click", function(event) {
    event.preventDefault();
    //Remove the data stored in localstorage
    localStorage.removeItem("search");
    window.location.reload();
  })

//Temperature conversion when temperature unit wasn't set to imperial
function k2F(k) {
    return Math.floor((k - 273.15) * 1.8 + 32);
}

//Get the current date
function getDate(date){
    // Date objects are created with the new Date() constructor. 
    // Because the time parameter got from API is in miliseconds, this conversion is inevitable.
    let currentDate = new Date(date*1000);
    console.log(currentDate);
    //Get the values of day, month and year
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // +1 because month returned by `getMonth()` method starts at 0 index!
    const year = currentDate.getFullYear();
    //Returns the dates in format of month/day/year 
    return month + "/" + day + "/" + year;
}

//Get the weather by city name entered by the user.
function getWeather(cityName){
    //API query url
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    fetch(queryUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(response){
          //Get the searched city's data, including the name of city and current date
          cityNameEl.text(response.name + " (" + getDate(response.dt) + ") ");
          let weatherIcon = response.weather[0].icon;
          //Get a weather icon from api request and give the icon some attributes, including its image address
          weatherIconEl.attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
          weatherIconEl.attr("alt", response.weather[0].description);
          tempEl.text("Temperature: " + k2F(response.main.temp) + " °F");
          humidityEl.text("Humidity: " + response.main.humidity + "%");
          windSpeedEl.text("Wind Speed: " + response.wind.speed + " MPH");
          //Latitude and longitude of current-city are needed in order to fetch uv index data
           let lat = response.coord.lat;
           let lon = response.coord.lon;
           //Checking the uv index should use the necall api url, https://openweathermap.org/api/one-call-api
           let uvIndexQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + apiKey;
           console.log(uvIndexQueryUrl);
           fetch(uvIndexQueryUrl)
             .then(function(uvResponse) {
                 return uvResponse.json();
             })
             .then(function(uvResponse){
                 //Checks UV conditions
                var uvConditions;
                // Use the current.uvi parameter to recall the Current UV index
                if (uvResponse.current.uvi < 3) {
                    //When the uv-index <3, it's favorable
                    uvConditions = "uv-favorable";}
                    else if (uvResponse.current.uvi >= 3 && uvResponse.current.uvi < 6) {
                         //When the 3 =< uv-index =< 6, it's moderate
                        uvConditions = "uv-moderate";} else {
                            //When the uv-index >6, it's unfavorable
                            uvConditions = "uv-severe";
                        }
                //linked to css by adding class to different UV conditions 
            uvIndexEl.addClass(uvConditions).text("UV Index: " + uvResponse.current.uvi);

                //Remove forecast then render it
                let prevCardEl = $(".card-panel")

                for(i = 0; i < prevCardEl.length; i++){
                    $('.card-panel').remove();
                }

                //Get the 5 day forecast
                 console.log(uvResponse.daily);
                 //Everyday's weather conditions are under the daily array
                 let dataArry = uvResponse.daily;
                 //Loop through 5 days
                 for(let i = 0; i < 5; i++){
                     console.log(dataArry[i])
                     //Gets the weather icon
                     let dataIcon = "https://openweathermap.org/img/wn/" + dataArry[i].weather[0].icon + "@2x.png";
                     //Run the createForcast function to get temperatures, humidities and windspeeds for 5 days.
                     createForecast(getDate(dataArry[i].dt), dataIcon, k2F(dataArry[i].temp.day), dataArry[i].humidity, dataArry[i].wind_speed);
                 }
             });
      });
}

// Uses createForecast function to create forcast cards for 5 days
function createForecast(date, icon, temp, humidity, windSpeed) {
    // Using $('<div />') , jQuery creates the element using the native JavaScript createElement() function and use addClass() method to add bootstrap card styling.
    let fiveDayCardEl = $("<div>").addClass("card-panel col-sm-2 bg-primary text-white m-2 p-4 rounded");
    // Makes the date as a <h5> heading 
    let cardDate = $("<h5>").addClass("card-title");
    // Gets the weather icon
    let cardIcon = $("<img>").addClass("weatherIcon");
    // Creates paragraphs for temperatures, humidities and windspeeds
    let cardTemp = $("<p>").addClass("card-text");
    let cardHumidity = $("<p>").addClass("card-text");
    let cardWindSpeed = $("<p>").addClass("card-text");

    // Show the date and weather icon
    cardDate.text(date);
    cardIcon.attr("src", icon);
    //Show the weather info
    cardTemp.text(`Temperature: ${temp}°F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    cardWindSpeed.text(`Wind Speed: ${windSpeed} MPH`);
    //Use append() method to generate forcast cards, appending the date, icon, temperature, humudity and windspeed
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity, cardWindSpeed);
    forcastCardEl.append(fiveDayCardEl);
}

//Render city search history
function renderSearchHistory() {
    //When the search history isn't empty
    if(searchHistory.length != 0){
        //Loop through the search hitory
        for (let i=0; i<searchHistory.length; i++) {
            // Using $('<div />') , jQuery creates the element using the native JavaScript createElement() function
            let searchedCity = $("<div>");
            //uses the append() method to append the searched city and set some attributes to it
            searchedCity.append("<a href='#' class='list-group-item'>"+searchHistory[i]);
            searchedCity.append("<a id='storedData'></a>");
            let storedData = $('#storedData');
            //Click event listener
            searchedCity.on("click", function() {
                //when a city in the search history is searched, then run the console.log()
                storedData.val(searchHistory[i]);
                console.log(storedData.val());
                //Then get the clicked searched city's weather conditions
                getWeather(searchHistory[i]);
            })
            searchHistoryEl.append(searchedCity);
        }
    }
}


//Code inside the $(document ).ready() method will run once the page DOM is ready to execute JavaScript code.
$(document).ready(function(){
    renderSearchHistory();
    //When the search history is not empty;
    if (searchHistory.length > 0) {
        // last searched city was loaded when page reaload
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});

