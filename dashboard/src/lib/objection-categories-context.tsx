"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { ObjectionCategory } from "@/lib/types";

interface ObjectionCategoriesContextValue {
  categories: ObjectionCategory[];
  loading: boolean;
}

const ObjectionCategoriesContext =
  createContext<ObjectionCategoriesContextValue | null>(null);

export function useObjectionCategories(): ObjectionCategoriesContextValue {
  const ctx = useContext(ObjectionCategoriesContext);
  if (!ctx)
    throw new Error(
      "useObjectionCategories must be used within ObjectionCategoriesProvider"
    );
  return ctx;
}

export function ObjectionCategoriesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, setCategories] = useState<ObjectionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("objection_categories")
      .select("*")
      .eq("is_active", true)
      .order("occurrence_count", { ascending: false });

    if (error) {
      console.error("Failed to fetch objection categories:", error.message);
    }
    if (data) {
      setCategories(data as ObjectionCategory[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();

    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel("objection-categories-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "objection_categories" },
        () => fetchCategories()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchCategories]);

  return (
    <ObjectionCategoriesContext.Provider value={{ categories, loading }}>
      {children}
    </ObjectionCategoriesContext.Provider>
  );
}
