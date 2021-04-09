import React, { Component, Ref } from "react";
import ReactSlider from "react-slider";
import AudioManipulation, { Audio } from "../../../../lib/AudioManipulation";
import { SelectedSong } from "./MusicSelector";
import { MdRecordVoiceOver, MdMusicNote } from "react-icons/md";
import { SelectedCountryVoice } from "./CountryVoiceSelector";

interface Props {
  selectedSong: SelectedSong | null;
  editingTtsTrack: number | null;
  selectedVoice: SelectedCountryVoice;
  manipulater: AudioManipulation;
  timeStarted: Date | null;
  onClickTts: (id: number) => void;
}

interface State {
  voiceTrackPosition: [number, number][];
  musicTrackPosition: [number, number];
  movingTrack: number | false;
  currentTimeAsString?: string;
}

const SONG_TRACK_ID = 999;

export default class Timeline extends Component<Props, State> {
  state = {
    movingTrack: false,
    musicTrackPosition: [0, this.props.manipulater.getMusicDuration()] as [number, number],
    voiceTrackPosition: [],
  } as State;

  private requestRef: React.MutableRefObject<any> = React.createRef();
  private voiceTrackRefs: any[] = [];
  private musicTrackRef: Ref<any> = React.createRef();

  stopMovingTrack() {
    if (this.setState) {
      this.setState({ movingTrack: false });
    }
  }

  private lastXSeen = 0;

  moveTrack(e: MouseEvent) {
    if (
      !this.state ||
      this.state.movingTrack === null ||
      this.state.movingTrack === false
    ) {
      this.lastXSeen = 0;
      return;
    }

    let track;
    if (this.state.movingTrack === SONG_TRACK_ID) {
      track = this.musicTrackRef ? (this.musicTrackRef as any).current : null;
    } else {
      track = this.voiceTrackRefs
        ? this.voiceTrackRefs[this.state.movingTrack]
        : null;
    }

    if (!track) {
      this.lastXSeen = 0;
      return;
    }

    if (this.lastXSeen === 0) {
      this.lastXSeen = e.clientX;
    }

    if (e.clientX === this.lastXSeen) return;

    const slider = document.querySelector(".horizontal-slider");
    if (!slider) return;

    const delta = e.clientX - this.lastXSeen;
    const percentSlider = delta / slider.getBoundingClientRect().width;

    if (this.state.movingTrack === SONG_TRACK_ID) {
      let musicNewPositionStart = Math.max(
        0,
        this.state.musicTrackPosition[0] + track.props.max * percentSlider
      );
      let musicNewPositionEnd = Math.min(
        track.props.max,
        this.state.musicTrackPosition[1] + track.props.max * percentSlider
      );

      if (musicNewPositionStart === 0)
        musicNewPositionEnd =
          this.state.musicTrackPosition[1] - this.state.musicTrackPosition[0];

      if (musicNewPositionEnd === track.props.max)
        musicNewPositionStart =
          track.props.max -
          (this.state.musicTrackPosition[1] -
            this.state.musicTrackPosition[0]);

      if (this.props.manipulater.music) {
        this.props.manipulater.music.effects.offsetSecs = musicNewPositionStart;
        this.props.manipulater.music.effects.duration =
          musicNewPositionEnd - musicNewPositionStart;
      }
      this.setState({
        musicTrackPosition: [musicNewPositionStart, musicNewPositionEnd],
      });
    } else {
      const currentTrackPosition =
        this.state.voiceTrackPosition[this.state.movingTrack] ||
        track.state.value;

      const voiceNewPositionStart = Math.min(
        track.props.max -
        this.props.manipulater.tts[this.state.movingTrack].buffer.duration,
        Math.max(0, currentTrackPosition[0] + track.props.max * percentSlider)
      );
      const voiceNewPositionEnd =
        voiceNewPositionStart +
        this.props.manipulater.tts[this.state.movingTrack].buffer.duration;

      if (this.props.manipulater.tts[this.state.movingTrack])
        this.props.manipulater.tts[
          this.state.movingTrack
        ].effects.offsetSecs = voiceNewPositionStart;

      const newVoiceTrackPosition = this.state.voiceTrackPosition;
      newVoiceTrackPosition[this.state.movingTrack] = [
        voiceNewPositionStart,
        voiceNewPositionEnd,
      ];

      this.setState({ voiceTrackPosition: newVoiceTrackPosition });
    }

    track.setState({ pending: false });

    this.lastXSeen = e.clientX;
  }

  async componentDidMount() {
    document.addEventListener("mouseup", this.stopMovingTrack.bind(this));
    document.addEventListener("mousemove", this.moveTrack.bind(this));
    this.requestRef.current = requestAnimationFrame(this.updateTimer.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.stopMovingTrack.bind(this));
    document.removeEventListener("mousemove", this.moveTrack.bind(this));

    cancelAnimationFrame(this.requestRef.current);
  }

  dateToSeconds(date: Date) { return date.toISOString().substr(11, 8); }

  updateTimer() {
    this.requestRef.current = requestAnimationFrame(this.updateTimer.bind(this));

    if (this.props.timeStarted) {
      const currentTimeAsString = this.dateToSeconds(new Date(new Date().getTime() - this.props.timeStarted.getTime()));
      this.setState({ currentTimeAsString });
    } else if (this.state.currentTimeAsString) {
      this.setState({ currentTimeAsString: undefined });
    }
  }

  resetLengthOfTtsTrack(track: number) {
    const audio = this.props.manipulater.tts[track];

    const newVoiceTrackPosition = this.state.voiceTrackPosition;
    newVoiceTrackPosition[track] = [
      audio.effects.offsetSecs,
      audio.buffer.duration + audio.effects.offsetSecs,
    ];

    this.setState({ voiceTrackPosition: newVoiceTrackPosition });
  }

  render() {
    const durationPercentage = this.props.timeStarted ? (
      (new Date().getTime() - this.props.timeStarted.getTime())
      / (this.props.manipulater.getMaxDuration() * 1000)
    ) * 100 : 0;
    const durationAsString = this.dateToSeconds(new Date(this.props.manipulater.getMaxDuration() * 1000));

    return this.props.manipulater.music || this.props.manipulater.tts.length ? (
      <div className="mt-3 card shadow-sm overflow-hidden border-0 rounded">
        <div className="card-body position-relative">
          <div className="text-end text-black-50"
            style={{
              fontSize: ".75rem",
              color: "#707b9f",
            }}>
            {this.state.currentTimeAsString || "00:00:00"}/{durationAsString}
          </div>

          {this.props.timeStarted ?
            <div className="position-absolute h-100 w-100" style={{ paddingLeft: '3.3rem', paddingRight: '2rem', zIndex: 100, top: 0 }}>
              <div style={{
                position: "relative",
                width: "1px",
                height: "100%",
                background: "red",
                marginLeft: `${durationPercentage}%`
              }} />
            </div> : <></>}

          {this.props.manipulater.tts.map((audio, id) => (
            <div className="d-flex" key={id}>
              <div
                style={{
                  fontSize: "2rem",
                  paddingRight: "10px",
                  marginRight: "10px",
                  borderRight: "1px solid #181d45",
                  color: "#4CAF50",
                }}
              >
                <img onClick={() => this.props.onClickTts(id)}
                  alt={this.props.selectedVoice.voice.name}
                  src={this.props.selectedVoice.voice.portraitUrl}
                  style={{ width: "2rem", cursor: "pointer" }}
                />
              </div>
              <ReactSlider
                ref={(e) => {
                  this.voiceTrackRefs[id] = e;
                }}
                className={`horizontal-slider voice-slider ${this.props.editingTtsTrack === id ? 'voice-slider-editing' : ''}`}
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                max={this.props.manipulater.getMaxPossibleDuration()}
                defaultValue={[
                  audio.effects.offsetSecs,
                  audio.buffer.duration + audio.effects.offsetSecs,
                ]}
                value={this.state.voiceTrackPosition[id]}
                // onChange={(n: any) => props.audio.effects.offsetSecs = n[0]}
                ariaLabel={["Voice start", "Voice end"]}
                ariaValuetext={(state: any) => `Thumb value ${state.valueNow}`}
                step={0.0000000000000001}
                renderThumb={(props: any, state: any) => (
                  <div {...props}>
                    <div className="value">
                      {this.dateToSeconds(new Date(state.valueNow * 1000))}
                    </div>
                  </div>
                )}
                renderTrack={(props: any, state: any) =>
                  state.index === 1 ? (
                    <div
                      {...props}
                      onMouseDown={(e) => this.setState({ movingTrack: id })}
                    />
                  ) : (
                      <div {...props} />
                    )
                }
                snapDragDisabled={true}
                pearling
              />
            </div>
          ))}

          {this.props.selectedSong ? (
            <div className="d-flex">
              <div
                style={{
                  fontSize: "2rem",
                  paddingRight: "10px",
                  marginRight: "10px",
                  borderRight: "1px solid #181d45",
                  color: "#03A9F4",
                }}
              >
                <MdMusicNote />
              </div>

              <ReactSlider
                ref={this.musicTrackRef}
                className="horizontal-slider blue"
                thumbClassName="slider-thumb"
                trackClassName="slider-track"
                step={0.0000000000000001}
                max={Math.ceil(this.props.manipulater.getMaxPossibleDuration())}
                defaultValue={[0, this.props.manipulater.getMusicDuration()]}
                value={this.state.musicTrackPosition}
                onChange={(n: any) => {
                  if (this.props.manipulater.music) {
                    this.props.manipulater.music.effects.offsetSecs = n[0];
                    this.props.manipulater.music.effects.duration = n[1] - n[0];
                  }
                  this.setState({ musicTrackPosition: n });
                }}
                ariaLabel={["Lower thumb", "Upper thumb"]}
                ariaValuetext={(state: any) => `Thumb value ${state.valueNow}`}
                renderThumb={(props: any, state: any) => (
                  <div {...props}>
                    <div className="value">
                      {new Date(state.valueNow * 1000)
                        .toISOString()
                        .substr(11, 8)}
                    </div>
                  </div>
                )}
                renderTrack={(props: any, state: any) =>
                  state.index === 1 ? (
                    <div
                      {...props}
                      onMouseDown={(e) =>
                        this.setState({ movingTrack: SONG_TRACK_ID })
                      }
                    />
                  ) : (
                      <div {...props} />
                    )
                }
                snapDragDisabled={true}
                pearling
              />
            </div>
          ) : (
              <></>
            )}
        </div>
      </div>
    ) : (
        <></>
      );
  }
}
