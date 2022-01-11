// Declares global variables

var apiKey = "723b345acdd52204dfb9a13e95119b61";
var searchBarEl = document.querySelector("#search-bar");
var searchInputEl = document.querySelector("#search-input");
var searchErrorMessageEl = document.querySelector("#search-error-message");
var searchHistoryEl = document.querySelector("#search-history");
var searchedCityEl = document.querySelector("#searchedCity");
var currentDateEl = document.querySelector("#current-date");
var currentIconEl = document.querySelector("#current-weather-icon");
var currentTempEl = document.querySelector("#current-temperature");
var currentHumidityEl = document.querySelector("#current-humidity");
var currentWindSpeedEl = document.querySelector("#current-wind-speed");
var currentUvIndexValueEl = document.querySelector("#current-UV-index");
var forecastCardsEl = document.querySelector("#forecast-cards");

  
/* ---------- search-form event handler ---------- */
var searchFormHandler = function (event) {
    event.preventDefault();
    // Trims any empty spaces from the search field input and converts it to lowercase
    var citySearchTerm = searchInputEl.value.trim().toLowerCase();
    if (citySearchTerm) {
      getCityWeather(citySearchTerm);
  
      // When no city is entered
    } else {
      searchErrorMessageEl.textContent = "Please enter a city name";
    }
  };

