"use client";

import { useCallback } from "react";
import VueverseChatbot from "@/app/components/vueverseChatbot";

const CLOSE_EVENT = "vueverse-chatbot:close-request";

export default function VueverseBotEmbedPage() {
  const requestClose = useCallback(() => {
    if (typeof window === "undefined") return;
    window.parent?.postMessage({ type: CLOSE_EVENT }, "*");
  }, []);

  return (
    <main className="h-dvh w-full bg-white p-0 text-[#163326]">
      <VueverseChatbot embedded onRequestClose={requestClose} />
    </main>
  );
}
