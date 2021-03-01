import React, { Component } from "react";
import { SelectedCountryVoice } from "./CountryVoiceSelector";

interface Props {
    onChange?: (text: string) => any;
    onEnter?: (text: string) => any;
    selectedVoice?: SelectedCountryVoice,
    disabled?: boolean,
    value?: string,
    className?: string,
}

interface State {
    text: string,
}

export default class CountryVoiceSelector extends Component<Props, State> {
    state = {
        text: ''
    };

    render() {
        return <div className={this.props.className}>
            <textarea
                className={`form-control shadow-sm border-0 rounded p-3 ${this.props.disabled ? 'disabled' : ''}`}
                rows={9}
                disabled={this.props.disabled || false}
                style={this.props.disabled ? { color: '#878787' } : {}}
                value={this.state ? this.state.text : '' || this.props.value}
                placeholder={this.props.selectedVoice ? `Please type what you would like ${this.props.selectedVoice.voice.name} to say and press enter.` : ''}
                onChange={e => {
                    if (this.props.onChange)
                        this.props.onChange(e.target.value);
                    this.setState({ ...this.state, text: e.target.value });
                }}
                onKeyDown={e => {
                    if (e.key == 'Enter' && this.props.onEnter) {
                        e.preventDefault();
                        this.props.onEnter(this.state.text);
                        this.setState({ ...this.state, text: '' });
                    }
                }}
            />
        </div>;
    }
}