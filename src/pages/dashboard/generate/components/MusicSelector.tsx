import React, { Component } from "react";
import { optionStyles } from './common';
import Select from 'react-select';
import './Timeline.scss';

interface Props {
    onChange?: (trackId: SelectedSong | null) => any;
    disabled?: boolean,
    value?: SelectedSong | null
}

export interface State {
    musicMoods: string[],
    selectedMusicMood: string,
    musicForMood: { id: string, track_name: string, artist: string, file: string }[],
    selectedMusic: SelectedSong,
}

export interface SelectedSong {
    track_name: string,
    artist: string,
    id: string,
    mood: string,
    file: string,
}

export default class MusicSelector extends Component<Props, State> {
    componentDidMount() {
        fetch("https://dub.backend.air.bespokeonhold.com/music/list/moods")
            .then(v => v.json())
            .then(v => this.setState({
                ...(this.state || {}),
                musicMoods: ["no", ...v],
                selectedMusicMood: "no",
            }));
    }

    updateMusicList(mood?: string) {
        if (!mood || mood == "no") {
            if (this.props.onChange)
                this.props.onChange(null);
            this.setState({ ...this.state, musicForMood: [], selectedMusicMood: "no" });
            return;
        }

        this.setState({ ...this.state, musicForMood: [], selectedMusicMood: mood });

        fetch(`https://dub.backend.air.bespokeonhold.com/music/list/by-mood?mood=${encodeURIComponent(mood)}`)
            .then(v => v.json())
            .then(v => {
                const songEvent = {
                    mood,
                    id: v[0].id,
                    track_name: v[0].track_name,
                    artist: v[0].artist,
                    file: v[0].file,
                };

                if (this.props.onChange)
                    this.props.onChange(songEvent);

                this.setState({ ...this.state, selectedMusicMood: mood, musicForMood: v, selectedMusic: songEvent });
            });
    }

    onSongChange(id?: string) {
        const song = id ? this.state.musicForMood.find(v => v.id == id) || this.state.musicForMood[0] : this.state.musicForMood[0];

        const songEvent = {
            mood: this.state.selectedMusicMood,
            id: song.id,
            track_name: song.track_name,
            artist: song.artist,
            file: song.file,
        };

        if (this.props.onChange)
            this.props.onChange(songEvent);

        this.setState({ ...this.state, selectedMusic: songEvent });
    }

    render() {
        if (!this.state) {
            return <>Loading...</>;
        }

        let moodSelect;
        if (!this.props.disabled) {
            moodSelect = <Select
                styles={optionStyles}
                value={{ value: this.state.selectedMusicMood, label: this.state.selectedMusicMood }}
                options={this.state.musicMoods.map(v => ({ value: v, label: v }))}
                onChange={e => this.updateMusicList(e ? e.value : undefined)}
            />;
        } else {
            moodSelect = <div className="d-inline-block" style={{ padding: '6px 16px 7px 10px', color: '#c0c0c0' }}>{this.state.selectedMusicMood || this.props.value?.mood}</div>;
        }

        let songSelect;
        if (!this.props.disabled) {
            songSelect = (this.state.musicForMood || []).length > 0 ? <>
                <Select
                    styles={optionStyles}
                    value={{ value: this.state.selectedMusic.id, label: `${this.state.selectedMusic.artist} - ${this.state.selectedMusic.track_name}` }}
                    options={this.state.musicForMood.map(v => ({ value: v.id, label: `${v.artist} - ${v.track_name}` }))}
                    onChange={e => this.onSongChange(e ? e.value : undefined)}
                />
                <div className="fs-6 mt-1">preview</div>
            </> : <></>;
        } else {
            songSelect = this.state.selectedMusicMood == 'no'
                ? <></>
                : <div className="d-inline-block"
                    style={{ padding: '6px 16px 7px 10px', color: '#c0c0c0' }}>
                    {(this.props.value || this.state.selectedMusic).artist} - {(this.props.value || this.state.selectedMusic).track_name}
                </div>;
        }

        return <>
            I want&nbsp;
            {moodSelect}
            &nbsp;music to be included{this.state.selectedMusicMood == 'no' ? '.' : ':'}&nbsp;
            {songSelect}
        </>;
    }
}