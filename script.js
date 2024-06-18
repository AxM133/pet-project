document.addEventListener("DOMContentLoaded", () => {
    const apiKey = '4cc9911b0a2723050929b73c2a59e727';
    let city = 'Moscow';

    async function fetchWeatherData(url) {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod !== 200 && data.cod !== "200") throw new Error(data.message);
        return data;
    }

    async function updateWeather() {
        document.getElementById('error-message').innerText = "";
        try {
            const currentWeatherData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
            displayCurrentWeather(currentWeatherData);

            const forecastData = await fetchWeatherData(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
            displayForecast(forecastData);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            document.getElementById('error-message').innerText = `Error: ${error.message}`;
        }
        document.getElementById('update-time').innerText = new Date().toLocaleTimeString();
    }

    function displayCurrentWeather(data) {
        const temperature = document.getElementById('temperature');
        const wind = document.getElementById('wind');
        const humidity = document.getElementById('humidity');
        const weatherIcon = document.getElementById('weather-icon');

        temperature.innerText = `+${Math.round(data.main.temp)}°`;
        wind.innerText = `${Math.round(data.wind.speed)} км/ч`;  // Округление скорости ветра до целого числа
        humidity.innerText = `${data.main.humidity}%`;
        weatherIcon.innerHTML = `<i class="${getWeatherIcon(data.weather[0].icon)}"></i>`;
    }

    function displayForecast(data) {
        const timeTemperature = document.getElementById('time-temperature');
        const forecastData = data.list.slice(0, 3);

        timeTemperature.innerHTML = forecastData.map(item => {
            const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `
                <div>
                    <i class="${getWeatherIcon(item.weather[0].icon)}"></i>
                    <br>${time}
                    <br>+${Math.round(item.main.temp)}°
                </div>
            `;
        }).join('');

        updateDailyForecast(data);
    }

    function updateDailyForecast(data) {
        const forecastContainer = document.querySelector('.forecast');
        const dailyData = {};

        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(item);
        });

        const dailyForecast = Object.keys(dailyData).slice(0, 4).map(date => {
            const dayData = dailyData[date];
            const temps = dayData.map(item => item.main.temp);
            const maxTemp = Math.round(Math.max(...temps));
            const minTemp = Math.round(Math.min(...temps));
            const icon = dayData[0].weather[0].icon;
            return { date, maxTemp, minTemp, icon };
        });

        forecastContainer.innerHTML = dailyForecast.map(day => {
            return `
                <div>
                    ${day.date}<br>
                    <i class="${getWeatherIcon(day.icon)}"></i><br>
                    +${day.maxTemp}°<br>
                    <span class="min-temp">+${day.minTemp}°</span>
                </div>
            `;
        }).join('');
    }

    function getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud-meatball',
            '04n': 'fas fa-cloud-meatball',
            '09d': 'fas fa-cloud-showers-heavy',
            '09n': 'fas fa-cloud-showers-heavy',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        return iconMap[iconCode] || 'fas fa-question';
    }

    document.getElementById('show-input-button').addEventListener('click', () => {
        const inputContainer = document.getElementById('city-input-container');
        if (inputContainer.style.display === 'none' || inputContainer.style.display === '') {
            inputContainer.style.display = 'flex';
            inputContainer.style.flexDirection = 'row';
        } else {
            inputContainer.style.display = 'none';
        }
    });

    document.getElementById('city-button').addEventListener('click', () => {
        const cityInput = document.getElementById('city-input').value;
        if (cityInput) {
            city = cityInput;
            document.getElementById('selected-city').innerText = `Город: ${city}`;
            updateWeather();
        }
    });

    updateWeather();
    setInterval(updateWeather, 3600000);
});
