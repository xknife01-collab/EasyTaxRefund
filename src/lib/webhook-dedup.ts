/**
 * Webhook Deduplication and Sequential User Lock Manager
 * Prevents race conditions, double/triple sends, and context corruption
 */

const processedMessageIds = new Map<string, number>(); // messageId -> timestamp
const userProcessingLocks = new Map<string, Promise<void>>(); // userId -> active promise

const DEDUP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Clean up expired message IDs to prevent memory leaks
 */
function pruneExpiredIds() {
  const now = Date.now();
  for (const [id, timestamp] of processedMessageIds.entries()) {
    if (now - timestamp > DEDUP_TTL_MS) {
      processedMessageIds.delete(id);
    }
  }
}

// Prune every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(pruneExpiredIds, 5 * 60 * 1000).unref?.();
}

/**
 * Check if a message ID has already been received or processed recently.
 * Returns true if duplicate (should be skipped).
 */
export function isDuplicateMessage(messageId?: string | null): boolean {
  if (!messageId) return false;
  
  const now = Date.now();
  if (processedMessageIds.has(messageId)) {
    const prevTime = processedMessageIds.get(messageId)!;
    if (now - prevTime < DEDUP_TTL_MS) {
      console.warn(`[Webhook Dedup] Duplicate message skipped: ${messageId}`);
      return true;
    }
  }

  processedMessageIds.set(messageId, now);
  return false;
}

/**
 * Acquire a sequential execution lock for a user/chat ID.
 * If another message from the same user is currently generating an AI response,
 * this will wait until the previous one completes before proceeding.
 */
export async function acquireUserLock(userId: string): Promise<() => void> {
  const currentLock = userProcessingLocks.get(userId) || Promise.resolve();

  let releaseLock: () => void;
  const newLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });

  // Chain the lock
  userProcessingLocks.set(userId, currentLock.then(() => newLock));

  // Wait for previous user operations to finish
  await currentLock;

  return () => {
    releaseLock!();
    if (userProcessingLocks.get(userId) === newLock) {
      userProcessingLocks.delete(userId);
    }
  };
}
