const SELECTORS = {
    title: ".title.ytmusic-player-bar",
    artist: ".byline.ytmusic-player-bar",
    artwork: ".image.ytmusic-player-bar",
    previousButton: ".previous-button.ytmusic-player-bar",
    playPauseButton: "#play-pause-button",
    nextButton: ".next-button.ytmusic-player-bar",
    repeatButton: "ytmusic-player-bar .repeat"
};

function getText(selector) {
    const element = document.querySelector(selector);

    return element?.textContent?.trim() ?? "";
}

function getArtwork() {
    const image = document.querySelector(SELECTORS.artwork);

    return image?.currentSrc || image?.src || "";
}

function getMediaElement() {
    const mediaElements = Array.from(
        document.querySelectorAll("video, audio")
    );

    const playingMedia = mediaElements.find(
        (media) => !media.paused && !media.ended
    );

    if (playingMedia) {
        return playingMedia;
    }

    const loadedMedia = mediaElements.find(
        (media) =>
            Number.isFinite(media.duration) &&
            media.duration > 0
    );

    return loadedMedia ?? mediaElements[0] ?? null;
}

function getRepeatButton() {
    const directMatch = document.querySelector(
        SELECTORS.repeatButton
    );

    if (directMatch) {
        return directMatch;
    }

    const playerBar = document.querySelector(
        "ytmusic-player-bar"
    );

    if (!playerBar) {
        return null;
    }

    const buttons = playerBar.querySelectorAll(
        "button, yt-icon-button, tp-yt-paper-icon-button"
    );

    return Array.from(buttons).find((button) => {
        const label = [
            button.getAttribute("aria-label"),
            button.getAttribute("title"),
            button.querySelector("button")
                ?.getAttribute("aria-label")
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return label.includes("repeat");
    }) ?? null;
}

function getRepeatState() {
    const button = getRepeatButton();

    if (!button) {
        return "OFF";
    }

    const label = [
        button.getAttribute("aria-label"),
        button.getAttribute("title"),
        button.querySelector("button")
            ?.getAttribute("aria-label")
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    if (
        label.includes("repeat one") ||
        label.includes("repeat song") ||
        label.includes("repeat current") ||
        label.includes("turn repeat off")
    ) {
        return "ONE";
    }

    if (
        label.includes("repeat all") ||
        label.includes("repeat queue") ||
        label.includes("repeat playlist") ||
        label.includes("repeat is on")
    ) {
        return "ALL";
    }

    const pressed =
        button.getAttribute("aria-pressed") ??
        button.querySelector("button")
            ?.getAttribute("aria-pressed");

    if (pressed === "true") {
        return "ALL";
    }

    return "OFF";
}

function getPlayerState() {
    const media = getMediaElement();

    const currentTime = Number.isFinite(media?.currentTime)
        ? media.currentTime
        : 0;

    const duration = Number.isFinite(media?.duration)
        ? media.duration
        : 0;

    return {
        title: getText(SELECTORS.title),
        artist: getText(SELECTORS.artist),
        artwork: getArtwork(),
        isPlaying: media ? !media.paused : false,
        volume: media
            ? Math.round(media.volume * 100)
            : 100,
        isMuted: media?.muted ?? false,
        repeatState: getRepeatState(),
        currentTime,
        duration
    };
}

function clickControl(selector) {
    const button = document.querySelector(selector);

    if (!button) {
        return false;
    }

    button.click();

    return true;
}

function setVolume(volume) {
    const media = getMediaElement();

    if (!media) {
        return false;
    }

    const normalizedVolume = Math.min(
        1,
        Math.max(0, Number(volume) / 100)
    );

    media.volume = normalizedVolume;

    if (
        normalizedVolume > 0 &&
        media.muted
    ) {
        media.muted = false;
    }

    return true;
}

function toggleMute() {
    const media = getMediaElement();

    if (!media) {
        return false;
    }

    media.muted = !media.muted;

    return true;
}

function seekTo(time) {
    const media = getMediaElement();

    if (
        !media ||
        !Number.isFinite(media.duration) ||
        media.duration <= 0
    ) {
        return false;
    }

    const requestedTime = Number(time);

    if (!Number.isFinite(requestedTime)) {
        return false;
    }

    media.currentTime = Math.min(
        media.duration,
        Math.max(0, requestedTime)
    );

    return true;
}

function cycleRepeat() {
    const button = getRepeatButton();

    if (!button) {
        return {
            success: false,
            repeatState: "OFF"
        };
    }

    button.click();

    return {
        success: true,
        repeatState: getRepeatState()
    };
}

browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
        case "GET_STATE":
            return Promise.resolve(
                getPlayerState()
            );

        case "PLAY_PAUSE":
            return Promise.resolve({
                success: clickControl(
                    SELECTORS.playPauseButton
                )
            });

        case "PREVIOUS":
            return Promise.resolve({
                success: clickControl(
                    SELECTORS.previousButton
                )
            });

        case "NEXT":
            return Promise.resolve({
                success: clickControl(
                    SELECTORS.nextButton
                )
            });

        case "SET_VOLUME":
            return Promise.resolve({
                success: setVolume(message.volume)
            });

        case "TOGGLE_MUTE":
            return Promise.resolve({
                success: toggleMute()
            });

        case "SEEK_TO":
            return Promise.resolve({
                success: seekTo(message.time)
            });

        case "CYCLE_REPEAT":
            return Promise.resolve(
                cycleRepeat()
            );

        default:
            return Promise.resolve({
                success: false,
                error: "UNKNOWN_COMMAND"
            });
    }
});