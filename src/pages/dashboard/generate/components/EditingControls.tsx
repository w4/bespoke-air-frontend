import React, { Component } from "react";
import AudioSourceSettings from "./AudioSourceSettings";
import { SelectedCountryVoice } from "./CountryVoiceSelector";
import { SelectedSong } from "./MusicSelector";
import Timeline from "./Timeline";
import { State as AudioSettingsState } from "./AudioSourceSettings";
import AudioManipulation from "../../../../lib/AudioManipulation";
import TtsEntry from "./TtsEntry";
import { BASE_URL } from "../../../../Stage";

interface Props {
    selectedVoice: SelectedCountryVoice,
    selectedMusic: SelectedSong | null,
}

interface State {
    voiceSettings: AudioSettingsState,
    musicSettings: AudioSettingsState,
    loading: boolean,
    ttsEntries: string[],
}

export default class EditingControls extends Component<Props, State> {
    private audioManipulation?: AudioManipulation;

    state = {
        voiceSettings: { volume: 5, pitch: 0, tempo: 0 },
        musicSettings: { volume: 5, pitch: 0, tempo: 0 },
        loading: true,
        ttsEntries: [],
    };

    async componentDidMount() {
        let musicBytes = undefined;

        if (this.props.selectedMusic) {
            musicBytes = await fetch(this.props.selectedMusic.file)
                .then(v => v.arrayBuffer());
        }

        this.audioManipulation = new AudioManipulation(musicBytes);
        await this.audioManipulation.decodeMusic();

        (window as any).audioManipulation = this.audioManipulation;

        this.setState({
            loading: false
        });
    }

    async pushNewTts(text: string) {
        const request = {
            text,
            language: this.props.selectedVoice.country.value,
            voice: this.props.selectedVoice.voice.id
        };

        try {
            const generateResponse = await fetch(BASE_URL + "/generate", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            }).then(v => v.json());

            const voice = await fetch(BASE_URL + generateResponse.url)
                .then(v => v.arrayBuffer());

            await this.audioManipulation?.pushNewTts(voice);

            this.forceUpdate();
        } catch (e) {
            alert("TODO: failed to grab voice " + JSON.stringify(e));
        }
    }

    async play() {
        if (this.audioManipulation?.music) {
            this.audioManipulation.music.effects.volume = this.state.musicSettings.volume / 5;
        }

        if (this.audioManipulation?.tts) {
            for (const tts of this.audioManipulation.tts)
                tts.effects.volume = this.state.voiceSettings.volume / 5;
        }

        const buffer = this.audioManipulation?.render();

        if (!buffer) {
            return;
        }

        const audioCtx = new AudioContext();
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.start();
    }

    render() {
        if (!this.state || this.state.loading || !this.audioManipulation) {
            return <>Loading...</>;
        } else {
            return <>
                <div className="row mt-3">
                    <TtsEntry selectedVoice={this.props.selectedVoice} onEnter={e => this.pushNewTts(e)} />
                </div>

                <Timeline manipulater={this.audioManipulation} selectedSong={this.props.selectedMusic} />

                <div className="row text-secondary">
                    <AudioSourceSettings title="Voice Settings" onChange={voiceSettings => this.setState({ ...this.state, voiceSettings })} />
                    <AudioSourceSettings title="Music Settings" onChange={musicSettings => this.setState({ ...this.state, musicSettings })} />
                </div>

                <div className="mt-3">
                    <button className="btn btn-primary btn-lg" onClick={e => this.play()}>Play</button>
                </div>
            </>;
        }
    }
}