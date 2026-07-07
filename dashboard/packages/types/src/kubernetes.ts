export interface Cluster {
  name: string;
  version: string;
  platform: string;
  nodes: number;
  namespaces: Namespace[];
  status: ClusterStatus;
  uptime: string;
  podCount: number;
  cpuUsage: ResourceUsage;
  memoryUsage: ResourceUsage;
}

export interface Namespace {
  name: string;
  status: 'Active' | 'Terminating';
  labels: Record<string, string>;
  createdAt: string;
  podCount: number;
}

export interface Pod {
  name: string;
  namespace: string;
  node: string;
  status: PodStatus;
  containers: Container[];
  restarts: number;
  age: string;
  cpu: ResourceUsage;
  memory: ResourceUsage;
  labels: Record<string, string>;
}

export type PodStatus = 'Running' | 'Pending' | 'Succeeded' | 'Failed' | 'Unknown' | 'CrashLoopBackOff';

export interface Container {
  name: string;
  image: string;
  ready: boolean;
  restarts: number;
  ports: number[];
  resources: {
    limits: ResourceRequirements;
    requests: ResourceRequirements;
  };
}

export interface ResourceRequirements {
  cpu: string;
  memory: string;
}

export interface ResourceUsage {
  request: string;
  limit: string;
  current: string;
  percentage: number;
}

export interface Deployment {
  name: string;
  namespace: string;
  replicas: number;
  available: number;
  strategy: string;
  image: string;
  createdAt: string;
  conditions: string[];
}

export interface Service {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  ports: ServicePort[];
  selector: Record<string, string>;
}

export interface ServicePort {
  name: string;
  port: number;
  targetPort: number | string;
  protocol: string;
}

export interface Ingress {
  name: string;
  namespace: string;
  host: string;
  paths: string[];
  tls: boolean;
  className: string;
}

export interface NetworkPolicy {
  name: string;
  namespace: string;
  podSelector: Record<string, string>;
  ingress: NetworkPolicyRule[];
  egress: NetworkPolicyRule[];
  policyTypes: string[];
}

export interface NetworkPolicyRule {
  from?: PolicyPeer[];
  to?: PolicyPeer[];
  ports?: PolicyPort[];
}

export interface PolicyPeer {
  ipBlock?: { cidr: string };
  namespaceSelector?: Record<string, string>;
  podSelector?: Record<string, string>;
}

export interface PolicyPort {
  port: number | string;
  protocol: string;
}

export type ClusterStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
