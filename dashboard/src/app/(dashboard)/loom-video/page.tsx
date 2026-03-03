"use client";

import { Video, Play, ExternalLink } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";

export default function LoomVideoPage() {
  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader title="Loom-Video" subtitle="Tool-Walkthrough und Demo" icon={Video} />

      {/* Card 1: Video-Embed */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="aspect-video bg-black/20 rounded-xl flex items-center justify-center flex-col gap-4">
            {/* TODO: Loom-Embed-URL hier einfügen */}
            {/* <iframe src="https://www.loom.com/embed/VIDEO_ID" frameBorder="0" allowFullScreen className="w-full h-full rounded-xl" /> */}
            <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <Play size={48} />
            </div>
            <span className="text-muted-foreground text-sm">Video wird vorbereitet...</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Hier stelle ich das n8n Voice Agent Dashboard vor – von der Lead-Qualifizierung über die Pipeline bis zur Sentiment-Analyse.
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Externer Link zu Loom */}
      <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer">
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <ExternalLink size={18} />
              Alle Videos auf Loom ansehen
            </div>
            <p className="text-muted-foreground text-sm">Weitere Demos und Walkthroughs</p>
          </CardContent>
        </Card>
      </a>
    </div>
  );
}
