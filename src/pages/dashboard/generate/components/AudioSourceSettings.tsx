import React, { Component } from "react";

interface Props {
  title: string;
  onChange?: (state: State) => any;
}

export interface State {
  volume: number;
  pitch: number;
  tempo: number;
}

export default class AudioSourceSettings extends Component<Props, State> {
  state = {
    volume: 5,
    pitch: 0,
    tempo: 0,
  };

  updateStateAndSendEvent(state: State) {
    this.setState(state);

    if (this.props.onChange) this.props.onChange(state);
  }

  render() {
    return (
      <div className="col-md-6">
        <div className="mt-3 card shadow-sm overflow-hidden border-0 rounded">
          <div className="card-header p-3">
            <strong>{this.props.title}</strong>
          </div>

          <div className="card-body">
            <div>
              <label htmlFor="volume" className="form-label">
                Volume
              </label>
              <div className="d-inline-block float-end">
                <strong>{this.state.volume}</strong>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={this.state.volume}
                onChange={(e) =>
                  this.updateStateAndSendEvent({
                    ...this.state,
                    volume: Number.parseFloat(e.currentTarget.value),
                  })
                }
                className="form-range"
                id="volume"
              />
            </div>

            {/*<div>
                        <label htmlFor="pitch" className="form-label">Pitch</label>
                        <div className="d-inline-block float-end"><strong>{this.state.pitch}</strong></div>
                        <input type="range" min={-5} max={5} step={0.1}
                            value={this.state.pitch}
                            onChange={e => this.updateStateAndSendEvent({ ...this.state, pitch: Number.parseFloat(e.currentTarget.value) })}
                            className="form-range" id="pitch" />
                    </div>

                    <div>
                        <label htmlFor="tempo" className="form-label">Tempo</label>
                        <div className="d-inline-block float-end"><strong>{this.state.tempo}</strong></div>
                        <input type="range" min={-5} max={5} step={0.1}
                            value={this.state.tempo}
                            onChange={e => this.updateStateAndSendEvent({ ...this.state, tempo: Number.parseFloat(e.currentTarget.value) })}
                            className="form-range" id="tempo" />
                    </div>*/}
          </div>
        </div>
      </div>
    );
  }
}
