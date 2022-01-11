// Declares global variables
var searchFormEl = document.querySelector("search-form");
var searchInputEl = document.querySelector("search-input");
var searchEl = document.getElementById("search-button");
var clearEl = document.getElementById("clear-button");
var searchErrorMessageEl = document.querySelector("search-error-message");
var searchHistoryEl = document.querySelector("search-history");
var cityNameEl = document.querySelector("city-name");
var currentDateEl = document.querySelector("current-date");
var currentWeatherIconEl = document.querySelector("current-weather-icon");
var currentTempEl = document.querySelector("current-temperature");
var currentHumidityEl = document.querySelector("current-humidity");
var currentWindSpeedEl = document.querySelector("current-wind-speed");
var currentUvIndexValueEl = document.querySelector("current-UV-index");
var forecastCardsEl = document.querySelector("forecast-cards");
var searchHistory = JSON.parse(localStorage.getItem("search"));


//API Key
var apiKey = "723b345acdd52204dfb9a13e95119b61";

var currentCity;
//Coordinates needed to fetch data from "UV Index" API which only uses latitudes and lontitudes
var currentLat = 0;
var currentLon = 0;


  
//Search form event handler
var searchFormHandler = function (event) {
    event.preventDefault();
    // Trims any empty spaces from the search input and converts it to lowercase
    var citySearchTerm = searchInputEl.value.trim().toLowerCase();
    if (citySearchTerm) {
      getWeather(citySearchTerm);
      // When no city is entered
    } else {
      searchErrorMessageEl.textContent = "Please enter a city name.";
    }
  };

  var searchHistoryHandler = function (event) {
    event.preventDefault();
    var citySearchTerm = event.target.textContent;
    getWeather(citySearchTerm);
  };

  var getWeather = function (citySearchTerm) {
    //  Trims any empty spaces from the search input and converts it to lowercase
    var citySearchTerm = searchInputEl.value.trim().toLowerCase();
    var requestUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearchTerm + "&units=imperial" + "&appid=" + apiKey;
            //Fetches API
            fetch(requestUrl)
            .then(function(response) {
                if (response.ok) {
                    currentCity = citySearchTerm;
                    return response.json();
                } else {
                    searchErrorMessageEl.textContent = "Error! City not found.";
                }
            })
    //  Parse response to display current conditions

    var currentDate = new Date(response.data.dt*1000);
    console.log(currentDate);
    var day = currentDate.getDate();
    // Adds one because month returned by `getMonth()` method starts at 0 index!
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    cityNameEl.innerHTML = response.data.name + " (" + month + "/" + day + "/" + year + ") ";
    var currentWeatherIconEl = response.data.weather[0].icon;
    currentWeatherIconEl.setAttribute("src", "https://openweathermap.org/img/wn/" + currentWeatherIcon + "@2x.png");
    currentWeatherIconEl.setAttribute("alt", response.data.weather[0].description);
    currentTempEl.innerHTML = "Temperature: " + response.data.main.temp + " &#176F";
    currentHumidityEl.innerHTML = "Humidity: " + response.data.main.humidity + "%";
    currentWindSpeedEl.innerHTML = "Wind Speed: " + response.data.wind.speed + " MPH";
                
    var currentLat = response.data.coord.lat;
    var currentLon = response.data.coord.lon;
    var UVQueryUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + currentLat + "&lon=" + currentLon + "&appid=" + apiKey;

     //Fetch UV index data
    fetch(UVQueryUrl)
    .then(function(response){
    var UVIndex = document.createElement("span");
    UVIndex.setAttribute("class","badge badge-danger");
    UVIndex.innerHTML = response.data[0].value;
    currentUvIndexValueEl.innerHTML = "UV Index: ";
    currentUvIndexValueEl.append(UVIndex);
    }
});
}

var currentUvIndexAnalysis = function (UVIndex) {
                    // Checks if the UV Index is favorable
    if (UVIndex < 2) {
        currentUvIndexValueEl.style.backgroundColor = "green";
        currentUvIndexValueEl.style.color = "#ffffff";
    } else if (UVIndex >= 5 && UVIndex < 8) {
        // Checks if the UV Index is moderate
        currentUvIndexValueEl.style.backgroundColor = "yellow";
        currentUvIndexValueEl.style.color = "#000000";
        } else {
             // Checks if the UV Index is unfavorable
            currentUvIndexValueEl.style.backgroundColor = "red"; 
            currentUvIndexValueEl.style.color = "#ffffff";
        }
};


var getForcast = function (citySearchTerm) {
    var forcastQueryUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + citySearchTerm + "&units=imperial" + "&appid=" + apiKey;
    console.log(forcastQueryUrl);
    fetch(forcastQueryUrl)
    .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        displayForecastWeather(data);
      });
 };


searchEl.addEventListener("click", function() {
        var citySearchTerm = searchInputEl.value.trim().toLowerCase();
        getWeather(citySearchTerm);
        searchHistory.push(citySearchTerm);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    })

clearEl.addEventListener("click", function() {
    searchHistory = [];
        renderSearchHistory();
    })

function renderSearchHistory() {
        historyEl.innerHTML = "";
        for (let i=0; i < searchHistory.length; i++) {
            const historyItem = document.createElement("input");
            historyItem.setAttribute("type","text");
            historyItem.setAttribute("readonly",true);
            historyItem.setAttribute("class", "form-control d-block bg-white");
            historyItem.setAttribute("value", searchHistory[i]);
            historyItem.addEventListener("click",function() {
                getWeather(historyItem.value);
            })
            historyEl.append(historyItem);
        }
    }

    renderSearchHistory();
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    }
}