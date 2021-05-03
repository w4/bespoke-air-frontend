import React, { Component } from "react";
import { optionStyles } from "./common";
import Select from "react-select";
import { BeatLoader } from "react-spinners";
import { ASSET_EXPIRY_TIME_SECS, BASE_URL } from "../../../../Stage";
import firebase from "firebase";
import { getAuthToken } from "../../../../useAuth";

declare namespace Intl {
  class DisplayNames {
    constructor(languages: [string?], opts: { type: string });
    public of: (key: string) => string;
  }
}

interface SelectElement {
  value: string;
  label: JSX.Element;
}

interface VoiceListResponse {
  [language: string]: {
    [voice_id: string]: VoiceListResponseVoice,
  }
}

interface VoiceListResponseVoice {
  name: string;
  portrait_url: string;
}

interface Voice {
  display: JSX.Element;
  name: string;
  portraitUrl: string;
}

interface VoiceList {
  [lang: string]: { [id: string]: Voice };
}

interface Props {
  selected: SelectedCountryVoice | null;
  disabled?: boolean;
  onChange?: (arg: SelectedCountryVoice) => any;
}

interface State {
  languages: SelectElement[];
  voices: VoiceList;
}

export class SelectedCountryVoice {
  constructor(
    public country: SelectedCountryVoiceCountrySelection,
    public voice: SelectedCountryVoiceVoiceSelection,
  ) { }

  getVoiceAsSelectElement(): SelectElement {
    return {
      value: this.voice.id,
      label: this.voice.display,
    };
  }
}

interface SelectedCountryVoiceCountrySelection {
  value: string;
  label: JSX.Element;
}

interface SelectedCountryVoiceVoiceSelection {
  id: string;
  name: string;
  display: JSX.Element;
  portraitUrl: string;
}

export default class CountryVoiceSelector extends Component<Props, State> {
  state = {
    languages: [],
    voices: {},
  } as State;

  private refreshListInterval?: ReturnType<typeof setInterval>;
  private languageNamesInEnglish = new Intl.DisplayNames(["en"], {
    type: "language",
  });

  async loadVoiceList(): Promise<{ languages: SelectElement[], voices: VoiceList }> {
    const listRaw = await fetch(`${BASE_URL}/voice/list`, {
      headers: {
        "Authorization": await getAuthToken(),
      }
    });
    const list: VoiceListResponse = await listRaw.json();

    const languages = Object.keys(list)
      .map((v) => [v, this.languageNamesInEnglish.of(v)])
      .sort()
      .map(([code, text]) => ({ value: code, label: <>{text}</> }));

    // sort voices alphabetically and map them to the correct format
    const voices: VoiceList = {};
    for (const language of Object.keys(list)) {
      const sortedVoices = Object.entries(list[language]).sort((a, b) =>
        a[1].name === b[1].name ? 0 : a[1].name < b[1].name ? -1 : 1
      );

      voices[language] = Object.fromEntries(
        sortedVoices.map(([key, value]) => [
          key,
          {
            display: (
              <>
                <img
                  alt={`${value.name}'s face`}
                  src={value.portrait_url}
                  width="55rem"
                />{" "}
                {value.name}
              </>
            ),
            name: value.name,
            portraitUrl: value.portrait_url,
          },
        ])
      );
    }

    this.setState({
      languages,
      voices,
    });

    return { languages, voices };
  }

  async componentDidMount() {
    this.refreshListInterval = setInterval(() => this.loadVoiceList(), ASSET_EXPIRY_TIME_SECS * 1000);

    const { languages, voices } = await this.loadVoiceList();

    // set defaults to first entry of languages and voices
    const defaultLanguage = languages[0];
    const defaultVoice = {
      id: Object.keys(voices[defaultLanguage.value])[0],
      name: Object.values(voices[defaultLanguage.value])[0].name,
      display: Object.values(voices[defaultLanguage.value])[0].display,
      portraitUrl: Object.values(voices[defaultLanguage.value])[0].portraitUrl,
    };

    const selectedCountryVoice = new SelectedCountryVoice(
      defaultLanguage,
      defaultVoice,
    );

    this.props.onChange?.(selectedCountryVoice);
  }

  componentWillUnmount() {
    if (this.refreshListInterval)
      clearInterval(this.refreshListInterval);
  }

  handleSelectChange(language?: SelectElement, voice?: SelectElement) {
    if (!this.state || !this.state.languages || !this.state.voices) return;

    const selectLanguage =
      language ||
      this.props.selected?.country ||
      this.state.languages[0];

    let selectVoice = voice?.value;
    if (!selectVoice || !this.state.voices[selectLanguage.value][selectVoice]) {
      selectVoice = Object.keys(this.state.voices[selectLanguage.value])[0];
    }

    const voiceDefinition = this.state.voices[selectLanguage.value][
      selectVoice
    ];

    const selectedLanguageVoice = new SelectedCountryVoice(selectLanguage, {
      id: selectVoice,
      name: voiceDefinition.name,
      display: voiceDefinition.display,
      portraitUrl: voiceDefinition.portraitUrl,
    });

    this.props.onChange?.(selectedLanguageVoice);
  }

  render() {
    const colour = '#00ecca';
    const colourDarker = '#1e9480';

    let languagePicker;
    if (!this.props.disabled) {
      languagePicker = (
        <Select
          styles={optionStyles(colour, colourDarker)}
          value={this.props.selected?.country}
          options={this.state.languages}
          placeholder="&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;"
          onChange={(e) => this.handleSelectChange(e || undefined)}
        />
      );
    } else {
      languagePicker = (
        <div
          className="d-inline-block"
          style={{ padding: "6px 16px 7px 10px", color: colourDarker }}
        >
          {this.props.selected?.country.label}
        </div>
      );
    }

    let voicePicker;
    if (!this.props.disabled) {
      voicePicker = (
        <Select
          styles={optionStyles(colour, colourDarker)}
          value={this.props.selected?.getVoiceAsSelectElement()}
          placeholder="&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;"
          options={Object.entries(
            this.state.voices[this.props.selected?.country.value || ''] || {}
          ).map(([k, v]) => ({ value: k, label: v.display }))}
          onChange={(e) => this.handleSelectChange(undefined, e || undefined)}
        />
      );
    } else {
      voicePicker = (
        <div
          className="d-inline-block"
          style={{ padding: "6px 16px 7px 10px", color: colourDarker }}
        >
          {this.props.selected?.voice.display || ''}
        </div>
      );
    }

    return (
      <>
        I want my voiceover in&nbsp;
        {languagePicker}
        &nbsp;spoken by&nbsp;
        {voicePicker}.
      </>
    );
  }
}
