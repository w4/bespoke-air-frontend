import React, { Component } from "react";
import { optionStyles } from './common';
import Select from 'react-select';

declare namespace Intl {
    class DisplayNames {
        constructor(languages: [string?], opts: { type: string });
        public of: (key: string) => string;
    }
}

interface SelectElement {
    value: string,
    label: JSX.Element,
}

/**
 * Response from API
 */
interface VoiceListResponse {
    [lang: string]: VoiceListResponseVoice[],
}

interface VoiceListResponseVoice {
    name: string,
    portrait_url: string,
}

interface Voice {
    display: JSX.Element,
    name: string,
    portraitUrl: string,
}

interface VoiceList {
    [lang: string]: { [id: string]: Voice },
}

interface Props {
    selected?: SelectedCountryVoice,
    onChange?: (arg: SelectedCountryVoice) => any,
}

interface State {
    languages?: SelectElement[];
    voices?: VoiceList,
    currentSelection: SelectedCountryVoice,
}

export class SelectedCountryVoice {
    constructor(public country: SelectedCountryVoiceCountrySelection, public voice: SelectedCountryVoiceVoiceSelection) { }

    getVoiceAsSelectElement(): SelectElement {
        return {
            value: this.voice.id,
            label: this.voice.display,
        }
    }
}

interface SelectedCountryVoiceCountrySelection {
    value: string,
    label: JSX.Element,
}

interface SelectedCountryVoiceVoiceSelection {
    id: string,
    name: string,
    display: JSX.Element,
}

export default class CountryVoiceSelector extends Component<Props, State> {
    componentDidMount() {
        fetch("https://dub.backend.air.bespokeonhold.com/voice/list")
            .then(v => v.json())
            .then(v => {
                // en-GB -> British English & sort
                const languageNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'language' });
                const languages = Object.keys(v)
                    .map(v => [v, languageNamesInEnglish.of(v)])
                    .sort()
                    .map(([code, text]) => ({ value: code, label: <>{text}</> }));

                const voices: VoiceList = {};
                for (const language of Object.keys(v)) {
                    let sortedVoices = (Object.entries(v[language]) as [string, VoiceListResponseVoice][])
                        .sort((a, b) => a[1].name == b[1].name ? 0 : a[1].name < b[1].name ? -1 : 1);

                    voices[language] = Object.fromEntries(sortedVoices.map(([key, value]) => [
                        key,
                        {
                            display: <><img src={value.portrait_url} width="55rem" /> {value.name}</>,
                            name: value.name,
                            portraitUrl: value.portrait_url,
                        }
                    ]));
                }

                // set defaults to first entry of languages and voices
                const defaultLanguage = languages[0];
                const defaultVoice = {
                    id: Object.keys(voices[defaultLanguage.value])[0],
                    name: Object.values(voices[defaultLanguage.value])[0].name,
                    display: Object.values(voices[defaultLanguage.value])[0].display,
                };

                const selectedCountryVoice = new SelectedCountryVoice(defaultLanguage, defaultVoice);

                if (this.props.onChange)
                    this.props.onChange(selectedCountryVoice);

                this.setState({
                    languages,
                    voices,
                    currentSelection: selectedCountryVoice,
                });
            });
    }

    handleSelectChange(language?: SelectElement, voice?: SelectElement) {
        if (!this.state || !this.state.languages || !this.state.voices)
            return;

        const selectLanguage = language || this.state.currentSelection.country || this.state.languages[0];

        let selectVoice = voice?.value;
        if (!selectVoice || !this.state.voices[selectLanguage.value][selectVoice]) {
            selectVoice = Object.keys(this.state.voices[selectLanguage.value])[0];
        }

        const voiceDefinition = this.state.voices[selectLanguage.value][selectVoice];

        const selectedLanguageVoice = new SelectedCountryVoice(selectLanguage, {
            id: selectVoice,
            name: voiceDefinition.name,
            display: voiceDefinition.display,
        });

        if (this.props.onChange)
            this.props.onChange(selectedLanguageVoice);

        this.setState({
            ...this.state,
            currentSelection: selectedLanguageVoice,
        });
    }

    render() {
        if (!this.state || !this.state.languages || !this.state.voices || !this.state.currentSelection) {
            return <>Loading...</>;
        }

        let languagePicker;
        if (!this.props.selected) {
            languagePicker = <Select
                styles={optionStyles}
                value={this.state.currentSelection.country}
                options={this.state.languages}
                onChange={e => this.handleSelectChange(e || undefined)}
            />;
        } else {
            languagePicker = <div className="d-inline-block" style={{ padding: '6px 16px 7px 10px', color: '#707b9f' }}>{this.props.selected.country.label}</div>;
        }

        let voicePicker;
        if (!this.props.selected) {
            voicePicker = <Select
                styles={optionStyles}
                value={this.state.currentSelection.getVoiceAsSelectElement()}
                options={Object.entries(this.state.voices[this.state.currentSelection.country.value]).map(([k, v]) => ({ value: k, label: v.display }))}
                onChange={e => this.handleSelectChange(undefined, e || undefined)}
            />;
        } else {
            voicePicker = <div className="d-inline-block" style={{ padding: '6px 16px 7px 10px', color: '#707b9f' }}>{this.props.selected.voice.display}</div>;
        }

        return <>
            I want my voiceover in&nbsp;
            {languagePicker}
            &nbsp;spoken by&nbsp;
            {voicePicker}.
        </>;
    }
}