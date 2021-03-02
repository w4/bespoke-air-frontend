import React, { Ref, Component, useState, useEffect } from "react";
import Select from "react-select";
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import AudioManipulation from "../../lib/AudioManipulation";
import ReactSlider from 'react-slider';

import { optionStyles } from "./generate/components/common";
import CountryVoiceSelector, { SelectedCountryVoice } from "./generate/components/CountryVoiceSelector";
import TtsEntry from "./generate/components/TtsEntry";
import MusicSelector, { SelectedSong } from "./generate/components/MusicSelector";
import AudioSourceSettings from "./generate/components/AudioSourceSettings";
import Timeline from "./generate/components/Timeline";
import EditingControls from "./generate/components/EditingControls";

interface SelectElement {
    value: string,
    label: JSX.Element,
}

/**
 * Response from API
 */
interface VoiceListResponse {
    [lang: string]: VoiceListResponseVoice[],
}

interface VoiceListResponseVoice {
    name: string,
    portrait_url: string,
}

interface Voice {
    display: JSX.Element,
    name: string,
    portraitUrl: string,
}

interface VoiceList {
    [lang: string]: { [id: string]: Voice },
}

interface Props { }

interface State {
    step: number,
    text: string,
    musicMoods: string[],
    selectedMusicMood: string,
    loading: boolean,
    selectedMusic: SelectedSong | null,
    selectedVoice: SelectedCountryVoice,
}

class GenerateVoiceover extends Component<Props, State> {
    componentDidMount() {
        this.setState({
            ...this.state,
            step: 0
        });
    }

    render() {
        if (this.state && !this.state.loading && this.state.step == 0) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector onChange={selectedVoice => this.setState({ ...this.state, selectedVoice })} />
                    </div>
                </div>

                <div className="display-4 text-shadow row">
                    <div className="mt-5">
                        <button type="button" className="btn btn-primary btn-lg shadow-sm" onClick={e => this.setState({ ...this.state, step: 1 })}>Continue &raquo;</button>
                    </div>
                </div>
            </>)
        } else if (this.state && !this.state.loading && this.state.step == 1) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div style={{ color: '#d9d9d9' }} className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector selected={this.state.selectedVoice} />
                    </div>

                    <div className="col-md-6 ps-md-5">
                        <MusicSelector onChange={e => this.setState({ ...this.state, selectedMusic: e })} />

                        <div className="mt-5">
                            <button type="button" className="btn btn-dark btn-lg shadow-sm" style={{ marginRight: '10px' }} onClick={e => this.setState({ ...this.state, step: 0 })}>&laquo; Back</button>
                            <button type="button" className="btn btn-primary btn-lg shadow-sm" onClick={e => this.setState({ ...this.state, step: 2 })}>Continue &raquo;</button>
                        </div>
                    </div>
                </div>
            </>);
        } else if (this.state && !this.state.loading && this.state.step == 2) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div style={{ color: '#d9d9d9' }} className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector selected={this.state.selectedVoice} />
                    </div>

                    <div className="col-md-6 ps-md-5" style={{ color: '#d9d9d9' }}>
                        <MusicSelector disabled />
                    </div>
                </div>

                <EditingControls selectedVoice={this.state.selectedVoice} selectedMusic={this.state.selectedMusic} />
            </>);
        } else {
            return (
                <div>Loading...</div>)
        }
    }
}

function Home() {
    return (
        <div className="container">
            <GenerateVoiceover />
        </div>
    )
}

export default Home;