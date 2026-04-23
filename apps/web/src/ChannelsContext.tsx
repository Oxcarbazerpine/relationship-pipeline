import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Channel } from "./types";

interface ChannelsContextValue {
  channels: Channel[];
  loading: boolean;
  reload: () => Promise<void>;
  create: (input: { name: string; color?: string }) => Promise<Channel>;
  update: (id: string, patch: { name?: string; color?: string; order?: number }) => Promise<Channel>;
  remove: (id: string) => Promise<void>;
}

const Ctx = createContext<ChannelsContextValue | null>(null);

export function ChannelsProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const list = await api.listChannels();
    setChannels(list);
  }, []);

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, [reload]);

  const create = useCallback(async (input: { name: string; color?: string }) => {
    const created = await api.createChannel(input);
    setChannels((cs) => [...cs, created].sort((a, b) => a.order - b.order));
    return created;
  }, []);

  const update = useCallback(async (id: string, patch: { name?: string; color?: string; order?: number }) => {
    const updated = await api.updateChannel(id, patch);
    setChannels((cs) => cs.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteChannel(id);
    setChannels((cs) => cs.filter((c) => c.id !== id));
  }, []);

  return (
    <Ctx.Provider value={{ channels, loading, reload, create, update, remove }}>
      {children}
    </Ctx.Provider>
  );
}

export function useChannels() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useChannels must be inside ChannelsProvider");
  return v;
}
