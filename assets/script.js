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
        alert("Please enter a city");
        return;
    }
    searchHistory.push(searchInput.val());
    localStorage.setItem("search", JSON.stringify(searchHistory));
    getWeather(searchInput.val());
});

//Clear button event listener to clear the search history
$(".clearBtn").on("click", function(event) {
    event.preventDefault();
    localStorage.clear("search");
    window.location.reload();
  })

//Temperature conversion
function k2F(k){
    return Math.floor((k - 273.15)*1.8 +32);
}

function getDate(date){
    let currentDate = new Date(date*1000);
    console.log(currentDate);
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // +1 because month returned by `getMonth()` method starts at 0 index!
    const year = currentDate.getFullYear();

    return month + "/" + day + "/" + year;

}

function getWeather(cityName){
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    fetch(queryUrl)
      .then(function(response) {
        return response.json();
      })
      .then(function(response){
          //Get the searched city's data
          cityNameEl.text(response.name + " (" + getDate(response.dt) + ") ");
          let weatherIcon = response.weather[0].icon;
          //Get weather icons from api request
          weatherIconEl.attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png");
          weatherIconEl.attr("alt", response.weather[0].description);
          //Convert temp from deg K to deg F
          tempEl.text("Temperature: " + k2F(response.main.temp) + " °F");
          humidityEl.text("Humidity: " + response.main.humidity + "%");
          windSpeedEl.text("Wind Speed: " + response.wind.speed + " MPH");
          //Latitude and longitude of current-city are needed in order to fetch uv index data
           let lat = response.coord.lat;
           let lon = response.coord.lon;
           //UV Index api url
           let uvIndexQueryUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly" + "&appid=" + apiKey;
           console.log(uvIndexQueryUrl);
           fetch(uvIndexQueryUrl)
             .then(function(uvResponse) {
                 return uvResponse.json();
             })
             .then(function(uvResponse){
                 //Checks UV conditions
                var uvConditions;
                if (uvResponse.current.uvi < 3) {
                    uvConditions = "uv-favorable";}
                    else if (uvResponse.current.uvi < 6) {
                        uvConditions = "uv-moderate";} else {
                            uvConditions = "uv-severe";
                        }
            uvIndexEl.addClass(uvConditions).text("UV Index: " + uvResponse.current.uvi);

                //Remove forecast then render it
                let prevCardEl = document.querySelectorAll(".card-panel")

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
    let fiveDayCardEl = $("<div>").addClass("card-panel col-sm-2 bg-primary text-white m-3 p-1 rounded");
    let cardDate = $("<h4>").addClass("card-title");
    let cardIcon = $("<img>").addClass("weatherIcon");
    let cardTemp = $("<p>").addClass("card-text");
    let cardHumidity = $("<p>").addClass("card-text");
    let cardWindSpeed = $("<p>").addClass("card-text");

    forcastCardEl.append(fiveDayCardEl);
    cardDate.text(date);
    cardIcon.attr("src", icon);
    cardTemp.text(`Temp: ${temp} °F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    cardWindSpeed.text(`Wind Speed: ${windSpeed} MPH`);
    fiveDayCardEl.append(cardDate, cardIcon, cardTemp, cardHumidity, cardWindSpeed);
}

//Render city search history
function renderSearchHistory() {
    searchHistoryEl.innerHTML = "";
    console.log(searchHistory);
    if(searchHistory.length != 0){
        for (let i=0; i<searchHistory.length; i++) {
            const searchedCity = $("<form>");
            searchedCity.append("<a href='#' class='history-item center'>"+searchHistory[i]);
            searchedCity.append("<input type='hidden' id='storedData'></a>");
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

