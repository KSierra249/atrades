export type GoogleAuthStatusResponse =
  | { connected: false }
  | { connected: true; email: string };
