//Declares global variables
const searchInput = $("#city-input");
const cityNameEl = $(".cityName");
const currentDateEl = $(".currentDate");
const weatherIconEl = $(".weather-icon");
const searchHistoryEl = $(".history");
const tempEl = $(".temp");
const humidityEl = $(".humidity");
const windSpeedEl = $(".windSpeed");
const uvIndexEl = $(".uv-Index");
const forcastCardEl = $(".forcast-cards");

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

//openweather.org's API key
const apiKey = "723b345acdd52204dfb9a13e95119b61";

//Search button event listener
$(".searchBtn").on("click", function(event) {
    event.preventDefault();
    if (searchInput.val() === "") {
        //Alert the user that they need to enter a city name
        alert("Please enter a city");
        return;
    } else {
        //uses the push() method to add the search inputs to the search history
        searchHistory.push(searchInput.val());
        window.location.reload();
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
    // Reference https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date
    let currentDate = new Date(date*1000);
    console.log(currentDate);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // +1 because month returned by `getMonth()` method starts at 0 index!
    const year = currentDate.getFullYear();
    return month + "/" + day + "/" + year;
}

//Get the weather by city name entered by the user.
function getWeather(cityName){
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    fetch(queryUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(response){
          //Get the searched city's data, including the name of city and current time
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
                    uvConditions = "uv-favorable";}
                    else if (uvResponse.current.uvi >= 3 && uvResponse.current.uvi < 6) {
                        uvConditions = "uv-moderate";} else {
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
                 let dataArry = uvResponse.daily;
                 for(let i = 0; i < 5; i++){
                     console.log(dataArry[i])
                     let dataIcon = "https://openweathermap.org/img/wn/" + dataArry[i].weather[0].icon + "@2x.png";
                     createForecast(getDate(dataArry[i].dt), dataIcon, k2F(dataArry[i].temp.day), dataArry[i].humidity, dataArry[i].wind_speed);
                 }
             });
      });
}

// Create forcast cards for 5 days
function createForecast(date, icon, temp, humidity, windSpeed) {
    let fiveDayCardEl = $("<div>").addClass("card-panel col-sm-2 bg-primary text-white m-2 p-4 rounded");
    let cardDate = $("<h5>").addClass("card-title");
    let cardIcon = $("<img>").addClass("weatherIcon");
    let cardTemp = $("<p>").addClass("card-text");
    let cardHumidity = $("<p>").addClass("card-text");
    let cardWindSpeed = $("<p>").addClass("card-text");

    forcastCardEl.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temperature: ${temp}°F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    cardWindSpeed.text(`Wind Speed: ${windSpeed} MPH`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity, cardWindSpeed);
}

//Render city search history
function renderSearchHistory() {
    if(searchHistory.length != 0){
        for (let i=0; i<searchHistory.length; i++) {
            const searchedCity = $("<div>");
            searchedCity.append("<a href='#' class='list-group-item'>"+searchHistory[i]);
            searchedCity.append("<a id='storedData'></a>");
            let storedData = $('#storedData');
            searchedCity.on("click", function() {
                storedData.val(searchHistory[i]);
                console.log(storedData.val());
                getWeather(searchHistory[i]);
            })
            searchHistoryEl.append(searchedCity);
        }
    }
}



$(document).ready(function(){
    // last searched city was loaded when page reaload
    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
});

