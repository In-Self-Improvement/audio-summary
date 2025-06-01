import { useState, useCallback, useEffect, useRef } from "react";
import audioService from "@/features/audio/services/audioService";
import {
  RecorderState,
  AudioData,
  RecordingConfig,
} from "@/features/audio/types/audioType";

const useAudioRecorder = (config: RecordingConfig = {}) => {
  const [state, setState] = useState<RecorderState>({
    status: "idle",
    duration: 0,
    isSupported: audioService.isRecordingSupported(),
    error: null,
    audioLevel: 0,
  });

  const [recordings, setRecordings] = useState<AudioData[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // 실시간 오디오 레벨 업데이트
  const updateAudioLevel = useCallback(() => {
    if (state.status === "recording") {
      const level = audioService.getAudioLevel();
      setState((prev) => ({ ...prev, audioLevel: level }));
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state.status]);

  // 녹음 시간 업데이트
  const updateDuration = useCallback(() => {
    if (startTimeRef.current && state.status === "recording") {
      const currentDuration = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      setState((prev) => ({ ...prev, duration: currentDuration }));
    }
  }, [state.status]);

  // 녹음 시작
  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // 미디어 스트림 초기화
      const stream = await audioService.initializeMediaStream(config);
      streamRef.current = stream;

      // MediaRecorder 생성
      const mediaRecorder = audioService.createMediaRecorder(stream, config);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // MediaRecorder 이벤트 설정
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const audioData: AudioData = {
          id: Date.now().toString(),
          blob,
          url: audioService.createObjectURL(blob),
          duration: state.duration,
          name: `녹음_${new Date().toLocaleString()}`,
          createdAt: new Date(),
        };

        setRecordings((prev) => [...prev, audioData]);
        setState((prev) => ({ ...prev, status: "stopped" }));
      };

      // 녹음 시작
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setState((prev) => ({ ...prev, status: "recording", duration: 0 }));

      // 실시간 업데이트 시작
      intervalRef.current = setInterval(updateDuration, 1000);
      updateAudioLevel();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: (error as Error).message,
        status: "idle",
      }));
    }
  }, [config, state.duration, updateDuration, updateAudioLevel]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "recording") {
      mediaRecorderRef.current.stop();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [state.status]);

  // 녹음 일시정지 (아직 구현되지 않음 - MediaRecorder API 제한)
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "recording") {
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, status: "paused" }));

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [state.status]);

  // 녹음 재개
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "paused") {
      mediaRecorderRef.current.resume();
      setState((prev) => ({ ...prev, status: "recording" }));
      intervalRef.current = setInterval(updateDuration, 1000);
      updateAudioLevel();
    }
  }, [state.status, updateDuration, updateAudioLevel]);

  // 녹음 삭제
  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const recording = prev.find((r) => r.id === id);
      if (recording) {
        audioService.revokeObjectURL(recording.url);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  // 클린업
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioService.cleanup();
    };
  }, []);

  return {
    // 상태
    ...state,
    recordings,

    // 액션
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
  };
};

export default useAudioRecorder;
