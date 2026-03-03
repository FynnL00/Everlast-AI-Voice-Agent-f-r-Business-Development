"use client";

import { Video } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

const videos = [
  {
    title: "Demo des n8n Sales Tools",
    description:
      "Live-Demo des Next.js Dashboards – Lead-Qualifizierung, Pipeline, Conversion-Trend und Sentiment-Analyse.",
    src: "/videos/kpi-dashboard.mp4",
  },
  {
    title: "Tech-Stack Erläuterung",
    description:
      "Kompletter Walkthrough durch den Tech-Stack: Vapi Voice Agent, n8n Workflows, Cal.com Buchung und Supabase Datenbank.",
    src: "/videos/tools-workflows.mp4",
  },
];

export default function LoomVideoPage() {
  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Loom-Video"
        subtitle="Tool-Walkthrough und Demo"
        icon={Video}
      />

      {videos.map((video) => (
        <Card key={video.src}>
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-lg font-semibold">{video.title}</h2>
            <div className="aspect-video rounded-xl overflow-hidden bg-black/20">
              <video
                src={video.src}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full rounded-xl"
              />
            </div>
            <p className="text-muted-foreground text-sm">
              {video.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
