browser.runtime.onMessage.addListener(async (message) => {
    if (message.type !== "MUSIC_DECK_REQUEST") {
        return;
    }

    const tabs = await browser.tabs.query({
        url: "https://music.youtube.com/*"
    });

    if (tabs.length === 0) {
        return {
            ok: false,
            error: "YOUTUBE_MUSIC_NOT_FOUND"
        };
    }

    const musicTab = tabs[0];

    try {
        const response = await browser.tabs.sendMessage(
            musicTab.id,
            message.payload
        );

        return {
            ok: true,
            data: response
        };
    } catch (error) {
        console.error("Music Deck content-script error:", error);

        return {
            ok: false,
            error: "CONTENT_SCRIPT_UNAVAILABLE"
        };
    }
});