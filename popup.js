const player = document.getElementById("player");
const status = document.getElementById("status");

const artwork = document.getElementById("artwork");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const previousButton = document.getElementById("previous");
const playPauseButton = document.getElementById("playPause");
const nextButton = document.getElementById("next");

let refreshTimer = null;

async function request(payload) {
    return browser.runtime.sendMessage({
        type: "MUSIC_DECK_REQUEST",
        payload
    });
}

function showStatus(message) {
    player.classList.add("hidden");
    status.classList.remove("hidden");

    status.textContent = message;
}

function showPlayer() {
    status.classList.add("hidden");
    player.classList.remove("hidden");
}

function renderState(state) {
    title.textContent = state.title || "Nothing Playing";
    artist.textContent = state.artist || "YouTube Music";

    if (state.artwork) {
        artwork.src = state.artwork;
        artwork.classList.remove("hidden");
    } else {
        artwork.removeAttribute("src");
        artwork.classList.add("hidden");
    }

    playPauseButton.textContent = state.isPlaying ? "❚❚" : "▶";

    showPlayer();
}

async function refreshState() {
    try {
        const response = await request({
            type: "GET_STATE"
        });

        if (!response?.ok) {
            if (response?.error === "YOUTUBE_MUSIC_NOT_FOUND") {
                showStatus("Open YouTube Music to activate Music Deck.");
                return;
            }

            showStatus(
                "Music Deck could not reach the YouTube Music player."
            );

            return;
        }

        renderState(response.data);
    } catch (error) {
        console.error("Music Deck refresh failed:", error);

        showStatus("Music Deck encountered an error.");
    }
}

async function sendControl(type) {
    try {
        await request({ type });

        window.setTimeout(refreshState, 150);
    } catch (error) {
        console.error(`Music Deck command ${type} failed:`, error);
    }
}

previousButton.addEventListener("click", () => {
    sendControl("PREVIOUS");
});

playPauseButton.addEventListener("click", () => {
    sendControl("PLAY_PAUSE");
});

nextButton.addEventListener("click", () => {
    sendControl("NEXT");
});

refreshState();

refreshTimer = window.setInterval(refreshState, 1000);

window.addEventListener("unload", () => {
    if (refreshTimer !== null) {
        window.clearInterval(refreshTimer);
    }
});