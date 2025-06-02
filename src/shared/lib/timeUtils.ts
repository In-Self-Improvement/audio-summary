/**
 * 초 단위 시간을 MM:SS 형태로 포맷팅합니다.
 * @param seconds 초 단위 시간
 * @returns MM:SS 형태의 문자열
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * 초 단위 시간을 HH:MM:SS 형태로 포맷팅합니다.
 * @param seconds 초 단위 시간
 * @returns HH:MM:SS 형태의 문자열
 */
export function formatDurationWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return formatDuration(seconds);
}

/**
 * 밀리초를 초 단위로 변환합니다.
 * @param milliseconds 밀리초
 * @returns 초 단위 시간
 */
export function millisecondsToSeconds(milliseconds: number): number {
  return Math.floor(milliseconds / 1000);
}

/**
 * 두 시간 사이의 차이를 계산합니다.
 * @param startTime 시작 시간 (Date 또는 timestamp)
 * @param endTime 종료 시간 (Date 또는 timestamp)
 * @returns 차이 (초 단위)
 */
export function calculateDuration(
  startTime: Date | number,
  endTime: Date | number
): number {
  const start = typeof startTime === "number" ? startTime : startTime.getTime();
  const end = typeof endTime === "number" ? endTime : endTime.getTime();
  return millisecondsToSeconds(Math.abs(end - start));
}
