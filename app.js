/* ========================================
   LowAtmos - Main Application
   ======================================== */

// Configuration - from config.js (local) or environment variables (deployed)
const HF_TOKEN = 
  (typeof CONFIG !== "undefined" && CONFIG.HF_TOKEN) || 
  (typeof process !== "undefined" && process.env.REACT_APP_HF_TOKEN) ||
  "";

/* ========================================
   DOM Elements
   ======================================== */

const cityInput = document.getElementById("city-input");
const moodDropdown = document.getElementById("mood-dropdown");
const searchBtn = document.getElementById("search-btn");
const loadingDiv = document.getElementById("loading");
const resultsSection = document.getElementById("results-section");
const errorSection = document.getElementById("error-section");
const genreDisplay = document.getElementById("genre-display");
const songsGrid = document.getElementById("songs-grid");
const errorMessage = document.getElementById("error-message");

/* ========================================
   Event Listeners
   ======================================== */

searchBtn.addEventListener("click", handleSearch);
cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

/* ========================================
   Main Handler Function
   ======================================== */

async function handleSearch() {
    const city = cityInput.value.trim();
    const mood = moodDropdown.value;

    if (!city || !mood) {
        showError("Please enter a city and select a mood.");
        return;
    }

    if (!HF_TOKEN || HF_TOKEN === "PASTE_YOUR_HF_TOKEN_HERE") {
        showError("⚠️  Hugging Face API key not configured. Set REACT_APP_HF_TOKEN environment variable on Vercel or add to config.js locally.");
        return;
    }

    try {
        showLoading(true);
        hideError();

        // Step 1: Get weather for the city
        const weatherData = await fetchWeather(city);

        // Step 2: Use Hugging Face to determine genre based on weather & mood
        const genre = await predictGenre(mood, weatherData);

        // Step 3: Fetch songs from Deezer based on genre
        const songs = await fetchSongs(genre);

        // Step 4: Display results
        displayResults(genre, songs);
    } catch (err) {
        showError(err.message);
    } finally {
        showLoading(false);
    }
}

/* ========================================
   API Integration Functions
   ======================================== */

/**
 * Fetch weather data from Open-Meteo API (no API key required!)
 */
async function fetchWeather(city) {
    try {
        // Step 1: Get city coordinates using Geocoding API
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
        
        const geoResponse = await fetch(geocodingUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error(`City not found: ${city}`);
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];
        
        // Step 2: Get weather data using coordinates
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=celsius`;
        
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.current) {
            throw new Error("Failed to fetch weather data");
        }
        
        const current = weatherData.current;
        
        // Map weather codes to descriptions
        const weatherDescriptions = {
            0: "Clear sky",
            1: "Mostly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Foggy",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        };
        
        const weatherDescription = weatherDescriptions[current.weather_code] || "Unknown";
        
        // Determine main weather type
        let weatherMain = "Clear";
        if (current.weather_code >= 51 && current.weather_code <= 67) weatherMain = "Rain";
        else if (current.weather_code >= 71 && current.weather_code <= 86) weatherMain = "Snow";
        else if (current.weather_code >= 80 && current.weather_code <= 82) weatherMain = "Rain";
        else if (current.weather_code >= 95) weatherMain = "Thunderstorm";
        else if (current.weather_code >= 45) weatherMain = "Clouds";
        else if (current.weather_code >= 2) weatherMain = "Clouds";
        
        return {
            temp: current.temperature_2m,
            weather: weatherMain,
            description: weatherDescription,
            city: name,
            country: country,
        };
    } catch (err) {
        throw new Error(`Weather API Error: ${err.message}`);
    }
}

/**
 * Use Hugging Face Zero-Shot Classification to predict genre
 */
async function predictGenre(mood, weatherData) {
    const candidate_labels = [
        "Ambient",
        "Electronic",
        "Hip Hop",
        "Indie",
        "Jazz",
        "Lo-Fi",
        "Pop",
        "Rock",
        "Soul",
        "Synthwave",
    ];

    // Create a descriptive prompt combining mood and weather
    const weatherContext = `${weatherData.weather} - ${weatherData.description} (${Math.round(
        weatherData.temp
    )}°C)`;
    
    const payload = {
        model: "meta-llama/Llama-3.2-1B-Instruct",
        messages: [
            {
                role: "user",
                content: `Mood: ${mood}. Weather: ${weatherContext}. Suggest exactly one music genre from this list: ${candidate_labels.join(', ')}. Output only the genre name. No other text.`
            }
        ],
        max_tokens: 10
    };

    try {
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: { 
                    Authorization: `Bearer ${HF_TOKEN}`, 
                    "Content-Type": "application/json" 
                },
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
            throw new Error(`Hugging Face API Error (${response.status}): ${errorMsg}`);
        }

        const data = await response.json();
        
        let predictedGenre = data.choices && data.choices[0] && data.choices[0].message.content 
                             ? data.choices[0].message.content.trim() 
                             : candidate_labels[0];
                             
        // Attempt to match the generated text to one of the candidate labels
        const matchedGenre = candidate_labels.find(label => 
            predictedGenre.toLowerCase().includes(label.toLowerCase())
        );

        return matchedGenre || candidate_labels[0];
    } catch (err) {
        throw new Error(`AI Genre Prediction Error: ${err.message}`);
    }
}

/**
 * Fetch songs from iTunes Search API
 */
async function fetchSongs(genre) {
    const apiUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(genre)}&media=music&limit=50`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("No songs found for this genre");
    }

    const processedSongs = data.results
        .filter((song) => song.previewUrl) // Only songs with preview
        .filter((song) => song.artworkUrl100) // Only songs with artwork
        .slice(0, 10) // Get top 10
        .map((song) => ({
            title: song.trackName,
            artist: song.artistName,
            preview: song.previewUrl,
            cover: song.artworkUrl100,
            id: song.trackId,
        }));

    if (processedSongs.length === 0) {
        throw new Error("No songs with previews available");
    }

    return processedSongs;
}

/* ========================================
   Display & DOM Manipulation
   ======================================== */

/**
 * Display results with genre and song cards
 */
function displayResults(genre, songs) {
    // Display genre heading
    genreDisplay.textContent = genre;

    // Clear previous songs
    songsGrid.innerHTML = "";

    // Use .map() to create and render song cards
    songs.map((song) => createSongCard(song)).forEach((card) => songsGrid.appendChild(card));

    // Show results section
    resultsSection.classList.remove("hidden");
    errorSection.classList.add("hidden");
}

/**
 * Create a song card element using higher-order functions
 */
function createSongCard(song) {
    const card = document.createElement("div");
    card.className = "song-card";

    // Build card structure
    const albumCover = document.createElement("img");
    albumCover.src = song.cover;
    albumCover.alt = `${song.title} album cover`;
    albumCover.className = "album-cover";
    albumCover.onerror = () => {
        albumCover.classList.add("placeholder");
        albumCover.textContent = "🎵";
    };

    const content = document.createElement("div");
    content.className = "card-content";

    const title = document.createElement("div");
    title.className = "song-title";
    title.textContent = song.title;
    title.title = song.title;

    const artist = document.createElement("div");
    artist.className = "song-artist";
    artist.textContent = song.artist;
    artist.title = song.artist;

    const audioContainer = document.createElement("div");
    audioContainer.className = "audio-player";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = song.preview;

    audioContainer.appendChild(audio);
    content.appendChild(title);
    content.appendChild(artist);
    content.appendChild(audioContainer);

    card.appendChild(albumCover);
    card.appendChild(content);

    return card;
}

/* ========================================
   UI State Management
   ======================================== */

/**
 * Show or hide loading indicator
 */
function showLoading(isVisible) {
    isVisible
        ? loadingDiv.classList.remove("hidden")
        : loadingDiv.classList.add("hidden");
}

/**
 * Display error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");
}

/**
 * Hide error message
 */
function hideError() {
    errorSection.classList.add("hidden");
}
