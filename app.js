/* ========================================
   LowAtmos - App Configuration & Security
   ======================================== */

// ⚠️  SECURITY WARNING: Keep API keys empty when pushing to GitHub!
// Add your keys locally for development only.
const HF_TOKEN = "PASTE_YOUR_TOKEN_HERE";
const WEATHER_KEY = "PASTE_YOUR_KEY_HERE";

// ⚠️  Add these keys locally:
// 1. HF_TOKEN: Get from https://huggingface.co/settings/tokens
// 2. WEATHER_KEY: Get from https://openweathermap.org/api
// 3. Deezer API: No key required (uses allorigins proxy)

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

    if (HF_TOKEN === "PASTE_YOUR_TOKEN_HERE" || WEATHER_KEY === "PASTE_YOUR_KEY_HERE") {
        showError("⚠️  API keys are not configured. Please add them to app.js first.");
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
 * Fetch weather data from OpenWeather API
 */
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
    )}&appid=${WEATHER_KEY}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`City not found: ${city}`);
        }
        const data = await response.json();
        return {
            temp: data.main.temp,
            weather: data.weather[0].main,
            description: data.weather[0].description,
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
        model: "meta-llama/Llama-3.2-1B-Instruct:novita",
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
            throw new Error("Hugging Face API Error: " + response.statusText);
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
 * Fetch songs from Deezer API via allorigins proxy
 */
async function fetchSongs(genre) {
    const apiUrl = `https://striveschool-api.herokuapp.com/api/deezer/search?q=${encodeURIComponent(genre)}&limit=50`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Deezer API request failed");
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            throw new Error("No songs found for this genre");
        }

        // Use higher-order functions to filter and sort songs
        const processedSongs = data.data
            .filter((song) => song.preview && song.preview.length > 0) // Only songs with previews
            .filter((song) => song.album && song.album.cover) // Only songs with album art
            .sort((a, b) => b.rank - a.rank) // Sort by popularity (rank)
            .slice(0, 10) // Get top 10
            .map((song) => ({
                title: song.title,
                artist: song.artist.name,
                preview: song.preview,
                cover: song.album.cover,
                id: song.id,
            }));

        if (processedSongs.length === 0) {
            throw new Error("No songs with previews available for this genre");
        }

        return processedSongs;
    } catch (err) {
        throw new Error(`Music API Error: ${err.message}`);
    }
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
