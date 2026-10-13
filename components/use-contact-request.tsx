"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { fetchProfile, saveProfile, sendContactRequest } from "@/lib/api";
import { teacherToPayload } from "@/lib/profile-payload";
import { withAuthRetry } from "@/lib/session";
import type { MatchResult } from "@/lib/types";
import { LineIdPrompt } from "./line-id-prompt";

// Shared by the matches and favorites tabs: sends a contact request for a
// card, asking for the viewer's own LINE ID first when none is on file.
export function useContactRequest(
  setMatches: Dispatch<SetStateAction<MatchResult[]>>,
) {
  const [promptFor, setPromptFor] = useState<string | null>(null);

  function setContact(teacherId: string, contact: MatchResult["contact"]) {
    setMatches((prev) =>
      prev.map((m) => (m.teacher.id === teacherId ? { ...m, contact } : m)),
    );
  }

  async function send(teacherId: string) {
    setContact(teacherId, {
      requestId: "",
      status: "pending",
      direction: "outgoing",
    });
    try {
      await withAuthRetry((token) => sendContactRequest(token, teacherId));
    } catch (err) {
      setContact(teacherId, null);
      window.alert((err as Error).message);
    }
  }

  async function request(teacherId: string) {
    try {
      const { result } = await withAuthRetry((token) => fetchProfile(token));
      if (!result.teacher?.line_id) {
        setPromptFor(teacherId);
        return;
      }
    } catch {
      // Fall through: the server enforces the LINE ID rule and reports it.
    }
    await send(teacherId);
  }

  async function saveLineIdAndSend(lineId: string) {
    const target = promptFor;
    if (!target) return;
    await withAuthRetry(async (token) => {
      const { teacher, destinations } = await fetchProfile(token);
      if (!teacher) throw new Error("ไม่พบโปรไฟล์");
      await saveProfile(
        token,
        teacherToPayload(teacher, destinations, { lineId }),
      );
    });
    setPromptFor(null);
    await send(target);
  }

  const prompt = (
    <LineIdPrompt
      open={promptFor !== null}
      onCancel={() => setPromptFor(null)}
      onSave={saveLineIdAndSend}
    />
  );

  return { request, prompt };
}
