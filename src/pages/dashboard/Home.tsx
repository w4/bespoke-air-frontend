import { Component } from "react";

import CountryVoiceSelector, {
  SelectedCountryVoice,
} from "./generate/components/CountryVoiceSelector";
import MusicSelector, {
  SelectedSong,
} from "./generate/components/MusicSelector";
import EditingControls from "./generate/components/EditingControls";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { AiOutlineDownload } from "react-icons/ai";
import AudioManipulation from "../../lib/AudioManipulation";
import { Modal, Button } from "react-bootstrap";
import toWav from "audiobuffer-to-wav";

interface Props { }

interface State {
  step: number;
  selectedMusic: SelectedSong | null;
  selectedMood: string | null;
  selectedVoice: SelectedCountryVoice | null;
  showStepZeroAreYouSure: boolean;
}

class GenerateVoiceover extends Component<Props, State> {
  state = {
    step: 0,
    selectedMood: null,
    selectedMusic: null,
    selectedVoice: null,
    showStepZeroAreYouSure: false,
  };

  private audioManipulation: AudioManipulation = new AudioManipulation(undefined);

  goToStepZero() {
    if (this.audioManipulation.tts.length == 0) {
      this.setState({ step: 0 });
      return;
    }

    this.setState({ showStepZeroAreYouSure: true });
  }

  continueToStepZero() {
    this.audioManipulation.tts = [];
    this.setState({ step: 0, showStepZeroAreYouSure: false });
  }

  async doDownload() {
    const buffer = toWav(this.audioManipulation.render());

    const url = URL.createObjectURL(new Blob([buffer]));
    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', `Air Voiceover ${new Date().toLocaleString().replace("/", "_")}.wav`);

    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }

  render() {
    let stepContent;

    if (this.state && this.state.step === 0) {
      stepContent = (
        <>
          <div className="display-4 text-shadow row">
            <div className="col-md-6 border-md-end pe-md-5">
              <CountryVoiceSelector
                selected={this.state.selectedVoice}
                onChange={(selectedVoice) => this.setState({ selectedVoice })}
              />
            </div>
          </div>

          <div className="display-4 text-shadow row">
            <div className="mt-5">
              <button
                type="button"
                className="btn btn-primary btn-lg shadow-sm"
                onClick={(e) => this.setState({ step: 1 })}
              >
                Continue <FaArrowRight />
              </button>
            </div>
          </div>
        </>
      );
    } else if (this.state && this.state.step === 1) {
      stepContent = (
        <>
          <div className="display-4 text-shadow row">
            <div
              style={{ color: "#d9d9d9", cursor: "pointer" }}
              onClick={() => this.goToStepZero()}
              className="col-md-6 border-md-end pe-md-5"
            >
              <CountryVoiceSelector
                selected={this.state.selectedVoice}
              />
            </div>

            <div className="col-md-6 ps-md-5">
              <MusicSelector
                selected={this.state.selectedMusic}
                selectedMood={this.state.selectedMood}
                onChange={(e) => this.setState({ selectedMusic: e })}
                onMoodChange={(e) => this.setState({ selectedMood: e })}
              />

              <div className="mt-5">
                <button
                  type="button"
                  className="btn btn-dark btn-lg shadow-sm"
                  style={{ marginRight: "10px" }}
                  onClick={(e) => this.goToStepZero()}
                >
                  <FaArrowLeft /> Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg shadow-sm"
                  onClick={(e) => this.setState({ step: 2 })}
                >
                  Continue <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </>
      );
    } else if (this.state && this.state.step === 2) {
      stepContent = (
        <>
          <div className="display-4 text-shadow row">
            <div
              style={{ color: "#d9d9d9", cursor: "pointer" }}
              onClick={() => this.goToStepZero()}
              className="col-md-6 border-md-end pe-md-5"
            >
              <CountryVoiceSelector
                disabled
                selected={this.state.selectedVoice as any}
              />
            </div>

            <div
              className="col-md-6 ps-md-5"
              style={{ color: "#d9d9d9", cursor: "pointer" }}
              onClick={() => this.setState({ step: 1 })}
            >
              <MusicSelector selected={this.state.selectedMusic} selectedMood={this.state.selectedMood} disabled />
            </div>
          </div>

          <EditingControls
            selectedVoice={this.state.selectedVoice as any}
            selectedMusic={this.state.selectedMusic}
            audioManipulation={this.audioManipulation}
          />

          <div className="mt-5">
            <button
              type="button"
              className="btn btn-dark btn-lg shadow-sm"
              style={{ marginRight: "10px" }}
              onClick={(e) => this.setState({ step: 1 })}
            >
              <FaArrowLeft /> Back
            </button>
            <button
              type="button"
              className="btn btn-success btn-lg shadow-sm"
              onClick={() => this.doDownload()}
            >
              <AiOutlineDownload /> Complete
            </button>
          </div>
        </>
      );
    } else {
      return <div>Loading...</div>;
    }

    return <>
      <Modal centered show={this.state.showStepZeroAreYouSure} onHide={() => this.setState({ showStepZeroAreYouSure: false })}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your voice layers will be removed by going back to the select a voice step, are you sure you wish to continue?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => this.setState({ showStepZeroAreYouSure: false })}>
            Close
          </Button>
          <Button variant="danger" onClick={() => this.continueToStepZero()}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      {stepContent}
    </>;
  }
}

function Home() {
  return (
    <div className="container">
      <GenerateVoiceover />
    </div>
  );
}

export default Home;
