import { api } from '@aegisai/utils';
import type {
  ContainerInfo,
  ImageInfo,
  NetworkInfo,
  VolumeInfo,
  ContainerStats,
  DockerInfo,
  DockerVersion,
} from '../types';

const BASE = '/api/docker';

export async function fetchDockerInfo(): Promise<DockerInfo> {
  return api.get<DockerInfo>(`${BASE}/info`);
}

export async function fetchDockerVersion(): Promise<DockerVersion> {
  return api.get<DockerVersion>(`${BASE}/version`);
}

export async function fetchContainers(): Promise<ContainerInfo[]> {
  return api.get<ContainerInfo[]>(`${BASE}/containers`);
}

export async function fetchContainer(id: string): Promise<ContainerInfo> {
  return api.get<ContainerInfo>(`${BASE}/container/${id}`);
}

export async function fetchImages(): Promise<ImageInfo[]> {
  return api.get<ImageInfo[]>(`${BASE}/images`);
}

export async function fetchNetworks(): Promise<NetworkInfo[]> {
  return api.get<NetworkInfo[]>(`${BASE}/networks`);
}

export async function fetchVolumes(): Promise<VolumeInfo[]> {
  return api.get<VolumeInfo[]>(`${BASE}/volumes`);
}

export async function fetchStats(): Promise<ContainerStats[]> {
  return api.get<ContainerStats[]>(`${BASE}/stats`);
}

export function createEventSource(): EventSource {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return new EventSource(`${base}${BASE}/events`);
}
