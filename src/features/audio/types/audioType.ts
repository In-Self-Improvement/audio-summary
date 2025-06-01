// 녹음 상태 타입
export type RecordingStatus = "idle" | "recording" | "paused" | "stopped";

// 오디오 데이터 타입
export interface AudioData {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  name: string;
  createdAt: Date;
}

// 녹음 설정 타입
export interface RecordingConfig {
  sampleRate?: number;
  channelCount?: number;
  bitRate?: number;
  format?: "webm" | "mp4" | "wav";
}

// 녹음기 상태 타입
export interface RecorderState {
  status: RecordingStatus;
  duration: number;
  isSupported: boolean;
  error: string | null;
  audioLevel: number; // 실시간 오디오 레벨 (0-100)
}

// 미디어 스트림 관련 타입
export interface MediaStreamState {
  stream: MediaStream | null;
  mediaRecorder: MediaRecorder | null;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
}
