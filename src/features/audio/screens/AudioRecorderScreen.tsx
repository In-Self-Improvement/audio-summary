"use client";

import { AudioRecorder } from "@/features/audio/components/AudioRecorder/AudioRecorder";

export function AudioRecorderScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎙️ Audio Summary
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            고품질 음성 녹음으로 시작하여 AI 기반 요약까지.
            <br />
            당신의 아이디어를 쉽고 빠르게 정리하세요.
          </p>
        </div>

        {/* 녹음기 */}
        <div className="flex justify-center">
          <AudioRecorder />
        </div>

        {/* 추가 정보 */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-2">고품질 녹음</h3>
            <p className="text-sm text-gray-600">
              Web Audio API를 활용한 선명한 음질의 오디오 녹음
            </p>
          </div>
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI 요약</h3>
            <p className="text-sm text-gray-600">
              GPT를 활용한 지능적인 내용 요약 및 정리
            </p>
          </div>
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">빠른 처리</h3>
            <p className="text-sm text-gray-600">
              실시간 오디오 분석과 즉시 이용 가능한 결과
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
