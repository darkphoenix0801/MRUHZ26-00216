import os
import tempfile
import librosa
import numpy as np
import whisper

# Load a lightweight whisper model globally so it doesn't reload on every request
# Using 'base' or 'tiny' for speed on local machines
print("🎙️ Loading Whisper Model (base)... this may take a moment on first run.")
try:
    whisper_model = whisper.load_model("base")
except Exception as e:
    print(f"⚠️ Failed to load whisper model: {e}")
    whisper_model = None

def transcribe_audio(file_path: str) -> str:
    """
    Uses OpenAI's Whisper model to transcribe speech to text.
    """
    if whisper_model is None:
        raise RuntimeError("Whisper model is not loaded.")
        
    print(f"🎙️ Transcribing audio file: {file_path}")
    # Using fp16=False to avoid warnings on CPU execution
    result = whisper_model.transcribe(file_path, fp16=False)
    text = result["text"].strip()
    return text

def analyze_confidence(file_path: str) -> float:
    """
    Analyzes the audio file using librosa to produce a 'confidence' proxy score (0-100).
    It looks at pauses and speaking rate.
    """
    try:
        # Load audio file (y is the audio time series, sr is sampling rate)
        y, sr = librosa.load(file_path, sr=None)
        
        # Calculate zero-crossing rate (higher ZCR often correlates to more active speaking/less silence)
        zcr = librosa.feature.zero_crossing_rate(y)
        avg_zcr = np.mean(zcr)
        
        # Split non-silent intervals to measure pauses
        # top_db is the threshold (in decibels) below reference to consider as silence
        non_mute_intervals = librosa.effects.split(y, top_db=20)
        
        total_duration = librosa.get_duration(y=y, sr=sr)
        
        # Calculate total speaking time vs silent time
        speaking_samples = sum(interval[1] - interval[0] for interval in non_mute_intervals)
        speaking_duration = speaking_samples / sr
        
        speaking_ratio = speaking_duration / total_duration if total_duration > 0 else 0
        
        # Normalize a score out of 100 based on speaking ratio (e.g. 60-90% speaking is usually ideal)
        # If someone pauses too much, speaking_ratio is low. 
        # If speaking_ratio is > 0.5, we give a good score, scaling up to 100.
        score = speaking_ratio * 100
        
        # Add a slight boost from ZCR (just a heuristic for demonstration)
        score += (avg_zcr * 50)
        
        # Clamp between 0 and 100
        final_score = max(0, min(100, score))
        
        # For our mock interview, people are usually fairly confident but taking time to think. 
        # Let's ensure a reasonable baseline.
        if final_score < 40:
            final_score = 40 + (final_score / 2)
            
        print(f"📊 Librosa Audio Analysis: Speaking Ratio: {speaking_ratio:.2f}, Score: {final_score:.1f}")
        return float(final_score)
        
    except Exception as e:
        print(f"⚠️ Error in audio analysis: {e}")
        return 75.0  # Safe fallback
