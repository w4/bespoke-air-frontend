import React, { Component } from "react";
import { SelectedCountryVoice } from "./CountryVoiceSelector";
import _ from "lodash";
import { IoMdClose } from "react-icons/io";

declare namespace Intl {
  class DisplayNames {
    constructor(languages: [string?], opts: { type: string });
    public of: (key: string) => string;
  }
}

interface Props {
  onChange: (text: string) => any;
  onTranslate: (text: string | undefined) => any;
  onEnter: () => any;
  onCancel?: () => any;
  onDelete?: () => any;
  showCancelDeleteButtons?: boolean;
  selectedVoice?: SelectedCountryVoice;
  disabled?: boolean;
  value: string;
  translatedValue?: string;
  className?: string;
  allowedCharacters: number;
}

interface State {
  offerTranslationFrom?: string;
  isTranslating: boolean;
  dontAskTranslation: boolean;
}

export default class TtsEntry extends Component<Props, State> {
  state = {
    offerTranslationFrom: undefined,
    isTranslating: false,
    dontAskTranslation: false,
  };

  private checkShouldTranslateDebounced = _.debounce(this.checkShouldTranslateAndOffer.bind(this), 5000);
  private translateDebounced = _.debounce(this.translate.bind(this), 1000);
  private languageNamesInEnglish = new Intl.DisplayNames(["en"], {
    type: "language",
  });

  async checkShouldTranslateAndOffer() {
    if (this.state.isTranslating || this.state.dontAskTranslation || !this.props.value.length) {
      return;
    }

    const formData = new FormData();
    formData.append('key', 'AIzaSyAzyZ6QDRwANEZGQYhDYbvJeo-m72kmh60');
    formData.append('q', this.props.value);

    const resp = await fetch(`https://translation.googleapis.com/language/translate/v2/detect`, {
      method: "POST",
      body: formData,
    });
    const json = await resp.json();

    const detectedLanguage = json.data?.detections?.[0]?.[0]?.language;
    const selectedLanguage = this.props.selectedVoice?.country.value.split('-')[0];

    if (detectedLanguage !== selectedLanguage) {
      this.setState({ offerTranslationFrom: json.data?.detections?.[0]?.[0]?.language });
    } else {
      this.setState({ offerTranslationFrom: undefined });
    }
  }

  async translate() {
    if (!this.props.value.length || typeof this.state.offerTranslationFrom === undefined) {
      return;
    }

    const formData = new FormData();
    formData.append('key', 'AIzaSyAzyZ6QDRwANEZGQYhDYbvJeo-m72kmh60'); // TODO: move this to the server
    formData.append('q', this.props.value);
    formData.append('source', this.state.offerTranslationFrom ?? '');
    formData.append('target', this.props.selectedVoice?.country.value.split('-')[0] ?? '');
    formData.append('format', 'text');

    const resp = await fetch(`https://translation.googleapis.com/language/translate/v2`, {
      method: "POST",
      body: formData,
    });
    const json = await resp.json();

    if (json.data?.translations?.[0]?.translatedText) {
      this.props.onTranslate(json.data.translations[0].translatedText);
    }
  }

  render() {
    return <>
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
            if (this.props.allowedCharacters > -1 && e.target.value.length > this.props.allowedCharacters) {
              return false;
            }

            if (this.props.onChange) this.props.onChange(e.target.value);

            this.checkShouldTranslateDebounced();
            this.translateDebounced();
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

        {this.props.allowedCharacters > -1 ?
          <div
            style={{
              position: "absolute",
              right: "1.2rem",
              bottom: ".25rem",
              fontSize: ".75rem",
              color: "#707b9f",
            }}
          >
            {this.props.value.length}/{this.props.allowedCharacters}
          </div> : <></>}
      </div>

      {this.state.offerTranslationFrom && !this.state.dontAskTranslation && !this.state.isTranslating ?
        <div className={this.props.className}>
          <div className="mt-3 text-dark card shadow-sm border-0 rounded p-3">
            <div className="card-body">
              <p className="card-text">
                Your input text looks <strong>{this.languageNamesInEnglish.of(this.state.offerTranslationFrom ?? '')}</strong>, would you like us to translate it to <strong>{this.languageNamesInEnglish.of(this.props.selectedVoice?.country.value ?? '')}</strong> for you?
              </p>

              <button className="btn btn-dark me-2" onClick={() => {
                this.setState({ isTranslating: true });
                this.translate();
              }}>Translate</button>
              <button className="btn btn-danger" onClick={() => this.setState({ dontAskTranslation: true })}>Leave as-is</button>
            </div>
          </div>
        </div> : <></>}

      {this.state.isTranslating && this.props.translatedValue ?
        <div className={this.props.className}>
          <div className="mt-3 text-muted card shadow-sm border-0 rounded p-3">
            <div className="card-body position-relative">
              <div className="position-absolute top-0" style={{ right: 0 }}>
                <button type="button" className="btn text-danger" onClick={() => {
                  this.setState({ offerTranslationFrom: undefined, isTranslating: false });
                  this.props.onTranslate(undefined);
                }}>
                  <IoMdClose />
                </button>
              </div>

              {this.props.translatedValue}
            </div>
          </div>
        </div> : <></>}
    </>;
  }
}
