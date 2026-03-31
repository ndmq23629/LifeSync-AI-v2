import { getSupabaseAdmin } from "./supabase.js";

export async function resolveUser(req) {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const demoUserId = req.headers["x-demo-user"] || "demo-user";

  if (!bearer) {
    return {
      id: String(demoUserId),
      email: "demo@lifesync.local",
      plan: "starter",
      isDemo: true
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      id: String(demoUserId),
      email: "demo@lifesync.local",
      plan: "starter",
      isDemo: true
    };
  }

  const { data, error } = await supabase.auth.getUser(bearer);
  if (error || !data?.user) {
    const err = new Error("Phiên đăng nhập không hợp lệ.");
    err.status = 401;
    throw err;
  }

  return {
    id: data.user.id,
    email: data.user.email,
    plan: data.user.user_metadata?.plan || "starter",
    isDemo: false,
    jwt: bearer
  };
}

export async function requireUser(req, _res, next) {
  try {
    req.currentUser = await resolveUser(req);
    next();
  } catch (error) {
    next(error);
  }
}
