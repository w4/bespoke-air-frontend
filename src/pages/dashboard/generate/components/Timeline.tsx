import React, { Component, Ref } from "react";
import ReactSlider from "react-slider";
import AudioManipulation, { Audio } from "../../../../lib/AudioManipulation";
import { SelectedCountryVoice } from "./CountryVoiceSelector";
import { SelectedSong } from "./MusicSelector";

enum Track {
    Voice = 1, Song = 2
}

interface Props {
    selectedSong: SelectedSong | null,
    manipulater: AudioManipulation,
}

interface State {
    voiceTrackPosition: [number, number],
    musicTrackPosition: [number, number],
    movingTrack: Track | number | false,
    loading: boolean,
}

export default class Timeline extends Component<Props, State> {
    private voiceTrackRef: Ref<any> = React.createRef();
    private musicTrackRef: Ref<any> = React.createRef();

    stopMovingTrack() {
        if (this.setState) {
            this.setState({ ...this.state, movingTrack: false });
        }
    }

    private lastXSeen: number = 0;

    moveTrack(e: MouseEvent) {
        if (!this.state || !this.state.movingTrack) {
            this.lastXSeen = 0;
            return;
        }

        let track;
        switch (+this.state.movingTrack) {
            case Track.Song: track = this.musicTrackRef ? (this.musicTrackRef as any).current : null; break;
            case Track.Voice: track = this.voiceTrackRef ? (this.voiceTrackRef as any).current : null; break;
        }

        if (!track) {
            this.lastXSeen = 0;
            return;
        }

        if (this.lastXSeen == 0) {
            this.lastXSeen = e.clientX;
        }

        if (e.clientX == this.lastXSeen) return;

        const delta = e.clientX - this.lastXSeen;
        const percentSlider = delta / (document.querySelector('.horizontal-slider') as any).getBoundingClientRect().width;

        track.setState({ pending: false });
        switch (+this.state.movingTrack) {
            case Track.Song:
                let musicNewPositionStart = Math.max(0, this.state.musicTrackPosition[0] + (track.props.max * percentSlider));
                let musicNewPositionEnd = Math.min(track.props.max, this.state.musicTrackPosition[1] + (track.props.max * percentSlider));

                if (musicNewPositionStart == 0)
                    musicNewPositionEnd = this.state.musicTrackPosition[1] - this.state.musicTrackPosition[0];

                if (musicNewPositionEnd == track.props.max)
                    musicNewPositionStart = track.props.max - (this.state.musicTrackPosition[1] - this.state.musicTrackPosition[0]);

                if (this.props.manipulater.music) {
                    this.props.manipulater.music.effects.offsetSecs = musicNewPositionStart;
                    this.props.manipulater.music.effects.duration = musicNewPositionEnd - musicNewPositionStart;
                }
                this.setState({ ...this.state, musicTrackPosition: [musicNewPositionStart, musicNewPositionEnd] });
                break;
            case Track.Voice:
                let voiceNewPositionStart = Math.min(
                    track.props.max - this.props.manipulater.getVoiceDuration(),
                    Math.max(0, this.state.voiceTrackPosition[0] + (track.props.max * percentSlider))
                );
                let voiceNewPositionEnd = voiceNewPositionStart + this.props.manipulater.getVoiceDuration();

                // if (this.props.manipulater.voice)
                //     this.props.manipulater.voice.effects.offsetSecs = voiceNewPositionStart;
                this.setState({ ...this.state, voiceTrackPosition: [voiceNewPositionStart, voiceNewPositionEnd] });
                break;
        }

        this.lastXSeen = e.clientX;
    }

    async componentDidMount() {
        this.setState({
            ...this.state,
            movingTrack: false,
            loading: false,
            musicTrackPosition: [0, this.props.manipulater.getMusicDuration()],
            voiceTrackPosition: [0, this.props.manipulater.getVoiceDuration()],
        });

        document.addEventListener('mouseup', this.stopMovingTrack.bind(this));
        document.addEventListener('mousemove', this.moveTrack.bind(this));
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.stopMovingTrack.bind(this));
        document.removeEventListener('mousemove', this.moveTrack.bind(this));
    }

    render() {
        if (!this.state || this.state.loading) {
            return <>Loading...</>
        }

        const VoiceSlider = (props: { audio: Audio }) => (
            <div className="d-flex">
                <div style={{ fontSize: '2rem', paddingRight: '10px', marginRight: '10px', borderRight: '1px solid #181d45' }}>🗣️</div>
                <ReactSlider
                    ref={this.voiceTrackRef}
                    className="horizontal-slider"
                    thumbClassName="slider-thumb"
                    trackClassName="slider-track"
                    max={Math.ceil(this.props.manipulater.getMaxDuration())}
                    defaultValue={[props.audio.effects.offsetSecs, props.audio.buffer.duration + props.audio.effects.offsetSecs]}
                    // value={this.state.voiceTrackPosition}
                    // onChange={(n: any) => props.audio.effects.offsetSecs = n[0]}
                    ariaLabel={['Voice start', 'Voice end']}
                    ariaValuetext={(state: any) => `Thumb value ${state.valueNow}`}
                    renderThumb={(props: any, state: any) => <div {...props}><div className="value">{new Date(state.valueNow * 1000).toISOString().substr(11, 8)}</div></div>}
                    renderTrack={(props: any, state: any) => state.index == 1 ?
                        <div
                            {...props}
                            onMouseDown={e => this.setState({ ...this.state, movingTrack: Track.Voice })}
                        /> : <div {...props} />}
                    snapDragDisabled={true}
                    pearling
                />
            </div>
        );

        return this.props.manipulater.music || this.props.manipulater.tts.length ? <div className="mt-3 card shadow-sm overflow-hidden border-0 rounded" >
            <div className="card-body">
                {this.props.manipulater.tts.map(v => <VoiceSlider audio={v} />)}

                {this.props.selectedSong ? <div className="d-flex">
                    <div style={{ fontSize: '2rem', paddingRight: '10px', marginRight: '10px', borderRight: '1px solid #181d45' }}>🎵</div>

                    <ReactSlider
                        ref={this.musicTrackRef}
                        className="horizontal-slider blue"
                        thumbClassName="slider-thumb"
                        trackClassName="slider-track"
                        max={Math.ceil(this.props.manipulater.getMaxDuration())}
                        defaultValue={[0, this.props.manipulater.getMusicDuration()]}
                        value={this.state.musicTrackPosition}
                        onChange={(n: any) => {
                            if (this.props.manipulater.music) {
                                this.props.manipulater.music.effects.offsetSecs = n[0];
                                this.props.manipulater.music.effects.duration = n[1] - n[0];
                            }
                            this.setState({ ...this.state, musicTrackPosition: n });
                        }}
                        ariaLabel={['Lower thumb', 'Upper thumb']}
                        ariaValuetext={(state: any) => `Thumb value ${state.valueNow}`}
                        renderThumb={(props: any, state: any) => <div {...props}><div className="value">{new Date(state.valueNow * 1000).toISOString().substr(11, 8)}</div></div>}
                        renderTrack={(props: any, state: any) => state.index == 1 ?
                            <div
                                {...props}
                                onMouseDown={e => this.setState({ ...this.state, movingTrack: Track.Song })}
                            /> : <div {...props} />}
                        snapDragDisabled={true}
                        pearling
                    />
                </div> : <></>}
            </div>
        </div> : <></>;
    }
}