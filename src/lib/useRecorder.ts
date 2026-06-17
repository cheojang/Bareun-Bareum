"use client";
import { useState, useRef, useCallback, useEffect } from "react";

export type RecordState = "idle" | "recording" | "recorded";

export function useRecorder() {
  const [recState, setRecState] = useState<RecordState>("idle");
  const mrRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const urlRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRec = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecState("recorded");
      };
      mr.start();
      mrRef.current = mr;
      setRecState("recording");
    } catch { /* permission denied */ }
  }, []);

  const stopRec = useCallback(() => { mrRef.current?.stop(); }, []);

  const playRec = useCallback(() => {
    if (urlRef.current) new Audio(urlRef.current).play().catch(() => {});
  }, []);

  const resetRec = useCallback(() => {
    mrRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setRecState("idle");
  }, []);

  useEffect(() => () => {
    mrRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { recState, startRec, stopRec, playRec, resetRec };
}
