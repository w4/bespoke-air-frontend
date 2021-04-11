import React, { Component, Ref } from "react";
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
import "./EditingControls.scss";
import { Modal, Button } from "react-bootstrap";

interface Props {
  selectedVoice: SelectedCountryVoice;
  selectedMusic: SelectedSong | null;
  audioManipulation: AudioManipulation;
  onIsReadyToRenderChange: (state: boolean) => void;
}

interface State {
  voiceSettings: AudioSettingsState;
  musicSettings: AudioSettingsState;
  loading: boolean;
  rendering: boolean;
  isPlaying: boolean;
  timeStarted: Date | null;
  ttsText: string;
  editingTts: number | null;
  isGeneratingText: boolean;
  showDeleteDialog: boolean;
}

export default class EditingControls extends Component<Props, State> {
  private audioContext: AudioContext = new AudioContext();
  private playingBuffer?: AudioBufferSourceNode;
  private timelineRef: React.RefObject<Timeline> = React.createRef();

  state = {
    voiceSettings: { volume: 5, pitch: 0, tempo: 0 },
    musicSettings: { volume: 5, pitch: 0, tempo: 0 },
    loading: true,
    rendering: false,
    isPlaying: false,
    timeStarted: null,
    ttsText: "",
    isGeneratingText: false,
    editingTts: null,
    showDeleteDialog: false,
  };

  async componentDidMount() {
    this.props.onIsReadyToRenderChange(false);

    this.playingBuffer?.stop();

    let musicBytes = undefined;

    if (this.props.selectedMusic && this.props.selectedMusic.id !== this.props.audioManipulation.music?.text) {
      const songRaw = await fetch(`${BASE_URL}/music/get/${this.props.selectedMusic.id}`);
      const song = await songRaw.json();

      musicBytes = await fetch(song.file).then((v) =>
        v.arrayBuffer()
      );
    }

    if (!this.props.selectedMusic) {
      this.props.audioManipulation.music = undefined;
      this.props.audioManipulation.musicBuffer = undefined;
    } else if (this.props.selectedMusic.id !== this.props.audioManipulation.music?.text) {
      this.props.audioManipulation.musicBuffer = musicBytes;
      await this.props.audioManipulation.decodeMusic();

      if (this.props.audioManipulation.music)
        this.props.audioManipulation.music.text = this.props.selectedMusic.id;
    }

    this.props.onIsReadyToRenderChange(!!Object.keys(this.props.audioManipulation.tts).length);

    this.setState({
      loading: false,
      isPlaying: false,
      timeStarted: null,
    });
  }

  async componentWillUnmount() {
    await this.playingBuffer?.stop();
  }

  async pushNewTts() {
    const request = {
      text: this.state.ttsText,
      language: this.props.selectedVoice.country.value,
      voice: this.props.selectedVoice.voice.id,
    };

    try {
      this.setState({ isGeneratingText: true });

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

      if (this.state.editingTts !== null) {
        const track = this.state.editingTts || 0;

        if (this.state.ttsText != this.props.audioManipulation.tts[track]?.text) {
          await this.props.audioManipulation.pushReplacementTts(track, voice, this.state.ttsText);
          this.timelineRef.current?.resetLengthOfTtsTrack(track);
        }
      } else {
        await this.props.audioManipulation.pushNewTts(voice, this.state.ttsText);
      }

      this.setState({ ttsText: "", editingTts: null });
      this.props.onIsReadyToRenderChange(true);
    } catch (e) {
      alert("TODO: failed to grab voice " + e);
    } finally {
      this.setState({ isGeneratingText: false });
    }
  }

  async play() {
    await this.playingBuffer?.stop();

    if (this.props.audioManipulation.music) {
      this.props.audioManipulation.music.effects.volume =
        this.state.musicSettings.volume / 5;
    }

    if (this.props.audioManipulation.tts) {
      for (const tts of Object.values(this.props.audioManipulation.tts))
        tts.effects.volume = this.state.voiceSettings.volume / 5;
    }

    const buffer = this.props.audioManipulation.render();

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

  handleDeleteTtsLayer() {
    if (this.state.editingTts === null) {
      this.setState({ showDeleteDialog: false });
      return;
    }

    delete this.props.audioManipulation.tts[this.state.editingTts || 0];

    this.setState({
      editingTts: null,
      ttsText: "",
      showDeleteDialog: false,
    });

    if (Object.keys(this.props.audioManipulation.tts).length === 0) {
      this.props.onIsReadyToRenderChange(false);
    }
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
      } else if (Object.keys(this.props.audioManipulation.tts).length) {
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

    if (!this.state || this.state.loading) {
      return <div className="text-center mt-5">
        <BeatLoader color="#36D7B7" size={10} />
      </div>;
    }

    return (
      <>
        <Modal centered show={this.state.showDeleteDialog} onHide={() => this.setState({ showDeleteDialog: false })}>
          <Modal.Header closeButton>
            <Modal.Title>Are you sure?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you wish to delete this text layer?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({ showDeleteDialog: false })}>
              Close
            </Button>
            <Button variant="danger" onClick={() => this.handleDeleteTtsLayer()}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="row mt-3 position-relative">
          <TtsEntry
            selectedVoice={this.props.selectedVoice}
            onEnter={() => this.pushNewTts()}
            onChange={(v) => this.setState({ ttsText: v })}
            onCancel={() => this.state.editingTts !== null ? this.setState({ ttsText: "", editingTts: null }) : null}
            onDelete={() => this.setState({ showDeleteDialog: true })}
            showCancelDeleteButtons={this.state.editingTts !== null}
            value={this.state.ttsText}
            disabled={this.state.isGeneratingText}
          />

          {this.state.isGeneratingText ? <div className="position-absolute h-100 w-100 text-center">
            <div className="position-relative" style={{ top: '50%' }}>
              <BeatLoader color="#36D7B7" size={10} />
            </div>
          </div> : <></>}
        </div>

        <Timeline
          ref={this.timelineRef}
          selectedVoice={this.props.selectedVoice}
          manipulater={this.props.audioManipulation}
          selectedSong={this.props.selectedMusic}
          timeStarted={this.state.timeStarted}
          editingTtsTrack={this.state.editingTts}
          onClickTts={(id) => this.setState({ editingTts: id, ttsText: this.props.audioManipulation.tts[id].text || "" })}
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
