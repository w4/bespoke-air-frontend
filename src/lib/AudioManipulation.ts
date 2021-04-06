export class Audio {
  constructor(public buffer: AudioBuffer, public effects: Effects, public text?: string) { }

  public getLength() {
    return (
      this.buffer.length + this.buffer.sampleRate * this.effects.offsetSecs
    );
  }
}

export class Effects {
  public offsetSecs = 0;
  public duration = 0;
  public volume = 1;
}

export default class AudioManipulation {
  private context: AudioContext;
  public tts: Audio[] = [];
  public music?: Audio;

  constructor(private musicBuffer?: ArrayBuffer) {
    this.context = new AudioContext();
  }

  async pushNewTts(buffer: ArrayBuffer, text: string) {
    const audio = await this.context.decodeAudioData(buffer);
    const effects = new Effects();
    effects.offsetSecs = this.getVoiceDuration();
    effects.duration = audio.duration;
    this.tts.push(new Audio(audio, effects, text));
  }

  async decodeMusic() {
    if (this.musicBuffer) {
      const audio = await this.context.decodeAudioData(this.musicBuffer);
      const effects = new Effects();
      effects.duration = audio.duration;
      this.music = new Audio(audio, effects);
    }
  }

  getVoiceDuration(): number {
    return this.tts
      .map((v) => v.effects.duration + v.effects.offsetSecs)
      .reduce((a, b) => Math.max(a, b), 0);
  }

  getMusicDuration(): number {
    return this.music?.effects.duration || 0;
  }

  getMaxDuration(): number {
    return Math.max(this.getMusicDuration(), this.getVoiceDuration());
  }

  getMaxPossibleDuration(): number {
    return Math.max(this.music?.buffer.duration || 0, this.tts.map(v => v.buffer.duration).reduce((a, b) => a + b, 0));
  }

  private getMaxPossibleLength() {
    return Math.max(
      this.music ? this.music.getLength() : 0,
      this.getVoiceDuration() * this.tts[0].buffer.sampleRate
    );
  }

  render(): AudioBuffer {
    const finalMix = this.context.createBuffer(
      2,
      this.getMaxPossibleLength(),
      this.tts[0].buffer.sampleRate
    );

    const start = window.performance.now();

    for (const input of [this.music, ...this.tts]) {
      if (!input) {
        continue;
      }

      for (let channel = 0; channel < 2; channel++) {
        const inputChannel = input.buffer.numberOfChannels < 2 ? 0 : channel;
        const inputBuffer = input.buffer.getChannelData(inputChannel);
        const inputBytesLength = input.effects.duration * input.buffer.sampleRate;
        const inputBytesOffset = input.buffer.sampleRate * Math.round(input.effects.offsetSecs);

        // get reference to final mix buffer
        const outputBuffer = finalMix.getChannelData(channel);

        // sum the buffers
        for (let i = 0; i < inputBytesLength; i++) {
          outputBuffer[i + inputBytesOffset] += inputBuffer[i] * input.effects.volume;
        }
      }
    }

    const end = window.performance.now();
    console.log("Average time:");
    console.log((end - start) / 10);

    return finalMix;
  }
}
