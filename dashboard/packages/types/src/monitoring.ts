export interface MetricQuery {
  query: string;
  start?: string;
  end?: string;
  step?: string;
}

export interface MetricResult {
  metric: Record<string, string>;
  values: [number, string][];
}

export interface PrometheusResponse {
  status: 'success' | 'error';
  data: {
    resultType: 'vector' | 'matrix' | 'scalar' | 'string';
    result: MetricResult[];
  };
}

export interface Alert {
  name: string;
  state: 'firing' | 'pending' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startsAt: string;
  endsAt: string;
  generatorURL: string;
}

export interface GrafanaDashboard {
  uid: string;
  title: string;
  url: string;
  tags: string[];
  starred: boolean;
}

export interface LogEntry {
  timestamp: string;
  line: string;
  labels: Record<string, string>;
}

export interface LogQuery {
  query: string;
  start?: string;
  end?: string;
  limit?: number;
}

export interface Trace {
  traceID: string;
  rootServiceName: string;
  rootOperationName: string;
  startTime: string;
  duration: number;
  spanCount: number;
  status: 'ok' | 'error';
}

export interface Span {
  spanID: string;
  traceID: string;
  operationName: string;
  serviceName: string;
  startTime: string;
  duration: number;
  status: 'ok' | 'error';
  tags: Record<string, string>;
  references: SpanReference[];
}

export interface SpanReference {
  refType: string;
  traceID: string;
  spanID: string;
}
