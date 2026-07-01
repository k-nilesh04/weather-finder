const API = "7890ba423fbd43c0a80102124261606"

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const weatherIcon = document.getElementById('weatherIcon');
const main = document.getElementById('main');
const windSpeed = document.getElementById('windSpeed');
const humidity = document.getElementById('humidity');
const localtime = document.getElementById('localtime');
const headline = document.getElementById('headline');
const pm2_5 = document.getElementById('pm2_5');
const precip_mm = document.getElementById('precip_mm');
const suggestions = document.getElementById('suggestions');
const chance_of_rain = document.getElementById('chance_of_rain');


async function fetchWeather(city, region='none', country='none') {
    try {
      let url;
      if (country === 'none' && region ==='none' ) {
        url = `https://api.weatherapi.com/v1/forecast.json?key=${API}&q=${city}&days=7&aqi=yes`;
      } else {
        url = `https://api.weatherapi.com/v1/forecast.json?key=${API}&q=${city},${region},${country}&days=7&aqi=yes`;
      }
      

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("City not found");
      }

      main.style.display = "contents";

      const data = await response.json();

      cityName.textContent = `${data.location.name}, ${data.location.country}`;
      weatherIcon.src = `https:${data.current.condition.icon}`;

      temperature.textContent =`🌡️ Temperature: ${Math.round(data.current.temp_c)}°C | ${Math.round(data.current.temp_f)}°F`;
      condition.textContent = `📊 Condition: ${data.current.condition.text}`;
      windSpeed.textContent = `🌪️ Wind Speed: ${data.current.wind_kph} kph`;
      humidity.textContent = `🍃 Humidity: ${data.current.humidity} %`;
      localtime.textContent = `⌛ Local Time: ${data.location.localtime}`;
      precip_mm.textContent = `🌧️ Precipitation: ${data.current.precip_mm} mm`;
      chance_of_rain.textContent = `💧 Chance Of Rain: ${data.current.chance_of_rain} %`;

      if (data.alerts?.headline) {
        headline.textContent = `Headline: ${data.alerts.headline}`;
      }

      if (data.current?.air_quality?.['gb-defra-index'] ) {
        if (data.current.air_quality["gb-defra-index"] < 3 )  {
          aqi = 'Good'
        } else if (data.current.air_quality["gb-defra-index"] < 6 ) {
          aqi = 'Moderate'
        } else if (data.current.air_quality["gb-defra-index"] < 8 ) {
          aqi = 'Unhealthy'
        } else {
          aqi = 'Hazardous'
        }
        pm2_5.textContent =`♒ AQI: ${data.current.air_quality["gb-defra-index"]}/10   ( ${aqi} zone )`;
      }

      // 7-day forecast
      const forecastDays = data.forecast.forecastday;
      const container = document.getElementById('forecast-container');
      container.innerHTML = '';

      forecastDays.forEach(dayData => {
        const dateObj = new Date(dayData.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

        const icon = dayData.day.condition.icon;
        const text = dayData.day.condition.text;
        const maxTemp = Math.round(dayData.day.maxtemp_c);
        const minTemp = Math.round(dayData.day.mintemp_c);

        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');
        forecastCard.innerHTML = `
          <p class="day-name">${dayName}</p>
          <img src="https:${icon}" alt="${text}" class="forecast-icon" title="${text}" />
          <div class="temp-range">
            <span class="max-temp">${maxTemp}°</span>
            <span class="min-temp">${minTemp}°</span>
          </div>
        `;

        container.appendChild(forecastCard);
      });

  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Could not find that city. Please try again.");
  }
}  





// navbar section 


searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  suggestions.innerHTML = "";

  if (city) {
    await fetchWeather(city);
  }
});

cityInput.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    suggestions.innerHTML = "";

    if (city) {
        await fetchWeather(city);
    }
  }
});



// map view

const map = L.map('map').setView([22.9734, 78.6569], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map);

let marker;

map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker([lat, lon]).addTo(map);

    marker.bindPopup("Loading weather...").openPopup();

    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${API}&q=${lat},${lon}`
        );

        const data = await response.json();

        marker.setPopupContent(`
            <div>
                <h3>${data.location.name}</h3>
                <img src="https:${data.current.condition.icon}" alt="weather icon">
                <p>🌡️ Temp: ${data.current.temp_c}°C</p>
                <p>☁️ Condition: ${data.current.condition.text}</p>
                <p>💧 Humidity: ${data.current.humidity}%</p>
            </div>
        `);

        marker.openPopup();

    } catch (error) {
        marker.setPopupContent("Failed to load weather data.");
    }
});



// suggestions option 

cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();

  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/search.json?key=${API}&q=${query}`
    );

    const data = await response.json();
    suggestions.innerHTML = "";

    data.forEach(place => {
      const div = document.createElement("div");
      div.classList.add("suggestion");
      div.textContent = `${place.name}, ${place.region}, ${place.country}`;

      div.addEventListener("click", () => {
        cityInput.value = `${place.name}, ${place.region}, ${place.country}`;
        suggestions.innerHTML = "";

        fetchWeather(place.name, place.region, place.country);
      });

      suggestions.appendChild(div);
    });

  } catch (err) {
    console.error(err);
  }
});




