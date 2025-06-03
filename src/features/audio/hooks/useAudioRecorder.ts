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
    isSupported: false,
    error: null,
    audioLevel: 0,
  });

  const [recordings, setRecordings] = useState<AudioData[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);

  // 클라이언트에서만 브라우저 지원 여부 확인
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isSupported: audioService.isRecordingSupported(),
    }));
    setIsInitializing(false);
  }, []);

  // 시간 업데이트 함수 (ref 기반으로 안정화)
  const updateTimer = useCallback(() => {
    if (startTimeRef.current && isRecordingRef.current) {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setState((prev) =>
        prev.status === "recording" ? { ...prev, duration: elapsed } : prev
      );
    }
  }, []);

  // 오디오 레벨 업데이트 함수 (시간 업데이트와 분리)
  const updateAudioLevel = useCallback(() => {
    if (isRecordingRef.current) {
      const level = audioService.getAudioLevel();
      setState((prev) =>
        prev.status === "recording" ? { ...prev, audioLevel: level } : prev
      );
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, []);

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

        setState((currentState) => {
          const audioData: AudioData = {
            id: Date.now().toString(),
            blob,
            url: audioService.createObjectURL(blob),
            duration: currentState.duration,
            name: `녹음_${new Date().toLocaleString()}`,
            createdAt: new Date(),
          };

          setRecordings((prev) => [...prev, audioData]);
          return { ...currentState, status: "stopped" };
        });
      };

      // 녹음 시작
      mediaRecorder.start();
      startTimeRef.current = Date.now();
      isRecordingRef.current = true;

      setState((prev) => ({
        ...prev,
        status: "recording",
        duration: 0,
        audioLevel: 0,
      }));

      // 100ms마다 정확한 시간 업데이트 (더 부드러운 카운터)
      intervalRef.current = setInterval(updateTimer, 100);

      // 오디오 레벨 업데이트 시작 (별도로 실행)
      updateAudioLevel();
    } catch (error) {
      isRecordingRef.current = false;
      setState((prev) => ({
        ...prev,
        error: (error as Error).message,
        status: "idle",
      }));
    }
  }, [config, updateTimer, updateAudioLevel]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      (state.status === "recording" || state.status === "paused")
    ) {
      isRecordingRef.current = false;
      mediaRecorderRef.current.stop();

      // 모든 타이머 정리
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

  // 녹음 일시정지
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "recording") {
      isRecordingRef.current = false;
      mediaRecorderRef.current.pause();
      setState((prev) => ({ ...prev, status: "paused" }));

      // 타이머들 정지
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

  // 녹음 재개
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.status === "paused") {
      mediaRecorderRef.current.resume();

      // 재개 시 시작 시간을 다시 계산 (일시정지된 시간 제외)
      const pausedDuration = state.duration;
      startTimeRef.current = Date.now() - pausedDuration * 1000;
      isRecordingRef.current = true;

      setState((prev) => ({ ...prev, status: "recording" }));

      // 타이머들 재시작
      intervalRef.current = setInterval(updateTimer, 100);
      updateAudioLevel();
    }
  }, [state.status, state.duration, updateTimer, updateAudioLevel]);

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
      isRecordingRef.current = false;
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
    isInitializing,

    // 액션
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
  };
};

export default useAudioRecorder;
