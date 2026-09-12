import { Platform } from 'react-native';

export interface SpeechRecognitionListener {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class VoiceService {
  private recognition: any = null;
  private isListening = false;
  private currentListener: SpeechRecognitionListener | null = null;
  private isTtsSpeaking = false;

  constructor() {
    this.initWebSpeech();
  }

  private initWebSpeech() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = 'en-IN'; // Optimized for Indian English & transliterations

          this.recognition.onstart = () => {
            this.isListening = true;
            this.currentListener?.onStart?.();
          };

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            const activeTranscript = finalTranscript || interimTranscript;
            const isFinal = Boolean(finalTranscript);
            if (activeTranscript) {
              this.currentListener?.onResult?.(activeTranscript, isFinal);
            }
          };

          this.recognition.onerror = (event: any) => {
            console.warn('Speech recognition error:', event?.error);
            const err = event?.error === 'not-allowed'
              ? 'Microphone permission denied'
              : event?.error || 'Recognition error';
            this.currentListener?.onError?.(err);
          };

          this.recognition.onend = () => {
            this.isListening = false;
            this.currentListener?.onEnd?.();
          };
        } catch (e) {
          console.warn('SpeechRecognition initialization error:', e);
        }
      }
    }
  }

  /**
   * Checks if native / web speech recognition is available in the current runtime
   */
  public isSpeechRecognitionSupported(): boolean {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return Boolean(
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      );
    }
    return false;
  }

  /**
   * Starts listening to microphone input
   */
  public startListening(listener: SpeechRecognitionListener, lang = 'en-IN'): boolean {
    this.currentListener = listener;

    if (this.recognition) {
      try {
        if (this.isListening) {
          this.recognition.stop();
        }
        this.recognition.lang = lang;
        this.recognition.start();
        return true;
      } catch (e) {
        console.warn('Failed to start speech recognition:', e);
        listener.onError?.('Could not start microphone');
        return false;
      }
    } else {
      listener.onError?.('Speech recognition is not natively supported in this browser. Please type your command.');
      return false;
    }
  }

  /**
   * Stops listening to microphone input
   */
  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Error stopping speech recognition:', e);
      }
    }
    this.isListening = false;
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Text-to-Speech (TTS): Reads text aloud to the user
   */
  public speak(text: string, onDone?: () => void) {
    if (!text || text.trim().length === 0) return;

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel(); // Stop ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = 'en-IN';

        utterance.onstart = () => {
          this.isTtsSpeaking = true;
        };
        utterance.onend = () => {
          this.isTtsSpeaking = false;
          onDone?.();
        };
        utterance.onerror = () => {
          this.isTtsSpeaking = false;
          onDone?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('TTS error:', e);
        this.isTtsSpeaking = false;
        onDone?.();
      }
    } else {
      onDone?.();
    }
  }

  /**
   * Stops any ongoing Text-to-Speech playback
   */
  public stopSpeaking() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error canceling TTS:', e);
      }
    }
    this.isTtsSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isTtsSpeaking;
  }
}

export const voiceService = new VoiceService();
