import React, { Component } from "react";
import AudioSourceSettings from "./AudioSourceSettings";
import { SelectedCountryVoice } from "./CountryVoiceSelector";
import { SelectedSong } from "./MusicSelector";
import Timeline from "./Timeline";
import { State as AudioSettingsState } from "./AudioSourceSettings";
import AudioManipulation from "../../../../lib/AudioManipulation";
import TtsEntry from "./TtsEntry";
import { BASE_URL } from "../../../../Stage";
import { IoIosPlay, IoIosPause } from "react-icons/io";
import { BeatLoader } from "react-spinners";

interface Props {
  selectedVoice: SelectedCountryVoice;
  selectedMusic: SelectedSong | null;
}

interface State {
  voiceSettings: AudioSettingsState;
  musicSettings: AudioSettingsState;
  loading: boolean;
  rendering: boolean;
  isPlaying: boolean;
  timeStarted: Date | null;
}

export default class EditingControls extends Component<Props, State> {
  private audioManipulation?: AudioManipulation;
  private audioContext: AudioContext = new AudioContext();
  private playingBuffer?: AudioBufferSourceNode;

  state = {
    voiceSettings: { volume: 5, pitch: 0, tempo: 0 },
    musicSettings: { volume: 5, pitch: 0, tempo: 0 },
    loading: true,
    rendering: false,
    isPlaying: false,
    timeStarted: null,
  };

  async componentDidMount() {
    this.playingBuffer?.stop();

    let musicBytes = undefined;

    if (this.props.selectedMusic) {
      musicBytes = await fetch(this.props.selectedMusic.file).then((v) =>
        v.arrayBuffer()
      );
    }

    this.audioManipulation = new AudioManipulation(musicBytes);
    await this.audioManipulation.decodeMusic();

    this.setState({
      loading: false,
      isPlaying: false,
      timeStarted: null,
    });
  }

  async componentWillUnmount() {
    await this.playingBuffer?.stop();
  }

  async pushNewTts(text: string) {
    const request = {
      text,
      language: this.props.selectedVoice.country.value,
      voice: this.props.selectedVoice.voice.id,
    };

    try {
      const generateResponse = await fetch(BASE_URL + "/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }).then((v) => v.json());

      const voice = await fetch(BASE_URL + generateResponse.url).then((v) =>
        v.arrayBuffer()
      );

      await this.audioManipulation?.pushNewTts(voice, text);

      this.forceUpdate();
    } catch (e) {
      alert("TODO: failed to grab voice " + JSON.stringify(e));
    }
  }

  async play() {
    await this.playingBuffer?.stop();

    if (this.audioManipulation?.music) {
      this.audioManipulation.music.effects.volume =
        this.state.musicSettings.volume / 5;
    }

    if (this.audioManipulation?.tts) {
      for (const tts of this.audioManipulation.tts)
        tts.effects.volume = this.state.voiceSettings.volume / 5;
    }

    const buffer = this.audioManipulation?.render();

    if (!buffer) {
      return;
    }

    this.playingBuffer = this.audioContext.createBufferSource();
    this.playingBuffer.buffer = buffer;
    this.playingBuffer.connect(this.audioContext.destination);
    this.playingBuffer.start();
    this.setState({ isPlaying: true, timeStarted: new Date() });
    this.playingBuffer.addEventListener("ended", () => this.setState({ isPlaying: false, timeStarted: null }));
  }

  render() {
    const DrawPlayButton = () => {
      if (this.state.rendering) {
        return <BeatLoader color="#36D7B7" size={5} />;
      }

      if (this.state.isPlaying) {
        return (
          <button
            className="btn btn-primary btn-lg"
            onClick={async () => {
              await this.playingBuffer?.stop();
              this.setState({ isPlaying: false, timeStarted: null, });
            }}
          >
            <IoIosPause /> Stop
          </button>
        )
      } else if (this.audioManipulation?.tts.length) {
        return (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              this.setState({ rendering: true }, () => {
                this.forceUpdate(() => {
                  setTimeout(() => {
                    // once we start the playing the main thread will block until render is complete
                    this.play()
                      .catch((e) => alert(e))
                      .finally(() => {
                        this.setState({ rendering: false })
                      });
                  }, 0);
                });
              });
            }}
          >
            <IoIosPlay /> Preview
          </button>
        );
      } else {
        return <>To continue, please enter some text above and press enter.</>;
      }
    }

    if (!this.state || this.state.loading || !this.audioManipulation) {
      return <div className="text-center mt-5">
        <BeatLoader color="#36D7B7" size={10} />
      </div>;
    } else {
      return (
        <>
          <div className="row mt-3">
            <TtsEntry
              selectedVoice={this.props.selectedVoice}
              onEnter={(e) => this.pushNewTts(e)}
            />
          </div>

          <Timeline
            selectedVoice={this.props.selectedVoice}
            manipulater={this.audioManipulation}
            selectedSong={this.props.selectedMusic}
            timeStarted={this.state.timeStarted}
          />

          <div className="row text-secondary">
            <AudioSourceSettings
              title="Voice Settings"
              onChange={(voiceSettings) =>
                this.setState({ ...this.state, voiceSettings })
              }
              disabled={this.state.isPlaying}
            />
            <AudioSourceSettings
              title="Music Settings"
              onChange={(musicSettings) =>
                this.setState({ ...this.state, musicSettings })
              }
              disabled={this.state.isPlaying}
            />
          </div>

          <div className="mt-3">
            <DrawPlayButton />
          </div>
        </>
      );
    }
  }
}
