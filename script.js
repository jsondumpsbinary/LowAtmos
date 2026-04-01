/* ============================================================
   LowAtmos — script.js
   Weather + Music Recommendation
   ============================================================ */

// ── CONFIG ───────────────────────────────────────────────────
const API_KEY     = "753e6fb30a4bd59c20f227cfe7cd5c31";   // ← replace with your OWM key
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const MUSIC_URL   = "https://striveschool-api.herokuapp.com/api/deezer/search";

// ── DOM REFERENCES ───────────────────────────────────────────
const cityInput      = document.getElementById("cityInput");
const fetchBtn       = document.getElementById("fetchBtn");
const loader         = document.getElementById("loader");
const errorBox       = document.getElementById("errorBox");
const errorMsg       = document.getElementById("errorMsg");
const weatherCard    = document.getElementById("weatherCard");
const songsContainer = document.getElementById("songsContainer");

// Weather card inner elements
const cityNameEl      = document.getElementById("cityName");
const countryNameEl   = document.getElementById("countryName");
const weatherIconEl   = document.getElementById("weatherIcon");
const temperatureEl   = document.getElementById("temperature");
const feelsLikeEl     = document.getElementById("feelsLike");
const conditionEl     = document.getElementById("condition");
const conditionDescEl = document.getElementById("conditionDesc");
const humidityEl      = document.getElementById("humidity");
const windEl          = document.getElementById("wind");
const fetchTimeEl     = document.getElementById("fetchTime");


// ── UI STATE HELPERS ─────────────────────────────────────────

/** Hide all result sections — call before showing any new state. */
function clearResults() {
  loader.classList.add("hidden");
  errorBox.classList.add("hidden");
  weatherCard.classList.add("hidden");
  songsContainer.innerHTML = "";
}

function showLoader() {
  clearResults();
  loader.classList.remove("hidden");
}

function showError(message) {
  clearResults();
  errorMsg.textContent = message;
  errorBox.classList.remove("hidden");
}

function showCard() {
  loader.classList.add("hidden");
  errorBox.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}


// ── WEATHER EMOJI MAPPER ──────────────────────────────────────
/**
 * Maps an OWM condition ID to an emoji.
 * Full list: https://openweathermap.org/weather-conditions
 * @param {number} id - OWM condition ID
 * @returns {string} emoji
 */
function getWeatherEmoji(id) {
  if (id >= 200 && id < 300) return "⛈️";  // Thunderstorm
  if (id >= 300 && id < 400) return "🌦️";  // Drizzle
  if (id >= 500 && id < 600) return "🌧️";  // Rain
  if (id >= 600 && id < 700) return "❄️";  // Snow
  if (id >= 700 && id < 800) return "🌫️";  // Fog / mist
  if (id === 800)             return "☀️";  // Clear sky
  if (id === 801)             return "🌤️";  // Few clouds
  if (id === 802)             return "⛅";  // Scattered clouds
  if (id >= 803 && id < 900) return "☁️";  // Overcast
  return "🌡️";                              // Fallback
}


// ── MUSIC QUERY MAPPER ────────────────────────────────────────
/**
 * Picks a music search query based on the weather condition.
 * @param {string} weatherMain - e.g. "Rain", "Clear", "Clouds"
 * @returns {string} search query string
 */
function getMusicQuery(weatherMain) {
  const map = {
    Rain:         "sad songs",
    Drizzle:      "lo-fi chill",
    Thunderstorm: "intense dramatic music",
    Snow:         "cozy winter songs",
    Clear:        "happy upbeat songs",
    Clouds:       "chill indie music",
    Mist:         "ambient music",
    Fog:          "ambient music",
    Haze:         "mellow songs",
  };
  return map[weatherMain] || "chill music";
}


// ── POPULATE WEATHER CARD ─────────────────────────────────────
/**
 * Fills every element inside the weather card with API data.
 * Returns the main weather condition for use in music fetch.
 * @param {Object} data - Parsed JSON from OWM /weather endpoint
 * @returns {string} weatherMain - e.g. "Rain"
 */
function populateCard(data) {
  cityNameEl.textContent    = data.name;
  countryNameEl.textContent = data.sys.country;

  weatherIconEl.textContent = getWeatherEmoji(data.weather[0].id);

  temperatureEl.textContent = Math.round(data.main.temp);
  feelsLikeEl.textContent   = `Feels like ${Math.round(data.main.feels_like)}°C`;

  const main = data.weather[0].main;
  const desc = data.weather[0].description;
  conditionEl.textContent     = main;
  conditionDescEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent     = `${data.wind.speed} m/s`;

  const now = new Date();
  fetchTimeEl.textContent = `Last updated: ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${now.toLocaleDateString()}`;

  // Return condition so fetchWeather() can pass it to fetchMusic()
  return main;
}


// ── DISPLAY SONGS ─────────────────────────────────────────────
/**
 * Renders up to 5 song cards into #songsContainer.
 * @param {Array} songs - Array of Deezer track objects
 */
function displaySongs(songs) {
  if (!songs || songs.length === 0) {
    songsContainer.innerHTML = `<p class="no-songs">No tracks found for this weather.</p>`;
    return;
  }

  songsContainer.innerHTML = songs
    .slice(0, 5)
    .map(song => `
      <div class="song-card">
        <img src="${song.album.cover}" alt="${song.title} album cover" width="80" height="80" />
        <div class="song-info">
          <p class="song-title">${song.title}</p>
          <p class="song-artist">${song.artist.name}</p>
          <audio controls src="${song.preview}"></audio>
        </div>
      </div>
    `)
    .join("");
}


// ── FETCH MUSIC ───────────────────────────────────────────────
/**
 * Fetches tracks from the Deezer proxy based on weather condition.
 * Fails silently — music is a bonus feature, not critical.
 * @param {string} weatherMain - e.g. "Rain", "Clear"
 */
async function fetchMusic(weatherMain) {
  const query = getMusicQuery(weatherMain);

  try {
    const response = await fetch(`${MUSIC_URL}?q=${encodeURIComponent(query)}`);

    if (!response.ok) throw new Error(`Music API error: ${response.status}`);

    const data = await response.json();
    displaySongs(data.data);

  } catch (error) {
    // Don't crash the app if music fails — log and show a soft message
    console.warn("Music fetch failed:", error.message);
    songsContainer.innerHTML = `<p class="no-songs">Couldn't load music recommendations right now.</p>`;
  }
}


// ── MAIN FETCH FUNCTION ───────────────────────────────────────
/**
 * Entry point: validates input → fetches weather → fetches music.
 */
async function fetchWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name before searching.");
    return;
  }

  if (API_KEY === "YOUR_API_KEY_HERE") {
    showError("API key not set. Please add your OpenWeatherMap key in script.js.");
    return;
  }

  showLoader();

  const url = `${WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`City "${city}" not found. Check the spelling and try again.`);
      } else if (response.status === 401) {
        throw new Error("Invalid API key. Please check your key in script.js.");
      } else {
        throw new Error(`Unexpected error (HTTP ${response.status}). Try again later.`);
      }
    }

    const data = await response.json();

    // populateCard fills the DOM and returns the weather condition
    const weatherMain = populateCard(data);
    showCard();

    // Fetch music after weather card is visible
    fetchMusic(weatherMain);

  } catch (error) {
    if (error instanceof TypeError) {
      showError("Network error — check your connection and try again.");
    } else {
      showError(error.message);
    }
  }
}


// ── EVENT LISTENERS ───────────────────────────────────────────

fetchBtn.addEventListener("click", fetchWeather);

cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") fetchWeather();
});

cityInput.addEventListener("input", () => {
  if (!errorBox.classList.contains("hidden") || !weatherCard.classList.contains("hidden")) {
    clearResults();
  }
});