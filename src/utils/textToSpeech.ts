const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;

let currentAudio: HTMLAudioElement | null = null;

export async function speakText(text: string): Promise<void> {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  try {
    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`TTS request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // Use data URI for playback
    const audioUrl = `data:audio/mpeg;base64,${data.audioContent}`;
    currentAudio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      if (!currentAudio) return reject(new Error("Audio not initialized"));
      
      currentAudio.onended = () => {
        currentAudio = null;
        resolve();
      };
      
      currentAudio.onerror = (e) => {
        currentAudio = null;
        reject(e);
      };
      
      currentAudio.play().catch(reject);
    });
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export function stopSpeaking(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}
