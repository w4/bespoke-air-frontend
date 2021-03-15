import React, { Component, Ref } from "react";
import ReactSlider from "react-slider";
import AudioManipulation, { Audio } from "../../../../lib/AudioManipulation";
import { SelectedSong } from "./MusicSelector";
import { MdRecordVoiceOver, MdMusicNote } from "react-icons/md";

interface Props {
  selectedSong: SelectedSong | null;
  manipulater: AudioManipulation;
}

interface State {
  voiceTrackPosition: [number, number][];
  musicTrackPosition: [number, number];
  movingTrack: number | false;
}

const SONG_TRACK_ID = 999;

export default class Timeline extends Component<Props, State> {
  state = {
    movingTrack: false,
    musicTrackPosition: [0, this.props.manipulater.getMusicDuration()] as [number, number],
    voiceTrackPosition: [],
  } as State;

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
  }

  componentWillUnmount() {
    document.removeEventListener("mouseup", this.stopMovingTrack.bind(this));
    document.removeEventListener("mousemove", this.moveTrack.bind(this));
  }

  render() {
    const VoiceSlider = (props: { id: number; audio: Audio }) => {
      const sliderId = props.id;
      return (
        <div className="d-flex">
          <div
            style={{
              fontSize: "2rem",
              paddingRight: "10px",
              marginRight: "10px",
              borderRight: "1px solid #181d45",
              color: '#4CAF50'
            }}
          >
            <MdRecordVoiceOver />
          </div>
          <ReactSlider
            ref={(e) => {
              this.voiceTrackRefs[props.id] = e;
            }}
            className="horizontal-slider voice-slider"
            thumbClassName="slider-thumb"
            trackClassName="slider-track"
            max={Math.ceil(this.props.manipulater.getMaxPossibleDuration())}
            defaultValue={[
              props.audio.effects.offsetSecs,
              props.audio.buffer.duration + props.audio.effects.offsetSecs,
            ]}
            value={this.state.voiceTrackPosition[props.id]}
            // onChange={(n: any) => props.audio.effects.offsetSecs = n[0]}
            ariaLabel={["Voice start", "Voice end"]}
            ariaValuetext={(state: any) => `Thumb value ${state.valueNow}`}
            step={0.0000000000000001}
            renderThumb={(props: any, state: any) => (
              <div {...props}>
                <div className="value">
                  {new Date(state.valueNow * 1000).toISOString().substr(11, 8)}
                </div>
              </div>
            )}
            renderTrack={(props: any, state: any) =>
              state.index === 1 ? (
                <div
                  {...props}
                  onMouseDown={(e) => this.setState({ movingTrack: sliderId })}
                />
              ) : (
                  <div {...props} />
                )
            }
            snapDragDisabled={true}
            pearling
          />
        </div>
      );
    };

    return this.props.manipulater.music || this.props.manipulater.tts.length ? (
      <div className="mt-3 card shadow-sm overflow-hidden border-0 rounded">
        <div className="card-body">
          {this.props.manipulater.tts.map((v, id) => (
            <VoiceSlider key={id} id={id} audio={v} />
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
