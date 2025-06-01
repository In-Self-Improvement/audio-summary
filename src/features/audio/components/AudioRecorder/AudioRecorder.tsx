import { AudioRecorderView } from "./AudioRecorder.view";
import useAudioRecorder from "@/features/audio/hooks/useAudioRecorder";
import { RecordingConfig } from "@/features/audio/types/audioType";

interface AudioRecorderProps {
  config?: RecordingConfig;
}

export function AudioRecorder({ config }: AudioRecorderProps) {
  const recorder = useAudioRecorder(config);

  return (
    <AudioRecorderView
      status={recorder.status}
      duration={recorder.duration}
      audioLevel={recorder.audioLevel}
      isSupported={recorder.isSupported}
      error={recorder.error}
      isInitializing={recorder.isInitializing}
      onStartRecording={recorder.startRecording}
      onStopRecording={recorder.stopRecording}
      onPauseRecording={recorder.pauseRecording}
      onResumeRecording={recorder.resumeRecording}
    />
  );
}
