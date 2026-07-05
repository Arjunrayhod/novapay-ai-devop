'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import * as dockerApi from '../services/docker-api';
import type { DockerEvent } from '../types';

export function useDockerInfo() {
  return useQuery({
    queryKey: ['docker', 'info'],
    queryFn: dockerApi.fetchDockerInfo,
    refetchOnWindowFocus: false,
  });
}

export function useDockerVersion() {
  return useQuery({
    queryKey: ['docker', 'version'],
    queryFn: dockerApi.fetchDockerVersion,
    refetchOnWindowFocus: false,
  });
}

export function useContainers() {
  return useQuery({
    queryKey: ['docker', 'containers'],
    queryFn: dockerApi.fetchContainers,
    refetchInterval: 10_000,
  });
}

export function useImages() {
  return useQuery({
    queryKey: ['docker', 'images'],
    queryFn: dockerApi.fetchImages,
    refetchOnWindowFocus: false,
  });
}

export function useNetworks() {
  return useQuery({
    queryKey: ['docker', 'networks'],
    queryFn: dockerApi.fetchNetworks,
    refetchOnWindowFocus: false,
  });
}

export function useVolumes() {
  return useQuery({
    queryKey: ['docker', 'volumes'],
    queryFn: dockerApi.fetchVolumes,
    refetchOnWindowFocus: false,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ['docker', 'stats'],
    queryFn: dockerApi.fetchStats,
    refetchInterval: 2_000,
  });
}

export function useEvents() {
  const [events, setEvents] = useState<DockerEvent[]>([]);

  useEffect(() => {
    const es = dockerApi.createEventSource();
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as DockerEvent;
        if (data.type === 'error') return;
        setEvents((prev) => [data, ...prev].slice(0, 50));
      } catch {
        // ignore malformed events
      }
    };
    es.onerror = () => {
      // connection lost — keep existing events
    };
    return () => es.close();
  }, []);

  return events;
}

export function useDockerOverview() {
  const info = useDockerInfo();
  const containers = useContainers();
  const images = useImages();
  const networks = useNetworks();
  const volumes = useVolumes();
  const version = useDockerVersion();
  const stats = useStats();

  const isLoading = info.isLoading || containers.isLoading;
  const isError = info.isError;

  const refetch = useCallback(() => {
    info.refetch();
    containers.refetch();
    images.refetch();
    networks.refetch();
    volumes.refetch();
    version.refetch();
    stats.refetch();
  }, [info, containers, images, networks, volumes, version, stats]);

  return {
    info: info.data,
    containers: containers.data,
    images: images.data,
    networks: networks.data,
    volumes: volumes.data,
    version: version.data,
    stats: stats.data,
    isLoading,
    isError,
    refetch,
  };
}
