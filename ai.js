import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase.js";

const snapshotSchema = z.object({
  syncedAt: z.string().datetime(),
  snapshot: z.any()
});

export function registerSyncRoute(app) {
  app.post("/api/sync", async (req, res, next) => {
    try {
      const payload = snapshotSchema.parse(req.body);
      const user = req.currentUser;
      const supabase = getSupabaseAdmin();

      if (supabase && !user.isDemo) {
        const { error } = await supabase.from("user_snapshots").upsert({
          user_id: user.id,
          snapshot_json: payload.snapshot,
          synced_at: payload.syncedAt
        }, { onConflict: "user_id" });
        if (error) throw error;
      }

      res.json({
        ok: true,
        syncedAt: payload.syncedAt,
        userId: user.id,
        cloud: Boolean(supabase && !user.isDemo)
      });
    } catch (error) {
      next(error);
    }
  });
}
