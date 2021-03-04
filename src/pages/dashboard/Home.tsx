import { Component } from "react";

import CountryVoiceSelector, { SelectedCountryVoice } from "./generate/components/CountryVoiceSelector";
import MusicSelector, { SelectedSong } from "./generate/components/MusicSelector";
import EditingControls from "./generate/components/EditingControls";

interface Props { }

interface State {
    step: number,
    selectedMusic: SelectedSong | null,
    selectedVoice: SelectedCountryVoice | null,
}

class GenerateVoiceover extends Component<Props, State> {
    state = {
        step: 0,
        selectedMusic: null,
        selectedVoice: null,
    };

    render() {
        if (this.state && this.state.step === 0) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector onChange={selectedVoice => this.setState({ selectedVoice })} />
                    </div>
                </div>

                <div className="display-4 text-shadow row">
                    <div className="mt-5">
                        <button type="button" className="btn btn-primary btn-lg shadow-sm" onClick={e => this.setState({ step: 1 })}>Continue &raquo;</button>
                    </div>
                </div>
            </>)
        } else if (this.state && this.state.step === 1) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div style={{ color: '#d9d9d9' }} className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector selected={this.state.selectedVoice as any} />
                    </div>

                    <div className="col-md-6 ps-md-5">
                        <MusicSelector onChange={e => this.setState({ selectedMusic: e })} />

                        <div className="mt-5">
                            <button type="button" className="btn btn-dark btn-lg shadow-sm" style={{ marginRight: '10px' }} onClick={e => this.setState({ step: 0 })}>&laquo; Back</button>
                            <button type="button" className="btn btn-primary btn-lg shadow-sm" onClick={e => this.setState({ step: 2 })}>Continue &raquo;</button>
                        </div>
                    </div>
                </div>
            </>);
        } else if (this.state && this.state.step === 2) {
            return (<>
                <div className="display-4 text-shadow row">
                    <div style={{ color: '#d9d9d9' }} className="col-md-6 border-md-end pe-md-5">
                        <CountryVoiceSelector selected={this.state.selectedVoice as any} />
                    </div>

                    <div className="col-md-6 ps-md-5" style={{ color: '#d9d9d9' }}>
                        <MusicSelector disabled />
                    </div>
                </div>

                <EditingControls selectedVoice={this.state.selectedVoice as any} selectedMusic={this.state.selectedMusic} />
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