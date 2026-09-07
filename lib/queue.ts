import { createServiceClient } from './supabase-server'

// Beta rollout off-switch: unset/not '1' disables the queue — every new
// self-registration is released immediately (today's behavior). Purely
// additive/temporary; turning the beta off later needs no migration, just
// unsetting this — already-queued users stay queued until an admin
// explicitly releases them (see app/api/admin/queue/release/route.ts).
export function isQueueEnabled(): boolean {
  return process.env.QUEUE_ENABLED === '1'
}

// 1-based position among still-queued users, FIFO by created_at. Only
// meaningful when the caller's own queue_released_at is null.
export async function getQueuePosition(
  createdAt: string
): Promise<{ position: number; totalWaiting: number }> {
  const supabase = createServiceClient()
  const [{ count: position }, { count: totalWaiting }] = await Promise.all([
    supabase
      .from('teachers')
      .select('id', { count: 'exact', head: true })
      .is('queue_released_at', null)
      .lte('created_at', createdAt),
    supabase
      .from('teachers')
      .select('id', { count: 'exact', head: true })
      .is('queue_released_at', null),
  ])
  return { position: position ?? 0, totalWaiting: totalWaiting ?? 0 }
}
