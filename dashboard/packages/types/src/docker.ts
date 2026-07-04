export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  ports: string[];
  created: string;
  size: string;
  mounts: string[];
  networks: string[];
  command: string;
}

export type ContainerStatus = 'running' | 'exited' | 'paused' | 'restarting' | 'removing' | 'dead' | 'created';

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
  vulnerabilities: number;
}

export interface DockerNetwork {
  name: string;
  driver: string;
  scope: string;
  subnet: string;
  gateway: string;
  containers: number;
}

export interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  size: string;
  status: string;
}

export interface ComposeService {
  name: string;
  image: string;
  ports: string[];
  volumes: string[];
  environment: string[];
  dependsOn: string[];
  healthcheck: boolean;
  status: ContainerStatus;
}

export interface ComposeProject {
  name: string;
  path: string;
  services: ComposeService[];
  networks: string[];
  volumes: string[];
  status: 'running' | 'partial' | 'stopped' | 'error';
}
