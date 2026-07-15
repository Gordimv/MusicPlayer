const SELECTORS = {
    playerBar: "ytmusic-player-bar",
    title: ".title.ytmusic-player-bar",
    artist: ".byline.ytmusic-player-bar",
    artwork: ".image.ytmusic-player-bar",
    previousButton: ".previous-button.ytmusic-player-bar",
    playPauseButton: "#play-pause-button",
    nextButton: ".next-button.ytmusic-player-bar"
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
    return document.querySelector("video");
}

function getPlayerState() {
    const media = getMediaElement();

    return {
        title: getText(SELECTORS.title),
        artist: getText(SELECTORS.artist),
        artwork: getArtwork(),
        isPlaying: media ? !media.paused : false
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

browser.runtime.onMessage.addListener((message) => {
    switch (message.type) {
        case "GET_STATE":
            return Promise.resolve(getPlayerState());

        case "PLAY_PAUSE":
            return Promise.resolve({
                success: clickControl(SELECTORS.playPauseButton)
            });

        case "PREVIOUS":
            return Promise.resolve({
                success: clickControl(SELECTORS.previousButton)
            });

        case "NEXT":
            return Promise.resolve({
                success: clickControl(SELECTORS.nextButton)
            });

        default:
            return Promise.resolve({
                success: false,
                error: "UNKNOWN_COMMAND"
            });
    }
});