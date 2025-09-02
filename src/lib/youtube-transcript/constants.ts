export const WATCH_URL = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;
export const INNERTUBE_API_URL = (apiKey: string) =>
  `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`;
export const INNERTUBE_CONTEXT = {
  client: { clientName: "ANDROID", clientVersion: "20.10.38" },
} as const;
