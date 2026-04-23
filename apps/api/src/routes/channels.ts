import { Router, type RequestHandler } from "express";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

const defaultChannels = [
  { name: "约会 APP", color: "blueLight2" },
  { name: "搭讪", color: "cyanLight2" },
  { name: "介绍", color: "tealLight2" }
];

async function ensureDefaultChannels(prisma: PrismaClient, userId: string) {
  const count = await prisma.channel.count({ where: { userId } });
  if (count > 0) return;
  await prisma.channel.createMany({
    data: defaultChannels.map((d, i) => ({ userId, name: d.name, color: d.color, order: i }))
  });
}

const createSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().optional()
});

const patchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
  order: z.number().int().optional()
});

export function createChannelsRouter(prisma: PrismaClient, auth: RequestHandler) {
  const router = Router();

  router.get("/", auth, async (_req, res) => {
    const user = res.locals.user;
    await ensureDefaultChannels(prisma, user.id);
    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }]
    });
    res.json(channels);
  });

  router.post("/", auth, async (req, res) => {
    const user = res.locals.user;
    const data = createSchema.parse(req.body);
    try {
      const max = await prisma.channel.aggregate({
        where: { userId: user.id },
        _max: { order: true }
      });
      const channel = await prisma.channel.create({
        data: {
          userId: user.id,
          name: data.name,
          color: data.color ?? "blueLight2",
          order: (max._max.order ?? -1) + 1
        }
      });
      res.status(201).json(channel);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        res.status(409).json({ error: "Channel name already exists" });
        return;
      }
      throw e;
    }
  });

  router.patch("/:id", auth, async (req, res) => {
    const user = res.locals.user;
    const data = patchSchema.parse(req.body);
    const existing = await prisma.channel.findFirst({
      where: { id: req.params.id, userId: user.id }
    });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    try {
      const channel = await prisma.channel.update({ where: { id: existing.id }, data });
      res.json(channel);
    } catch (e) {
      if ((e as { code?: string }).code === "P2002") {
        res.status(409).json({ error: "Channel name already exists" });
        return;
      }
      throw e;
    }
  });

  router.delete("/:id", auth, async (req, res) => {
    const user = res.locals.user;
    const existing = await prisma.channel.findFirst({
      where: { id: req.params.id, userId: user.id }
    });
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await prisma.channel.delete({ where: { id: existing.id } });
    res.status(204).end();
  });

  return router;
}
