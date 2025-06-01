import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AudioRecorderView } from "./AudioRecorder.view";

const meta: Meta<typeof AudioRecorderView> = {
  title: "Audio/AudioRecorder",
  component: AudioRecorderView,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Web Audio API를 사용한 모던한 오디오 녹음기 컴포넌트입니다. Tailwind CSS로 스타일링되어 있습니다.",
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#1e293b" },
      ],
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["idle", "recording", "paused", "stopped"],
      description: "녹음 상태",
    },
    duration: {
      control: { type: "number", min: 0, max: 3600, step: 1 },
      description: "녹음 시간 (초)",
    },
    audioLevel: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "오디오 레벨 (0-100)",
    },
    isSupported: {
      control: "boolean",
      description: "브라우저 지원 여부",
    },
    isInitializing: {
      control: "boolean",
      description: "초기화 중 여부",
    },
    error: {
      control: "text",
      description: "에러 메시지",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 상태 (대기 중)
export const Default: Story = {
  args: {
    status: "idle",
    duration: 0,
    audioLevel: 0,
    isSupported: true,
    isInitializing: false,
    error: null,
    onStartRecording: () => console.log("녹음 시작"),
    onStopRecording: () => console.log("녹음 중지"),
    onPauseRecording: () => console.log("녹음 일시정지"),
    onResumeRecording: () => console.log("녹음 재개"),
  },
};

// 초기화 중 상태
export const Initializing: Story = {
  args: {
    ...Default.args,
    isInitializing: true,
  },
};

// 녹음 중 상태 (낮은 레벨)
export const Recording: Story = {
  args: {
    ...Default.args,
    status: "recording",
    duration: 45,
    audioLevel: 35,
  },
};

// 녹음 중 상태 (높은 레벨)
export const RecordingHighLevel: Story = {
  args: {
    ...Default.args,
    status: "recording",
    duration: 25,
    audioLevel: 85,
  },
};

// 일시정지 상태
export const Paused: Story = {
  args: {
    ...Default.args,
    status: "paused",
    duration: 180,
    audioLevel: 0,
  },
};

// 정지됨 상태
export const Stopped: Story = {
  args: {
    ...Default.args,
    status: "stopped",
    duration: 120,
    audioLevel: 0,
  },
};

// 긴 녹음 시간
export const LongRecording: Story = {
  args: {
    ...Default.args,
    status: "recording",
    duration: 3599, // 59분 59초
    audioLevel: 60,
  },
};

// 에러 상태
export const WithError: Story = {
  args: {
    ...Default.args,
    error:
      "마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.",
  },
};

// 브라우저 미지원
export const Unsupported: Story = {
  args: {
    ...Default.args,
    isSupported: false,
  },
};

// 다크 배경에서의 모습
export const OnDarkBackground: Story = {
  args: {
    ...Default.args,
    status: "recording",
    duration: 67,
    audioLevel: 70,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};
