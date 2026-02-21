/**
 * 🔒 PRIVACY NOTICE
 * All speech processing runs locally on device using RunAnywhere SDK.
 * Audio is processed in memory and transcribed locally.
 * No audio data is sent to external servers.
 */

import { NativeModules, Platform, PermissionsAndroid } from 'react-native';
import { RunAnywhere } from '@runanywhere/core';

const { NativeAudioModule } = NativeModules;

export interface TranscriptionCallback {
  (text: string, timestamp: number): void;
}

export interface AudioLevelCallback {
  (level: number): void;
}

/**
 * SpeechService - Handles audio recording and speech-to-text
 */
export class SpeechService {
  private isRecording: boolean = false;
  private recordingPath: string | null = null;
  private recordingStartTime: number = 0;
  private audioLevelInterval: NodeJS.Timeout | null = null;
  private transcriptionInterval: NodeJS.Timeout | null = null;
  private transcriptionCallback: TranscriptionCallback | null = null;
  private audioLevelCallback: AudioLevelCallback | null = null;
  private lastTranscriptionTime: number = 0;

  /**
   * Request microphone permission (Android only)
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'Latent needs access to your microphone to transcribe speech.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('[SpeechService] Permission error:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(
    onTranscription: TranscriptionCallback,
    onAudioLevel?: AudioLevelCallback
  ): Promise<boolean> {
    try {
      // Check native module
      if (!NativeAudioModule) {
        console.error('[SpeechService] NativeAudioModule not available');
        return false;
      }

      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.error('[SpeechService] Microphone permission denied');
        return false;
      }

      // Start native recording
      console.log('[SpeechService] Starting recording...');
      const result = await NativeAudioModule.startRecording();

      this.isRecording = true;
      this.recordingPath = result.path;
      this.recordingStartTime = Date.now();
      this.transcriptionCallback = onTranscription;
      this.audioLevelCallback = onAudioLevel || null;

      // Start audio level polling
      if (onAudioLevel) {
        this.startAudioLevelPolling();
      }

      // Start continuous transcription (every 5 seconds)
      this.startContinuousTranscription();

      console.log('[SpeechService] Recording started at:', result.path);
      return true;
    } catch (error) {
      console.error('[SpeechService] Error starting recording:', error);
      this.isRecording = false;
      return false;
    }
  }

  /**
   * Stop recording and transcribe
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.isRecording || !NativeAudioModule) {
        return null;
      }

      // Stop audio level polling
      this.stopAudioLevelPolling();

      // Stop continuous transcription
      this.stopContinuousTranscription();

      // Stop native recording
      console.log('[SpeechService] Stopping recording...');
      const result = await NativeAudioModule.stopRecording();

      this.isRecording = false;
      const audioPath = result.path || this.recordingPath;

      if (!audioPath) {
        console.error('[SpeechService] No audio path available');
        return null;
      }

      // Transcribe the audio
      console.log('[SpeechService] Transcribing audio...');
      const transcription = await this.transcribeAudio(audioPath);

      // Clean up
      this.recordingPath = null;
      this.transcriptionCallback = null;
      this.audioLevelCallback = null;

      return transcription;
    } catch (error) {
      console.error('[SpeechService] Error stopping recording:', error);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Cancel recording without transcribing
   */
  async cancelRecording(): Promise<void> {
    try {
      if (!this.isRecording || !NativeAudioModule) {
        return;
      }

      // Stop audio level polling
      this.stopAudioLevelPolling();

      // Stop continuous transcription
      this.stopContinuousTranscription();

      // Cancel native recording
      await NativeAudioModule.cancelRecording();

      this.isRecording = false;
      this.recordingPath = null;
      this.transcriptionCallback = null;
      this.audioLevelCallback = null;

      console.log('[SpeechService] Recording cancelled');
    } catch (error) {
      console.error('[SpeechService] Error cancelling recording:', error);
      this.isRecording = false;
    }
  }

  /**
   * Transcribe audio file using RunAnywhere STT
   */
  private async transcribeAudio(audioPath: string): Promise<string | null> {
    try {
      // Use RunAnywhere STT model (Whisper)
      const result = await RunAnywhere.transcribe(audioPath);

      const transcription = result.text || '';
      console.log('[SpeechService] Transcription:', transcription);

      // Call callback with transcription
      if (this.transcriptionCallback) {
        this.transcriptionCallback(transcription, Date.now());
      }

      return transcription;
    } catch (error) {
      console.error('[SpeechService] Transcription error:', error);
      return null;
    }
  }

  /**
   * Start continuous transcription (every 5 seconds)
   */
  private startContinuousTranscription(): void {
    this.lastTranscriptionTime = Date.now();

    this.transcriptionInterval = setInterval(async () => {
      try {
        if (!this.isRecording || !this.recordingPath) {
          return;
        }

        const currentTime = Date.now();

        // Only transcribe if 5 seconds have passed since last transcription
        if (currentTime - this.lastTranscriptionTime >= 5000) {
          console.log('[SpeechService] Performing continuous transcription...');

          // Try to transcribe the current recording
          try {
            const result = await RunAnywhere.transcribe(this.recordingPath);
            const text = result.text || '';

            if (text && text.length > 0 && this.transcriptionCallback) {
              console.log('[SpeechService] Continuous transcription result:', text);
              this.transcriptionCallback(text, currentTime);
              this.lastTranscriptionTime = currentTime;
            }
          } catch (transcribeError) {
            console.log('[SpeechService] Continuous transcription skipped (file may be in use)');
          }
        }
      } catch (error) {
        console.error('[SpeechService] Continuous transcription error:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Stop continuous transcription
   */
  private stopContinuousTranscription(): void {
    if (this.transcriptionInterval) {
      clearInterval(this.transcriptionInterval);
      this.transcriptionInterval = null;
    }
  }

  /**
   * Start polling audio levels
   */
  private startAudioLevelPolling(): void {
    this.audioLevelInterval = setInterval(async () => {
      try {
        if (!NativeAudioModule || !this.isRecording) {
          return;
        }

        const levelResult = await NativeAudioModule.getAudioLevel();
        const level = levelResult.level || 0;

        if (this.audioLevelCallback) {
          this.audioLevelCallback(level);
        }
      } catch (error) {
        // Ignore polling errors
      }
    }, 100); // Poll every 100ms
  }

  /**
   * Stop polling audio levels
   */
  private stopAudioLevelPolling(): void {
    if (this.audioLevelInterval) {
      clearInterval(this.audioLevelInterval);
      this.audioLevelInterval = null;
    }
  }

  /**
   * Get recording status
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in milliseconds
   */
  getRecordingDuration(): number {
    if (!this.isRecording) {
      return 0;
    }
    return Date.now() - this.recordingStartTime;
  }

  /**
   * Cleanup on service destruction
   */
  cleanup(): void {
    this.stopAudioLevelPolling();
    this.stopContinuousTranscription();
    if (this.isRecording) {
      this.cancelRecording();
    }
  }
}

// Export singleton instance
export const speechService = new SpeechService();
