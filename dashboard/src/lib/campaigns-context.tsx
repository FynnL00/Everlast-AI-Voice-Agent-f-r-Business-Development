"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Campaign } from "@/lib/types";

interface CampaignsContextValue {
  campaigns: Campaign[];
  loading: boolean;
  fetchCampaign: (id: string) => Promise<Campaign | null>;
}

const CampaignsContext = createContext<CampaignsContextValue | null>(null);

export function useCampaigns(): CampaignsContextValue {
  const ctx = useContext(CampaignsContext);
  if (!ctx) throw new Error("useCampaigns must be used within a CampaignProvider");
  return ctx;
}

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch campaigns:", error.message);
    }
    if (data) {
      setCampaigns(data as Campaign[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCampaigns();

    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel("campaigns-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "campaigns" },
        (payload) => {
          setCampaigns((prev) => [payload.new as Campaign, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "campaigns" },
        (payload) => {
          const updated = payload.new as Campaign;
          setCampaigns((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "campaigns" },
        (payload) => {
          const oldId = (payload.old as { id: string }).id;
          setCampaigns((prev) => prev.filter((c) => c.id !== oldId));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchCampaigns]);

  const fetchCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch campaign:", error.message);
      return null;
    }

    return data as Campaign;
  }, []);

  const value = useMemo<CampaignsContextValue>(
    () => ({ campaigns, loading, fetchCampaign }),
    [campaigns, loading, fetchCampaign]
  );

  return (
    <CampaignsContext.Provider value={value}>
      {children}
    </CampaignsContext.Provider>
  );
}
