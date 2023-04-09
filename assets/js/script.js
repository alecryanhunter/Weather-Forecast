// global Variables
var APIKey = "cf9bfc96d61561a057ddd5bc376b18f7";
var city;

// HTML Selectors
var submitBtn = document.querySelector("button");
var cityInput = document.querySelector("input");
var searchHistory = document.querySelector("ul");

// This listens for a click on the City Search form
submitBtn.addEventListener("click",function(event){
    event.preventDefault();
    var citySearch = cityInput.value.trim()
    // Checks if the value entered is all whitespace
    if (citySearch!="") {
        // Creates a li with the name of the just-searched city
        var li = document.createElement("li");
        li.setAttribute("class","list-group-item");
        li.textContent=citySearch
        // Checks if any items exist in the list already
        if (document.querySelector("ul li")) {
            // If they do, they push the oldest results to the bottom
            var recentSearch = document.querySelector("ul li");
            searchHistory.insertBefore(li,recentSearch);
        } else {
            // Otherwise it just attachs it directly to the list
            searchHistory.appendChild(li);
        }
        // Sets the city variable to the value searched, then runs the API call
        city = citySearch;
        forecast();
    }
    // Blanks the input field so it's easy to enter a new city name
    cityInput.value = "";
})

// This function will run an API call on a city in the search history when clicked
searchHistory.addEventListener("click",function(event){
    city = event.target.textContent;
    forecast();
})

// This function performs both API calls and all the page manipulation
function forecast(){
    var lat;
    var lon;

    // The first API call returns a latitude and longitude based on a given city name
    var geoUrl = "https://api.openweathermap.org/geo/1.0/direct?q="+city+"&limit=1&appid="+APIKey;
    fetch(geoUrl).then(function(response){
        return response.json();
    }).then(function(data){
        lat = data[0].lat
        lon = data[0].lon

        // This API call creates the 5-day forecast cards
        var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&cnt=50&units=imperial&appid="+APIKey;
        fetch(forecastUrl).then(function(response){
            return response.json();
        }).then(function(data){
            // This while finds the first index in the API data that is the next
            // day and stores it as 'i'
            var i = 0
            while (dayjs().isSame(dayjs.unix(data.list[i].dt-data.city.timezone),"day")){
                i++
            }

            // Selects and blanks the forecast card container
            var cardRow = document.querySelector(".card-holder")
            cardRow.innerHTML = "";

            // This for loop creates the five cards and appends them to the container
            // It increments 8 every time since the API has data in 3 hour chunks,
            // and 24hrs/3hrs=8, so you get the next day. 
            for (i;i<data.list.length;i+=8) {
                // Creating all the card elements
                var card = document.createElement("section");
                var cardBody = document.createElement("div");
                var cardHead = document.createElement("h5");
                var cardImg = document.createElement("img");
                var foreTemp = document.createElement("p");
                var foreWind = document.createElement("p");
                var foreHum = document.createElement("p");

                // Mostly setting Bootstrap attributes for the cards
                card.setAttribute("class","card col m-2")
                cardBody.setAttribute("class","card-body");
                cardHead.setAttribute("class","card-title");
                cardImg.setAttribute("src","http://openweathermap.org/img/w/"+data.list[i].weather[0].icon+".png")
                foreTemp.setAttribute("class","card-text")
                foreWind.setAttribute("class","card-text")
                foreHum.setAttribute("class","card-text")

                // Adding the actual content to the cards
                cardHead.textContent = dayjs.unix(data.list[i].dt-data.city.timezone).format("MMM DD");
                foreTemp.textContent = "Temperature: "+data.list[i].main.temp+" F°";
                foreWind.textContent = "Wind Speed: "+data.list[i].wind.speed+" MPH";
                foreHum.textContent = "Humidity: "+data.list[i].main.humidity+"%";

                // Appending them all together, and then onto the container
                cardBody.appendChild(cardHead);
                cardBody.appendChild(cardImg);
                cardBody.appendChild(foreTemp);
                cardBody.appendChild(foreWind);
                cardBody.appendChild(foreHum);
                card.appendChild(cardBody);
                cardRow.append(card);
            }
        })

        // This creates the current weather card
        var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&units=imperial&appid="+APIKey
        fetch(weatherUrl).then(function(response){
            return response.json();
        }).then(function(data){
            // Selecting all the relevant elements
            var curCityName = document.querySelector(".city-name");
            var curTemp = document.querySelector(".temp");
            var curWind = document.querySelector(".wind");
            var curHum = document.querySelector(".humidity");
            var curIcon = document.querySelector(".cur-icon");

            // Modifying the contents (or image source) of the elements
            curCityName.textContent = data.name+" - "+dayjs.unix(data.dt).format("MMM DD YYYY");
            curTemp.textContent = "Temperature: "+data.main.temp+" F°";
            curWind.textContent = "Wind Speed: "+data.wind.speed+" MPH";
            curHum.textContent = "Humidity: "+data.main.humidity+"%";
            curIcon.setAttribute("src","http://openweathermap.org/img/w/"+data.weather[0].icon+".png")
        })
    })
}