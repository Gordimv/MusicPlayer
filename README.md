# Firefox Music Deck

A lightweight Firefox extension for controlling YouTube Music without constantly switching back to the YouTube Music tab.

## Features

- Displays the current song title, artist, and album artwork.
- Play and pause the current track.
- Skip to the previous or next track.
- Control YouTube Music volume.
- Mute and unmute playback.
- Cycle YouTube Music's native repeat state between repeat off, repeat queue/playlist, and repeat current song.
- Automatically finds the currently playing YouTube Music tab.
- Automatically follows playback when another YouTube Music tab becomes the active player.
- Falls back to a loaded, active, or recently accessed YouTube Music tab when nothing is currently playing.
- Runs locally with no API key, external server, or account integration required by Music Deck.

## How It Works

Music Deck uses a Firefox content script to read and control the YouTube Music player. The background script inspects open YouTube Music tabs and routes Music Deck commands to the best player candidate.

Player selection priority:

1. Currently playing YouTube Music tab.
2. Tab with a loaded track.
3. Active YouTube Music tab.
4. Most recently accessed reachable YouTube Music tab.

This allows Music Deck to automatically follow playback across multiple YouTube Music tabs.

## Development Installation

1. Clone or download this repository.
2. Open Firefox.
3. Navigate to `about:debugging`.
4. Select **This Firefox**.
5. Click **Load Temporary Add-on...**.
6. Select `manifest.json` from the project directory.
7. Open or reload YouTube Music.
8. Start playing music and open Music Deck from the Firefox toolbar.

Temporary add-ons are intended for development and must be loaded again after Firefox restarts.

## Project Structure

```text
MusicPlayer/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.css
├── popup.js
└── README.md
