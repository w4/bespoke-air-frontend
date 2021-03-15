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

interface Props { }

interface State {
  step: number;
  selectedMusic: SelectedSong | null;
  selectedMood: string | null;
  selectedVoice: SelectedCountryVoice | null;
}

class GenerateVoiceover extends Component<Props, State> {
  state = {
    step: 0,
    selectedMood: null,
    selectedMusic: null,
    selectedVoice: null,
  };

  render() {
    if (this.state && this.state.step === 0) {
      return (
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
      return (
        <>
          <div className="display-4 text-shadow row">
            <div
              style={{ color: "#d9d9d9", cursor: "pointer" }}
              onClick={() => this.setState({ step: 0 })}
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
                  onClick={(e) => this.setState({ step: 0 })}
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
      return (
        <>
          <div className="display-4 text-shadow row">
            <div
              style={{ color: "#d9d9d9", cursor: "pointer" }}
              onClick={() => this.setState({ step: 0 })}
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
            {/*<button
              type="button"
              className="btn btn-success btn-lg shadow-sm"
            >
              <AiOutlineDownload /> Complete
            </button>*/}
          </div>
        </>
      );
    } else {
      return <div>Loading...</div>;
    }
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
