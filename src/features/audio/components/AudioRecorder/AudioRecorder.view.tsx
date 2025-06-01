import { RecordingStatus } from "@/features/audio/types/audioType";
import { Mic, Square, Pause, Play, AlertCircle, Loader2 } from "lucide-react";

interface AudioRecorderViewProps {
  status: RecordingStatus;
  duration: number;
  audioLevel: number;
  isSupported: boolean;
  error: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  isInitializing?: boolean;
}

export function AudioRecorderView({
  status,
  duration,
  audioLevel,
  isSupported,
  error,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  isInitializing = false,
}: AudioRecorderViewProps) {
  // 시간 포맷팅 함수
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 초기화 중일 때
  if (isInitializing) {
    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm">
        <div className="flex items-center justify-center text-blue-500 mb-4">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center text-gray-700 font-medium">
          오디오 시스템을 확인하는 중...
        </div>
      </div>
    );
  }

  // 브라우저 지원하지 않는 경우
  if (!isSupported) {
    return (
      <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="text-center text-gray-700 font-medium">
          이 브라우저에서는 녹음 기능을 지원하지 않습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm">
      {/* 제목 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">음성 녹음기</h2>
        <p className="text-sm text-gray-500">고품질 오디오 녹음</p>
      </div>

      {/* 오디오 레벨 시각화 */}
      <div className="mb-8 flex justify-center">
        <div className="flex items-end gap-1 h-20 px-4">
          {Array.from({ length: 20 }, (_, i) => {
            const barHeight =
              (audioLevel / 100) * 20 > i
                ? Math.max(8, (audioLevel / 100) * 64)
                : 8;
            const isActive = (audioLevel / 100) * 20 > i;

            return (
              <div
                key={i}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isActive
                    ? "bg-gradient-to-t from-blue-400 via-blue-500 to-blue-600 shadow-sm"
                    : "bg-gray-200"
                }`}
                style={{
                  height: `${barHeight}px`,
                  animation:
                    isActive && status === "recording"
                      ? "pulse 0.3s ease-in-out"
                      : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 녹음 시간 표시 */}
      <div className="text-center mb-8">
        <div className="text-5xl font-mono font-bold text-gray-900 mb-2">
          {formatDuration(duration)}
        </div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              status === "recording"
                ? "bg-red-500 animate-pulse"
                : status === "paused"
                ? "bg-yellow-500"
                : status === "stopped"
                ? "bg-gray-500"
                : "bg-blue-500"
            }`}
          />
          <span className="text-gray-600 font-medium">
            {status === "recording" && "녹음 중"}
            {status === "paused" && "일시정지"}
            {status === "stopped" && "정지됨"}
            {status === "idle" && "대기 중"}
          </span>
        </div>
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex justify-center gap-4">
        {status === "idle" && (
          <button
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
            onClick={onStartRecording}
          >
            <Mic className="w-5 h-5" />
            녹음 시작
          </button>
        )}

        {status === "recording" && (
          <>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-200"
              onClick={onPauseRecording}
            >
              <Pause className="w-4 h-4" />
              일시정지
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
              onClick={onStopRecording}
            >
              <Square className="w-4 h-4" />
              중지
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-200"
              onClick={onResumeRecording}
            >
              <Play className="w-4 h-4" />
              재개
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
              onClick={onStopRecording}
            >
              <Square className="w-4 h-4" />
              중지
            </button>
          </>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold">오류 발생</span>
          </div>
          <div className="text-sm">{error}</div>
        </div>
      )}
    </div>
  );
}
