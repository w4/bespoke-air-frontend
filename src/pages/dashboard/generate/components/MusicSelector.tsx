import React, { Component } from "react";
import { optionStyles } from "./common";
import Select from "react-select";
import "./Timeline.scss";
import { BASE_URL } from "../../../../Stage";

interface Props {
  onChange?: (trackId: SelectedSong | null) => void;
  onMoodChange?: (mood: string | null) => void;
  disabled?: boolean;
  selected: SelectedSong | null;
  selectedMood?: string | null;
}

export interface State {
  musicMoods: string[];
  musicForMood: {
    id: string;
    track_name: string;
    artist: string;
    file: string;
  }[];
}

export interface SelectedSong {
  track_name: string;
  artist: string;
  id: string;
  mood: string;
  file: string;
}

export default class MusicSelector extends Component<Props, State> {
  state = {
    musicMoods: [],
    musicForMood: [],
  } as State;

  componentDidMount(): void {
    fetch("https://dub.backend.air.bespokeonhold.com/music/list/moods")
      .then((v) => v.json())
      .then((v) => this.setState({ musicMoods: ["no", ...v] }))
      .catch((e) => alert(e));

    if (!this.props.selectedMood) {
      this.props.onMoodChange?.("no");
    } else if (this.props.selectedMood !== 'no') {
      this.updateMusicList(this.props.selectedMood);
    }
  }

  updateMusicList(mood?: string) {
    if (!mood || mood === "no") {
      this.props.onChange?.(null);
      this.props.onMoodChange?.("no");
      this.setState({ musicForMood: [] });
      return;
    }

    this.setState({ musicForMood: [] });
    this.props.onMoodChange?.(mood);
    this.props.onChange?.(null);

    fetch(
      `${BASE_URL}/music/list/by-mood?mood=${encodeURIComponent(
        mood
      )}`
    )
      .then((v) => v.json())
      .then((v) => {
        const songEvent = {
          mood,
          id: v[0].id,
          track_name: v[0].track_name,
          artist: v[0].artist,
          file: v[0].file,
        };

        this.props.onChange?.(songEvent);
        this.props.onMoodChange?.(mood);

        this.setState({ musicForMood: v });
      });
  }

  async onSongChange(id?: string) {
    if (!id) {
      id = this.state.musicForMood[0].id;
    }

    const songRaw = await fetch(`${BASE_URL}/music/get/${id}`);
    const song = await songRaw.json();

    const songEvent = {
      mood: this.props.selectedMood || 'no',
      id: song.id,
      track_name: song.track_name,
      artist: song.artist,
      file: song.file,
    };

    this.props.onChange?.(songEvent);
  }

  render() {
    let moodSelect;
    if (!this.props.disabled) {
      moodSelect = (
        <Select
          styles={optionStyles}
          value={{
            value: this.props.selectedMood,
            label: this.props.selectedMood,
          }}
          placeholder="&nbsp; &nbsp;"
          options={(this.state.musicMoods || []).map((v) => ({ value: v, label: v }))}
          onChange={(e) => this.updateMusicList(e?.value || 'no')}
        />
      );
    } else {
      moodSelect = (
        <div
          className="d-inline-block"
          style={{ padding: "6px 16px 7px 10px", color: "#707b9f" }}
        >
          {this.props.selectedMood || this.props.selected?.mood}
        </div>
      );
    }

    let songSelect;
    if (!this.props.disabled) {
      songSelect =
        this.props.selectedMood !== 'no' ? (
          <>
            <Select
              styles={optionStyles}
              value={this.props.selected ? {
                value: this.props.selected.id,
                label: `${this.props.selected.artist} - ${this.props.selected.track_name}`,
              } : null}
              options={this.state.musicForMood.map((v) => ({
                value: v.id,
                label: `${v.artist} - ${v.track_name}`,
              }))}
              placeholder="&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; "
              onChange={(e) => this.onSongChange(e ? e.value : undefined)}
            />
            {this.props.selected ? <div className="fs-6 mt-4">
              <audio src={this.props.selected.file} preload="auto" controls />
            </div> : <></>}
          </>
        ) : (
            <></>
          );
    } else {
      songSelect =
        this.props.selectedMood === "no" ? (
          <></>
        ) : (
            <div
              className="d-inline-block"
              style={{ padding: "6px 16px 7px 10px", color: "#707b9f" }}
            >
              {this.props.selected?.artist} -{" "}
              {this.props.selected?.track_name}
            </div>
          );
    }

    return (
      <>
        I want&nbsp;
        {moodSelect}
        &nbsp;music to be included
        {this.props.selectedMood === "no" ? "." : ":"}&nbsp;
        {songSelect}
      </>
    );
  }
}
