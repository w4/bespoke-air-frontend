import React, { Component } from "react";
import { SelectedCountryVoice } from "./CountryVoiceSelector";

interface Props {
  onChange?: (text: string) => any;
  onEnter?: (text: string) => any;
  selectedVoice?: SelectedCountryVoice;
  disabled?: boolean;
  value?: string;
  className?: string;
}

interface State {
  text: string;
  currentCharacters: number;
  allowedCharacters: number;
}

export default class CountryVoiceSelector extends Component<Props, State> {
  state = {
    text: "",
    currentCharacters: 0,
    allowedCharacters: 500,
  };

  render() {
    return (
      <div className={this.props.className} style={{ position: "relative" }}>
        <textarea
          className={`form-control shadow-sm border-0 rounded p-3 ${
            this.props.disabled ? "disabled" : ""
          }`}
          rows={9}
          disabled={this.props.disabled || false}
          style={this.props.disabled ? { color: "#878787" } : {}}
          value={this.state ? this.state.text : "" || this.props.value}
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
            this.setState({
              currentCharacters: e.target.value.length,
              text: e.target.value,
            });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && this.props.onEnter) {
              e.preventDefault();
              this.props.onEnter(this.state.text);
              this.setState({ currentCharacters: 0, text: "" });
            }
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "1.2rem",
            bottom: ".25rem",
            fontSize: ".75rem",
            color: "#707b9f",
          }}
        >
          {this.state.currentCharacters}/{this.state.allowedCharacters}
        </div>
      </div>
    );
  }
}
