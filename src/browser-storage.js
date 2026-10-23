export function readLocal(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
export function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export const ONBOARDING_KEY = "arah-onboarding-v1";
export const JOURNEY_KEY = "arah-visitor-journey-v1";
