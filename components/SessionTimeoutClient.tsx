"use client";

import { useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

// 30 minutes
const TIMEOUT_MS = 30 * 60 * 1000;

// Throttle activity resets so we don't spam schedule calls
const ACTIVITY_THROTTLE_MS = 1000;

export default function SessionTimeoutClient() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(0);

  // Track auth state without repeatedly fetching session
  const isLoggedInRef = useRef<boolean>(false);

  useEffect(() => {
    const supabase = supabaseBrowser();

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const scheduleTimeout = () => {
      clearTimer();

      timerRef.current = setTimeout(async () => {
        // Only sign out if user is still logged in
        if (!isLoggedInRef.current) return;

        try {
          await supabase.auth.signOut();
        } catch {
          // ignore network issues; we still redirect
        } finally {
          window.location.assign("/login");
        }
      }, TIMEOUT_MS);
    };

    // Initialize login flag once (safe, one-time fetch)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        isLoggedInRef.current = !!data.session;
        if (isLoggedInRef.current) scheduleTimeout();
      })
      .catch(() => {
        // If we can't check session, do nothing (avoid loops)
        isLoggedInRef.current = false;
      });

    // Keep login flag updated without polling
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      isLoggedInRef.current = !!session;

      // If they just logged in, start the timer
      if (isLoggedInRef.current) scheduleTimeout();

      // If they logged out, stop the timer
      if (!isLoggedInRef.current) clearTimer();
    });

    const activityHandler = () => {
      // Only reschedule if logged in
      if (!isLoggedInRef.current) return;

      const now = Date.now();
      if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
      lastActivityRef.current = now;

      scheduleTimeout();
    };

    // Activity events
    window.addEventListener("mousemove", activityHandler);
    window.addEventListener("keydown", activityHandler);
    window.addEventListener("mousedown", activityHandler);
    window.addEventListener("scroll", activityHandler, { passive: true });
    window.addEventListener("touchstart", activityHandler, { passive: true });

    return () => {
      clearTimer();
      sub.subscription.unsubscribe();

      window.removeEventListener("mousemove", activityHandler);
      window.removeEventListener("keydown", activityHandler);
      window.removeEventListener("mousedown", activityHandler);
      window.removeEventListener("scroll", activityHandler);
      window.removeEventListener("touchstart", activityHandler);
    };
  }, []);

  return null;
}
