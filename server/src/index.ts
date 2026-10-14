import express from "express";
import helmet from "helmet";
import { eq, sql } from "drizzle-orm";
import { adminRouter } from "./routes/admin";
import { publicRouter } from "./routes/public";
import { findAdmin, requireAdmin, requireService } from "./auth";
import { assertConfig, config } from "./config";
import { bootstrap } from "./db/bootstrap";
import { db, initDb } from "./db";
import { admins, files } from "./db/schema";

assertConfig();
await initDb();
await bootstrap();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// The browser never calls this API directly (the website's server does), so there is deliberately no CORS.
app.use(express.json({ limit: "1mb" }));

app.get("/health", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

// Uploaded images/PDFs: public and cacheable (names are random and immutable).
app.get("/files/:name", async (req, res) => {
  if (!/^[a-z0-9-]+\.(jpg|png|webp|pdf)$/.test(req.params.name)) return res.status(404).end();
  const [f] = await db.select().from(files).where(eq(files.name, req.params.name));
  if (!f) return res.status(404).end();
  res
    .set({
      "Content-Type": f.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      ...(f.mime === "application/pdf" ? { "Content-Disposition": `inline; filename="${f.name}"` } : {}),
    })
    .send(Buffer.from(f.data));
});

app.use("/public", requireService, publicRouter);

// Called by the website while signing someone in, to apply the admin allow-list.
app.post("/internal/check-admin", requireService, async (req, res) => {
  const a = await findAdmin(String(req.body?.email ?? ""));
  if (a && req.body?.touch) await db.update(admins).set({ lastLoginAt: new Date(), name: a.name || String(req.body?.name ?? "").slice(0, 120) }).where(eq(admins.id, a.id));
  res.json({ admin: a ? { email: a.email, name: a.name, role: a.role } : null });
});

app.use("/admin", requireService, requireAdmin, adminRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(config.port, () => console.log(`[api] listening on :${config.port}`));
