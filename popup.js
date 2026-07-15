const player = document.getElementById("player");
const status = document.getElementById("status");

const artwork = document.getElementById("artwork");
const title = document.getElementById("title");
const artist = document.getElementById("artist");

const seekSlider = document.getElementById("seek");
const currentTimeValue =
    document.getElementById("currentTime");
const durationValue =
    document.getElementById("duration");

const repeatButton =
    document.getElementById("repeat");
const previousButton =
    document.getElementById("previous");
const playPauseButton =
    document.getElementById("playPause");
const nextButton =
    document.getElementById("next");

const muteButton =
    document.getElementById("mute");
const volumeSlider =
    document.getElementById("volume");
const volumeValue =
    document.getElementById("volumeValue");

let refreshTimer = null;
let isChangingVolume = false;
let isSeeking = false;

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

function formatTime(seconds) {
    const safeSeconds = Number.isFinite(
        Number(seconds)
    )
        ? Math.max(0, Number(seconds))
        : 0;

    const totalSeconds = Math.floor(safeSeconds);

    const minutes = Math.floor(
        totalSeconds / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
}

function renderRepeatState(repeatState) {
    repeatButton.classList.remove(
        "repeat-all",
        "repeat-one"
    );

    switch (repeatState) {
        case "ALL":
            repeatButton.textContent = "🔁";
            repeatButton.title = "Repeat queue";

            repeatButton.setAttribute(
                "aria-label",
                "Repeat queue"
            );

            repeatButton.classList.add(
                "repeat-all"
            );

            break;

        case "ONE":
            repeatButton.textContent = "🔂";
            repeatButton.title =
                "Repeat current song";

            repeatButton.setAttribute(
                "aria-label",
                "Repeat current song"
            );

            repeatButton.classList.add(
                "repeat-one"
            );

            break;

        default:
            repeatButton.textContent = "↻";
            repeatButton.title = "Repeat off";

            repeatButton.setAttribute(
                "aria-label",
                "Repeat off"
            );

            break;
    }
}

function renderState(state) {
    title.textContent =
        state.title || "Nothing Playing";

    artist.textContent =
        state.artist || "YouTube Music";

    if (state.artwork) {
        artwork.src = state.artwork;
        artwork.classList.remove("hidden");
    } else {
        artwork.removeAttribute("src");
        artwork.classList.add("hidden");
    }

    playPauseButton.textContent =
        state.isPlaying
            ? "❚❚"
            : "▶";

    renderRepeatState(state.repeatState);

    muteButton.textContent = (
        state.isMuted ||
        state.volume === 0
    )
        ? "🔇"
        : "🔊";

    if (!isSeeking) {
        const duration = Math.max(
            0,
            Number(state.duration) || 0
        );

        const currentTime = Math.min(
            duration,
            Math.max(
                0,
                Number(state.currentTime) || 0
            )
        );

        seekSlider.max = duration;
        seekSlider.value = currentTime;

        currentTimeValue.textContent =
            formatTime(currentTime);

        durationValue.textContent =
            formatTime(duration);

        seekSlider.disabled = duration <= 0;
    }

    if (!isChangingVolume) {
        volumeSlider.value = state.volume;

        volumeValue.textContent =
            `${state.volume}%`;
    }

    showPlayer();
}

async function refreshState() {
    try {
        const response = await request({
            type: "GET_STATE"
        });

        if (!response?.ok) {
            if (
                response?.error ===
                "YOUTUBE_MUSIC_NOT_FOUND"
            ) {
                showStatus(
                    "Open YouTube Music to activate Music Deck."
                );

                return;
            }

            showStatus(
                "Music Deck could not reach the YouTube Music player."
            );

            return;
        }

        renderState(response.data);
    } catch (error) {
        console.error(
            "Music Deck refresh failed:",
            error
        );

        showStatus(
            "Music Deck encountered an error."
        );
    }
}

async function sendControl(type) {
    try {
        await request({ type });

        window.setTimeout(
            refreshState,
            150
        );
    } catch (error) {
        console.error(
            `Music Deck command ${type} failed:`,
            error
        );
    }
}

repeatButton.addEventListener("click", () => {
    sendControl("CYCLE_REPEAT");
});

previousButton.addEventListener("click", () => {
    sendControl("PREVIOUS");
});

playPauseButton.addEventListener("click", () => {
    sendControl("PLAY_PAUSE");
});

nextButton.addEventListener("click", () => {
    sendControl("NEXT");
});

muteButton.addEventListener("click", () => {
    sendControl("TOGGLE_MUTE");
});

seekSlider.addEventListener("input", () => {
    isSeeking = true;

    currentTimeValue.textContent =
        formatTime(Number(seekSlider.value));
});

seekSlider.addEventListener("change", async () => {
    const time = Number(seekSlider.value);

    try {
        await request({
            type: "SEEK_TO",
            time
        });
    } catch (error) {
        console.error(
            "Music Deck seek failed:",
            error
        );
    } finally {
        isSeeking = false;

        window.setTimeout(
            refreshState,
            100
        );
    }
});

volumeSlider.addEventListener("input", () => {
    isChangingVolume = true;

    volumeValue.textContent =
        `${volumeSlider.value}%`;

    request({
        type: "SET_VOLUME",
        volume: Number(volumeSlider.value)
    });
});

volumeSlider.addEventListener("change", () => {
    isChangingVolume = false;

    refreshState();
});

refreshState();

refreshTimer = window.setInterval(
    refreshState,
    500
);

window.addEventListener("unload", () => {
    if (refreshTimer !== null) {
        window.clearInterval(refreshTimer);
    }
});