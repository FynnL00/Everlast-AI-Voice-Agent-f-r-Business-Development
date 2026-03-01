import { redirect } from "next/navigation";

export default function SentimentPage() {
  redirect("/analytics?tab=sentiment");
}
