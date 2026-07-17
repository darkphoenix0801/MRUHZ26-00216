import os
import time
import librosa
import numpy as np
from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def transcribe_audio(file_path: str) -> str:
    """
    Uses Groq's hosted Whisper model to transcribe speech to text.
    """
    if not groq_client:
        raise RuntimeError("GROQ_API_KEY is not set. Cannot transcribe audio.")
        
    print(f"🎙️ Transcribing audio file via Groq Whisper API: {file_path}")
    
    def _do_transcribe():
        with open(file_path, "rb") as file:
            # We use whisper-large-v3 model as hosted by Groq
            transcription = groq_client.audio.transcriptions.create(
                file=(os.path.basename(file_path), file.read()),
                model="whisper-large-v3",
                response_format="text"
            )
            return transcription
            
    # Exponential backoff retry logic
    max_retries = 3
    base_delay = 2
    for attempt in range(max_retries):
        try:
            result = _do_transcribe()
            # Depending on SDK version, it might return a string when response_format='text'
            # or an object with a .text attribute.
            if hasattr(result, "text"):
                return result.text.strip()
            return str(result).strip()
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"⚠️ Groq Whisper transcription failed: {e}")
                # Return empty string to allow graceful degradation handled by main.py
                return "" 
            delay = base_delay * (2 ** attempt)
            print(f"⚠️ Transcription failed. Retrying in {delay} seconds... (Error: {e})")
            time.sleep(delay)

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
