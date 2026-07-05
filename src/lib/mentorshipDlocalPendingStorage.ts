const STORAGE_KEY = 'mentorshipDlocalPending';

export type MentorshipDlocalPending = {
  orderId?: string;
  paymentId?: string;
  planId?: string;
  interval?: string;
  userId?: string;
};

export function saveMentorshipDlocalPending(payload: MentorshipDlocalPending) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readMentorshipDlocalPending(): MentorshipDlocalPending | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MentorshipDlocalPending;
  } catch {
    return null;
  }
}

export function clearMentorshipDlocalPending() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export { STORAGE_KEY as MENTORSHIP_DLOCAL_PENDING_KEY };
