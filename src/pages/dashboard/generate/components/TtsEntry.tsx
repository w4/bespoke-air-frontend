import React, { Component } from "react";
import { SelectedCountryVoice } from "./CountryVoiceSelector";

interface Props {
  onChange: (text: string) => any;
  onEnter: () => any;
  onCancel?: () => any;
  onDelete?: () => any;
  showCancelDeleteButtons?: boolean;
  selectedVoice?: SelectedCountryVoice;
  disabled?: boolean;
  value: string;
  className?: string;
}

interface State {
  allowedCharacters: number;
}

export default class TtsEntry extends Component<Props, State> {
  state = {
    allowedCharacters: 500,
  };

  render() {
    return (
      <div className={this.props.className} style={{ position: "relative" }}>
        <textarea
          className={`form-control shadow-sm border-0 rounded p-3 ${this.props.disabled ? "disabled" : ""
            }`}
          rows={9}
          disabled={this.props.disabled || false}
          style={this.props.disabled ? { color: "#878787" } : {}}
          value={this.props.value}
          placeholder={
            this.props.selectedVoice
              ? `Please type what you would like ${this.props.selectedVoice.voice.name} to say and press enter.`
              : ""
          }
          onChange={(e) => {
            if (e.target.value.length > this.state.allowedCharacters) {
              return false;
            }

            if (this.props.onChange) this.props.onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && this.props.onEnter) {
              e.preventDefault();
              this.props.onEnter();
            } else if (e.key == "Escape" && this.props.onCancel) {
              e.preventDefault();
              this.props.onCancel();
            }
          }}
        />

        {this.props.showCancelDeleteButtons ? (
          <div style={{ position: "absolute", right: "1.2rem", top: ".25rem", fontSize: ".75rem" }}>
            <a href="#" onClick={() => this.props.onCancel?.()}>
              Cancel
            </a>

            <a href="#" className="ms-2 text-danger" onClick={() => this.props.onDelete?.()}>
              Delete
            </a>
          </div>
        ) : <></>}

        <div
          style={{
            position: "absolute",
            right: "1.2rem",
            bottom: ".25rem",
            fontSize: ".75rem",
            color: "#707b9f",
          }}
        >
          {this.props.value.length}/{this.state.allowedCharacters}
        </div>
      </div>
    );
  }
}
