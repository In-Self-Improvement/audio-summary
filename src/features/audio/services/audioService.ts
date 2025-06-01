import {
  RecordingConfig,
  MediaStreamState,
} from "@/features/audio/types/audioType";

class AudioService {
  private mediaStreamState: MediaStreamState = {
    stream: null,
    mediaRecorder: null,
    audioContext: null,
    analyser: null,
  };

  // 브라우저 지원 확인
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // 마이크 권한 요청 및 스트림 설정
  async initializeMediaStream(
    config: RecordingConfig = {}
  ): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          sampleRate: config.sampleRate || 44100,
          channelCount: config.channelCount || 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.mediaStreamState.stream = stream;

      // AudioContext 설정 (실시간 오디오 분석용)
      this.setupAudioContext(stream);

      return stream;
    } catch (error) {
      throw new Error(`마이크 접근 실패: ${(error as Error).message}`);
    }
  }

  // AudioContext 및 Analyser 설정 (오디오 레벨 분석용)
  private setupAudioContext(stream: MediaStream): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      this.mediaStreamState.audioContext = audioContext;
      this.mediaStreamState.analyser = analyser;
    } catch (error) {
      console.warn("AudioContext 설정 실패:", error);
    }
  }

  // MediaRecorder 생성
  createMediaRecorder(
    stream: MediaStream,
    config: RecordingConfig = {}
  ): MediaRecorder {
    const mimeType = this.getSupportedMimeType(config.format);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      bitsPerSecond: config.bitRate,
    });

    this.mediaStreamState.mediaRecorder = mediaRecorder;
    return mediaRecorder;
  }

  // 지원되는 MIME 타입 확인
  private getSupportedMimeType(preferredFormat?: string): string {
    const formats = [
      `audio/${preferredFormat}`,
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/wav",
    ].filter(Boolean);

    for (const format of formats) {
      if (MediaRecorder.isTypeSupported(format)) {
        return format;
      }
    }

    throw new Error("지원되는 오디오 형식이 없습니다.");
  }

  // 실시간 오디오 레벨 계산
  getAudioLevel(): number {
    if (!this.mediaStreamState.analyser) return 0;

    const bufferLength = this.mediaStreamState.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.mediaStreamState.analyser.getByteFrequencyData(dataArray);

    // 평균 레벨 계산
    const average =
      dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
    return Math.round((average / 255) * 100);
  }

  // Blob을 URL로 변환
  createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  // URL 메모리 해제
  revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  // 스트림 정리
  cleanup(): void {
    if (this.mediaStreamState.stream) {
      this.mediaStreamState.stream.getTracks().forEach((track) => track.stop());
    }

    if (this.mediaStreamState.audioContext) {
      this.mediaStreamState.audioContext.close();
    }

    this.mediaStreamState = {
      stream: null,
      mediaRecorder: null,
      audioContext: null,
      analyser: null,
    };
  }

  // 현재 미디어 스트림 상태 반환
  getMediaStreamState(): MediaStreamState {
    return { ...this.mediaStreamState };
  }
}

const audioService = new AudioService();
export default audioService;
