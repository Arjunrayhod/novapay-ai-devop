'use client';

import { useQuery } from '@tanstack/react-query';
import * as githubApi from '../services/github-api';

export function useRepo() {
  return useQuery({
    queryKey: ['github', 'repo'],
    queryFn: githubApi.fetchRepo,
    refetchInterval: 60_000,
    retry: 2,
    staleTime: 30_000,
  });
}

export function useCommits() {
  return useQuery({
    queryKey: ['github', 'commits'],
    queryFn: () => githubApi.fetchCommits(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useWorkflowRuns() {
  return useQuery({
    queryKey: ['github', 'workflows'],
    queryFn: githubApi.fetchWorkflowRuns,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useReleases() {
  return useQuery({
    queryKey: ['github', 'releases'],
    queryFn: githubApi.fetchReleases,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useContributors() {
  return useQuery({
    queryKey: ['github', 'contributors'],
    queryFn: githubApi.fetchContributors,
    staleTime: 300_000,
  });
}

export function usePullRequests() {
  return useQuery({
    queryKey: ['github', 'pull-requests'],
    queryFn: githubApi.fetchPullRequests,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useLatestCommit() {
  return useQuery({
    queryKey: ['github', 'latest-commit'],
    queryFn: githubApi.fetchLatestCommit,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useLatestRelease() {
  return useQuery({
    queryKey: ['github', 'latest-release'],
    queryFn: githubApi.fetchLatestRelease,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useGitHub() {
  const repoQuery = useRepo();
  const commitsQuery = useCommits();
  const workflowQuery = useWorkflowRuns();
  const releasesQuery = useReleases();
  const contributorsQuery = useContributors();
  const prsQuery = usePullRequests();

  const isLoading =
    repoQuery.isLoading ||
    commitsQuery.isLoading ||
    workflowQuery.isLoading ||
    releasesQuery.isLoading ||
    contributorsQuery.isLoading ||
    prsQuery.isLoading;

  const isError = repoQuery.isError || commitsQuery.isError || workflowQuery.isError || releasesQuery.isError || contributorsQuery.isError || prsQuery.isError;

  const refetchAll = () => {
    repoQuery.refetch();
    commitsQuery.refetch();
    workflowQuery.refetch();
    releasesQuery.refetch();
    contributorsQuery.refetch();
    prsQuery.refetch();
  };

  const firstError = repoQuery.error ?? commitsQuery.error ?? workflowQuery.error ?? releasesQuery.error ?? contributorsQuery.error ?? prsQuery.error;

  return {
    repo: repoQuery.data,
    commits: commitsQuery.data,
    workflowRuns: workflowQuery.data,
    releases: releasesQuery.data,
    contributors: contributorsQuery.data,
    pullRequests: prsQuery.data,
    isLoading,
    isError,
    error: firstError,
    refetch: refetchAll,
  };
}
