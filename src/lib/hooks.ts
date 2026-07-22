"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchDays,
  fetchMembers,
  fetchMembership,
  fetchTrip,
  fetchVisibleTrips,
} from "./supabase/queries";
import type { MemberWithUser, Trip, TripDay, TripMember } from "./types";

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Ocurrió un error inesperado.";
}

export function useVisibleTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No synchronous setState here so the initial mount effect below doesn't
  // trigger an extra render pass — `loading`/`error` already start at the
  // right values; only the async resolution needs to update state.
  const load = useCallback(() => {
    fetchVisibleTrips()
      .then(setTrips)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Manual re-fetch (e.g. after a mutation): reset loading/error up front,
  // called from event handlers rather than an effect.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    load();
  }, [load]);

  return { trips, loading, error, refetch };
}

/** Resolves a trip by UUID or custom slug. `idOrSlug` may be null while a param is hydrating. */
export function useTrip(idOrSlug: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!idOrSlug) {
      setTrip(null);
      setLoading(false);
      return;
    }
    fetchTrip(idOrSlug)
      .then(setTrip)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  useEffect(() => {
    // The `!idOrSlug` branch in `load` resets state synchronously (there's no
    // request to await), which this rule can't distinguish from a real fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    load();
  }, [load]);

  return { trip, loading, error, refetch };
}

export function useMembers(tripId: string | null) {
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!tripId) {
      setMembers([]);
      setLoading(false);
      return;
    }
    fetchMembers(tripId)
      .then(setMembers)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    // The `!tripId` branch in `load` resets state synchronously (there's no
    // request to await), which this rule can't distinguish from a real fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    load();
  }, [load]);

  return { members, loading, error, refetch };
}

export function useDays(tripId: string | null) {
  const [days, setDays] = useState<TripDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!tripId) {
      setDays([]);
      setLoading(false);
      return;
    }
    fetchDays(tripId)
      .then(setDays)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    // The `!tripId` branch in `load` resets state synchronously (there's no
    // request to await), which this rule can't distinguish from a real fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    load();
  }, [load]);

  return { days, loading, error, refetch };
}

/** The current user's own membership row for a trip — drives canEdit/isOrganizer in the UI. */
export function useMembership(tripId: string | null, userId: string | null) {
  const [membership, setMembership] = useState<TripMember | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!tripId || !userId) {
      setMembership(null);
      setLoading(false);
      return;
    }
    fetchMembership(tripId, userId)
      .then(setMembership)
      .finally(() => setLoading(false));
  }, [tripId, userId]);

  useEffect(() => {
    // The guard branch in `load` resets state synchronously (there's no
    // request to await), which this rule can't distinguish from a real fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  return { membership, loading, refetch };
}
