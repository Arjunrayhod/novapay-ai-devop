'use client';

import { MetricCard } from '@aegisai/ui';
import { Star, GitFork, Eye, Bug, Users, FileCode } from 'lucide-react';
import type { GitHubRepo, GitHubContributor, GitHubPullRequest } from '../types';

interface GitHubRepoStatsProps {
  repo?: GitHubRepo;
  contributors?: GitHubContributor[];
  pullRequests?: GitHubPullRequest[];
  isLoading?: boolean;
}

export function GitHubRepoStats({ repo, contributors, pullRequests, isLoading }: GitHubRepoStatsProps) {
  const stats = [
    {
      title: 'Stars',
      value: repo ? repo.stargazers_count.toLocaleString() : '\u2014',
      icon: <Star className="h-4 w-4" />,
      trend: 'up' as const,
      trendValue: repo ? `${repo.stargazers_count}` : '\u2014',
      description: 'Total stars',
      loading: isLoading || !repo,
    },
    {
      title: 'Forks',
      value: repo ? repo.forks_count.toLocaleString() : '\u2014',
      icon: <GitFork className="h-4 w-4" />,
      trend: 'neutral' as const,
      description: 'Total forks',
      loading: isLoading || !repo,
    },
    {
      title: 'Watchers',
      value: repo ? repo.watchers_count.toLocaleString() : '\u2014',
      icon: <Eye className="h-4 w-4" />,
      description: 'Following',
      loading: isLoading || !repo,
    },
    {
      title: 'Open Issues',
      value: repo ? repo.open_issues_count.toLocaleString() : '\u2014',
      icon: <Bug className="h-4 w-4" />,
      health: (repo?.open_issues_count ?? 0) > 10 ? 'warning' as const : 'success' as const,
      description: 'Needs attention',
      loading: isLoading || !repo,
    },
    {
      title: 'Contributors',
      value: contributors ? `${contributors.length}` : '\u2014',
      icon: <Users className="h-4 w-4" />,
      description: 'Active contributors',
      loading: isLoading || !contributors,
    },
    {
      title: 'Open PRs',
      value: pullRequests ? `${pullRequests.length}` : '\u2014',
      icon: <FileCode className="h-4 w-4" />,
      health: (pullRequests?.length ?? 0) > 5 ? 'warning' as const : 'success' as const,
      description: 'Pull requests',
      loading: isLoading || !pullRequests,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <MetricCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
