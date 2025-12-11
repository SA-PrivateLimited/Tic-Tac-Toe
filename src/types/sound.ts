export type Instrument = 'piano' | 'guitar' | 'drums' | 'synth' | 'bell' | 'none';

export interface SoundSettings {
  instrument: Instrument;
  enabled: boolean;
}

