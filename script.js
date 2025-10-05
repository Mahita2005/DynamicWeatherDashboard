document.addEventListener('DOMContentLoaded', () => {
    const apiKey = ''; //use ur API id generated from OpenWeatherMap 
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const errorMessage = document.getElementById('error-message');
    
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const weatherIconEl = document.getElementById('weather-icon');
    const temperatureEl = document.getElementById('temperature');
    const weatherDescriptionEl = document.getElementById('weather-description');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const forecastCardsEl = document.getElementById('forecast-cards');

    
    const getWeatherByCity = async (city) => {
        if (!city) return;
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const [currentWeatherResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found. Please check the spelling.');
            }

            const currentWeatherData = await currentWeatherResponse.json();
            const forecastData = await forecastResponse.json();

            updateCurrentWeather(currentWeatherData);
            updateForecast(forecastData);
            errorMessage.style.display = 'none';

        } catch (error) {
            showError(error.message);
        }
    };


    const getWeatherByLocation = () => {
        if (!navigator.geolocation) {
            showError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            
            try {
                const [currentWeatherResponse, forecastResponse] = await Promise.all([
                    fetch(currentWeatherUrl),
                    fetch(forecastUrl)
                ]);

                if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                    throw new Error('Could not fetch weather data for your location.');
                }

                const currentWeatherData = await currentWeatherResponse.json();
                const forecastData = await forecastResponse.json();

                updateCurrentWeather(currentWeatherData);
                updateForecast(forecastData);
                errorMessage.style.display = 'none';

            } catch (error) {
                showError(error.message);
            }

        }, (error) => {
            showError('Unable to retrieve your location. Please allow location access or search for a city.');
        });
    };
    
    
    const updateCurrentWeather = (data) => {
        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
        weatherDescriptionEl.textContent = data.weather[0].description;
        humidityEl.textContent = `${data.main.humidity}%`;
        windSpeedEl.textContent = `${data.wind.speed} m/s`;
    };

    
    const updateForecast = (data) => {
        forecastCardsEl.innerHTML = ''; 
        
        
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'forecast-card';

            const day = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
            const temp = `${Math.round(forecast.main.temp)}°C`;

            forecastCard.innerHTML = `
                <div class="day">${day}</div>
                <img src="${icon}" alt="Weather icon">
                <div class="temp">${temp}</div>
            `;
            forecastCardsEl.appendChild(forecastCard);
        });
    };

    
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    };

    
    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        getWeatherByCity(city);
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            getWeatherByCity(city);
        }
    });

    
    getWeatherByLocation();
});