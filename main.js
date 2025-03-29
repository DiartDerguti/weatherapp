// || DOM ELEMENTS
const hamburger = document.querySelector('.hamburger');
const slidebar = document.querySelector('.slidebar');
const searchInput = document.getElementById('search');
const searchSuggestions = document.querySelector('.search-suggestions');
const loaderContainer = document.querySelector('.loader-container');

// Weather display elements
const city = document.getElementById('city');
const country = document.getElementById('country');
const cityTemp = document.getElementById('temp');
const weatherDescription = document.getElementById('description');
const weatherPressure = document.getElementById('pressure');
const weatherVisibility = document.getElementById('visibility');
const weatherHumidity = document.getElementById('humidity');
const sunriseTime = document.getElementById('sunrise-time');
const sunsetTime = document.getElementById('sunset-time');
const uviRays = document.getElementById('uvi-rays');
const uviConcernLevel = document.querySelector('.uvi-level');
const uviConcernLevel2 = document.querySelector('.uvi-level2');
const currentTime = document.querySelector('.time');
const currentDate = document.querySelector('.date');
const aqi = document.querySelector('.aqi');

// || GLOBAL VARIABLES
let weatherApi;
let responseData;

// || EVENT LISTENERS
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    slidebar.classList.toggle('active');
});

searchInput.addEventListener('input', (e) => {
    const input = e.target.value.trim();
    updateSuggestions(input);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cityName = searchInput.value.trim();
        if (cityName) {
            searchSuggestions.classList.remove('active');
            weatherReport(cityName);
        }
    }
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
        searchSuggestions.classList.remove('active');
    }
});

// || FUNCTIONS
async function fetchWorldCapitals() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        return data.map(country => ({
            name: country.capital?.[0] || '',
            country: country.name.common
        })).filter(city => city.name && city.country);
    } catch (error) {
        console.error('Error fetching capitals:', error);
        return [];
    }
}

async function updateSuggestions(input) {
    if (input.length === 0) {
        searchSuggestions.classList.remove('active');
        return;
    }

    const capitals = await fetchWorldCapitals();
    const filteredCapitals = capitals.filter(city => 
        city.name.toLowerCase().includes(input.toLowerCase()) ||
        city.country.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);

    const suggestionsHTML = filteredCapitals.map(city => `
        <div class="suggestion-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>${city.name}, ${city.country}</span>
        </div>
    `).join('');

    searchSuggestions.innerHTML = suggestionsHTML;
    searchSuggestions.classList.add('active');

    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const cityName = item.querySelector('span').textContent.split(',')[0];
            searchInput.value = cityName;
            searchSuggestions.classList.remove('active');
            weatherReport(cityName);
        });
    });
}

async function weatherReport(searchCity) {
    try {
        loaderContainer.classList.add('active');
        weatherApi = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=da2103b2c4ce4f95af051626232503&q=${searchCity}&days=3&aqi=yes&alerts=no`);
        responseData = await weatherApi.json();

        if (responseData.error) {
            loaderContainer.classList.remove('active');
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        todayWeatherReport();
        loaderContainer.classList.remove('active');
    } catch (error) {
        console.error('Error fetching weather data:', error);
        loaderContainer.classList.remove('active');
    }
}

function todayWeatherReport() {
    city.innerHTML = responseData.location.name;
    country.innerHTML = ' <i class="fa-sharp fa-solid fa-location-dot"></i>' + responseData.location.country;

    cityTemp.innerHTML = responseData.current.temp_c;
    weatherDescription.innerHTML = responseData.current.condition.text;
    weatherPressure.innerHTML = responseData.current.pressure_mb + 'mb';
    weatherVisibility.innerHTML = responseData.current.vis_km + ' km';
    weatherHumidity.innerHTML = responseData.current.humidity + '%';

    sunriseTime.innerHTML = responseData.forecast.forecastday[0].astro.sunrise;
    sunsetTime.innerHTML = responseData.forecast.forecastday[0].astro.sunset;
    uviRays.innerHTML = responseData.current.uv + ' UVI';
    aqi.innerHTML = Math.round(responseData.current.air_quality.pm2_5);

    checkUVraysIndex();
    updateTime();
}

function checkUVraysIndex() {
    const uviLevel = Number.parseInt(uviRays.textContent);
    if (uviLevel <= 2) checkUviValue('Good', '#6ae17c');
    else if (uviLevel <= 5) checkUviValue('Moderate', '#CCE16A');
    else if (uviLevel <= 7) checkUviValue('High', '#d4b814');
    else if (uviLevel <= 10) checkUviValue('Very High', '#d43114');
    else checkUviValue('Extreme', '#dc15cf');
}

function checkUviValue(level, color) {
    uviConcernLevel.innerHTML = level;
    uviConcernLevel.style.backgroundColor = color;
    uviConcernLevel2.innerHTML = level;
}

function updateTime() {
    const timezone = responseData.location.tz_id;
    const now = new Date().toLocaleTimeString('en-US', { timeZone: timezone });
    currentTime.innerHTML = now;

    const today = new Date();
    currentDate.innerHTML = today.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// || INITIALIZATION
setInterval(updateTime, 1000);
updateTime();



