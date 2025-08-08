const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const getSelectedUnit = () => {
    return document.querySelector('input[name="unit"]:checked').value;
};

const getTemperatureUnitSymbol = (unit) => {
    return unit === "imperial" ? "°F" : "°C";
};

// Convert m/s to mph
const mpsToMph = (mps) => (mps * 2.23694).toFixed(2);

const createWeatherCard = (city, weatherData, index, unit) => {
    const tempUnit = getTemperatureUnitSymbol(unit);
    const windSpeedMps = weatherData.wind.speed;
    const windSpeedMph = mpsToMph(windSpeedMps);

    if (index === 0) {
        return `
        <div class="details">
            <h2>${city} (${weatherData.dt_txt.split(" ")[0]})</h2>
            <h6>Temperature: ${weatherData.main.temp.toFixed(2)}${tempUnit}</h6>
            <h6>Wind: ${windSpeedMps} M/S (${windSpeedMph} mph)</h6>
            <h6>Humidity: ${weatherData.main.humidity}%</h6>
        </div>
        <div class="icon">
            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>${weatherData.weather[0].description}</h6>
        </div>`;
    } else {
        return `
        <li class="card">
            <h3>(${weatherData.dt_txt.split(" ")[0]})</h3>
            <img src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png" alt="weather-icon">
            <h6>Temp: ${weatherData.main.temp.toFixed(2)}${tempUnit}</h6>
            <h6>Wind: ${windSpeedMps} M/S (${windSpeedMph} mph)</h6>
            <h6>Humidity: ${weatherData.main.humidity}%</h6>
        </li>`;
    }
};

const getWeatherDetails = (city, lat, lon) => {
    const apiKey = "267cf21554b098b03a55b035485b7dc6";
    const unit = getSelectedUnit();
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const uniqueDates = [];
            const filteredData = data.list.filter(item => {
                const date = new Date(item.dt_txt).getDate();
                if (!uniqueDates.includes(date)) {
                    uniqueDates.push(date);
                    return true;
                }
                return false;
            });

            cityInput.value = '';
            currentWeatherDiv.innerHTML = '';
            weatherCardsDiv.innerHTML = '';

            filteredData.forEach((weatherData, index) => {
                const weatherCard = createWeatherCard(city, weatherData, index, unit);
                if (index === 0) {
                    currentWeatherDiv.insertAdjacentHTML("beforeend", weatherCard);
                } else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCard);
                }
            });
        })
        .catch(() => {
            alert("An error occurred while fetching the weather forecast!");
        });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === '') return;

    const apiKey = "267cf21554b098b03a55b035485b7dc6";
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.length) {
                alert(`Please try again. No coordinates found for ${cityName}`);
                return;
            }

            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => {
            alert("An error occurred while fetching the coordinates!");
        });
};

const getUserLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDetails("Your Location", latitude, longitude);
            },
            () => {
                alert("Failed to get your location!");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser!");
    }
};

searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserLocation);
