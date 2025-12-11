#!/usr/bin/env python3
"""
Generate simple sound files for Tic Tac Toe game instruments.
Uses numpy and scipy to generate audio tones.
"""

import numpy as np
from scipy.io import wavfile
import os

# Audio parameters
SAMPLE_RATE = 44100
DURATION = 0.3  # 300ms

def generate_tone(frequency, duration, sample_rate, wave_type='sine'):
    """Generate a tone with the given frequency."""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    
    if wave_type == 'sine':
        wave = np.sin(2 * np.pi * frequency * t)
    elif wave_type == 'square':
        wave = np.sign(np.sin(2 * np.pi * frequency * t))
    elif wave_type == 'sawtooth':
        wave = 2 * (t * frequency - np.floor(t * frequency + 0.5))
    else:
        wave = np.sin(2 * np.pi * frequency * t)
    
    # Apply envelope (fade in/out)
    envelope = np.ones_like(wave)
    fade_samples = int(0.05 * sample_rate)  # 50ms fade
    envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
    envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
    
    wave = wave * envelope
    
    # Normalize to 16-bit range
    wave = np.clip(wave, -1, 1)
    wave = (wave * 32767).astype(np.int16)
    
    return wave

def generate_piano():
    """Piano: C major chord (C-E-G)"""
    c = generate_tone(261.63, DURATION, SAMPLE_RATE, 'sine')  # C4
    e = generate_tone(329.63, DURATION, SAMPLE_RATE, 'sine')  # E4
    g = generate_tone(392.00, DURATION, SAMPLE_RATE, 'sine')  # G4
    wave = (c * 0.4 + e * 0.3 + g * 0.3).astype(np.int16)
    return wave

def generate_guitar():
    """Guitar: Plucked string sound with realistic harmonics"""
    # E4 note (open E string on guitar)
    fundamental = 329.63  # E4
    
    # Generate harmonics (fundamental + overtones)
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    
    # Fundamental and harmonics
    wave1 = np.sin(2 * np.pi * fundamental * t)  # Fundamental
    wave2 = np.sin(2 * np.pi * fundamental * 2 * t)  # 2nd harmonic
    wave3 = np.sin(2 * np.pi * fundamental * 3 * t)  # 3rd harmonic
    wave4 = np.sin(2 * np.pi * fundamental * 4 * t)  # 4th harmonic
    
    # Mix harmonics with realistic amplitudes
    wave = wave1 * 0.5 + wave2 * 0.25 + wave3 * 0.15 + wave4 * 0.10
    
    # Apply realistic pluck envelope (very quick attack, exponential decay)
    # Quick attack (5ms), then exponential decay
    attack_samples = int(0.005 * SAMPLE_RATE)  # 5ms attack
    decay_samples = len(wave) - attack_samples
    
    envelope = np.ones_like(wave)
    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)  # Quick attack
    envelope[attack_samples:] = np.exp(-np.linspace(0, 8, decay_samples))  # Exponential decay
    
    wave = wave * envelope
    
    # Normalize and convert
    wave = np.clip(wave, -1, 1)
    wave = (wave * 32767).astype(np.int16)
    return wave

def generate_drums():
    """Drums: Kick drum sound"""
    # Low frequency pulse
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    # Exponential decay from high to low frequency
    freq_sweep = 200 * np.exp(-t * 15)
    wave = np.sin(2 * np.pi * freq_sweep * t)
    
    # Add noise for attack
    noise = np.random.normal(0, 0.1, len(wave)) * np.exp(-t * 20)
    wave = wave + noise
    
    # Envelope
    envelope = np.exp(-t * 10)
    wave = wave * envelope
    
    wave = np.clip(wave, -1, 1)
    wave = (wave * 32767).astype(np.int16)
    return wave

def generate_synth():
    """Synthesizer: Square wave with filter"""
    wave = generate_tone(440.00, DURATION, SAMPLE_RATE, 'square')  # A4
    
    # Apply low-pass filter effect (simple averaging)
    filtered = np.convolve(wave, np.ones(10)/10, mode='same')
    wave = (filtered * 0.7 + wave * 0.3).astype(np.int16)
    return wave

def generate_bell():
    """Bell: Rich harmonics with metallic character and long decay"""
    # C5 note (bell-like frequency)
    fundamental_freq = 523.25  # C5
    
    t = np.linspace(0, DURATION, int(SAMPLE_RATE * DURATION), False)
    
    # Generate multiple harmonics for bell-like sound
    # Bells have inharmonic partials (not perfect multiples)
    wave1 = np.sin(2 * np.pi * fundamental_freq * t)  # Fundamental
    wave2 = np.sin(2 * np.pi * fundamental_freq * 2.76 * t)  # Inharmonic partial
    wave3 = np.sin(2 * np.pi * fundamental_freq * 5.4 * t)  # Inharmonic partial
    wave4 = np.sin(2 * np.pi * fundamental_freq * 8.93 * t)  # Inharmonic partial
    wave5 = np.sin(2 * np.pi * fundamental_freq * 13.34 * t)  # Inharmonic partial
    
    # Mix with bell-like amplitude ratios
    wave = wave1 * 0.35 + wave2 * 0.25 + wave3 * 0.20 + wave4 * 0.12 + wave5 * 0.08
    
    # Bell envelope: very quick attack, very slow decay
    attack_samples = int(0.01 * SAMPLE_RATE)  # 10ms attack
    decay_samples = len(wave) - attack_samples
    
    envelope = np.ones_like(wave)
    envelope[:attack_samples] = np.linspace(0, 1, attack_samples)  # Quick attack
    # Very slow exponential decay for bell sustain
    envelope[attack_samples:] = np.exp(-np.linspace(0, 1.5, decay_samples))
    
    wave = wave * envelope
    
    # Normalize and convert
    wave = np.clip(wave, -1, 1)
    wave = (wave * 32767).astype(np.int16)
    return wave

def generate_player_x():
    """Player X: Higher pitch, brighter tone"""
    # Higher frequency chord (E-G-B)
    e = generate_tone(329.63, DURATION, SAMPLE_RATE, 'sine')  # E4
    g = generate_tone(392.00, DURATION, SAMPLE_RATE, 'sine')  # G4
    b = generate_tone(493.88, DURATION, SAMPLE_RATE, 'sine')  # B4
    wave = (e * 0.35 + g * 0.35 + b * 0.30).astype(np.int16)
    return wave

def generate_player_o():
    """Player O: Lower pitch, deeper tone"""
    # Lower frequency chord (C-E-G)
    c = generate_tone(196.00, DURATION, SAMPLE_RATE, 'sine')  # G3
    e = generate_tone(246.94, DURATION, SAMPLE_RATE, 'sine')  # B3
    g = generate_tone(293.66, DURATION, SAMPLE_RATE, 'sine')  # D4
    wave = (c * 0.40 + e * 0.35 + g * 0.25).astype(np.int16)
    return wave

def main():
    output_dir = 'android/app/src/main/res/raw'
    os.makedirs(output_dir, exist_ok=True)
    
    sounds = {
        'piano_tone.mp3': generate_piano,
        'guitar_tone.mp3': generate_guitar,
        'drum_hit.mp3': generate_drums,
        'synth_beep.mp3': generate_synth,
        'bell_ring.mp3': generate_bell,
        'player_x.wav': generate_player_x,
        'player_o.wav': generate_player_o,
    }
    
    print("Generating sound files...")
    for filename, generator in sounds.items():
        try:
            wave = generator()
            # Save as WAV first (scipy can't directly save MP3)
            wav_path = os.path.join(output_dir, filename.replace('.mp3', '.wav'))
            wavfile.write(wav_path, SAMPLE_RATE, wave)
            print(f"✅ Generated {filename.replace('.mp3', '.wav')}")
        except Exception as e:
            print(f"❌ Error generating {filename}: {e}")
    
    print("\nNote: Files are saved as .wav format.")
    print("To convert to MP3, install ffmpeg and run:")
    print("  for f in android/app/src/main/res/raw/*.wav; do")
    print("    ffmpeg -i \"$f\" \"${f%.wav}.mp3\" && rm \"$f\"")
    print("  done")

if __name__ == '__main__':
    try:
        main()
    except ImportError as e:
        print(f"Error: Missing required library. Install with: pip3 install numpy scipy")
        print(f"Details: {e}")

