'use client';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  Handle,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import { Server, Database, Globe, Shield, HardDrive } from 'lucide-react';
import { cn } from '../../lib/utils';

const iconMap: Record<string, typeof Server> = {
  api: Server,
  workers: HardDrive,
  db: Database,
  cache: Database,
  cdn: Globe,
  gateway: Shield,
};

const statusColors: Record<string, string> = {
  success: 'bg-success-500 shadow-lg shadow-success-500/30',
  warning: 'bg-warning-500 shadow-lg shadow-warning-500/30',
  danger: 'bg-danger-500 shadow-lg shadow-danger-500/30',
  inactive: 'bg-neutral-600',
};

function TopologyNode({ data }: Node) {
  const Icon = iconMap[data.icon as string] ?? Server;
  const status = (data.status as string) ?? 'success';
  const label = (data.label as string) ?? '';
  const accentColor = data.accentColor as string ?? '#3b82f6';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="relative flex flex-col items-center gap-1.5"
    >
      <Handle type="target" position={Position.Top} className="!bg-primary-500 !w-2 !h-2 !border-2" style={{ borderColor: 'var(--color-surface-elevated)' }} />
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl',
          'border transition-all duration-200',
          'shadow-lg',
        )}
        style={{
          background: 'linear-gradient(135deg, var(--color-surface-elevated), var(--color-panel-bg))',
          borderColor: `${accentColor}30`,
          boxShadow: `0 0 20px ${accentColor}10`,
        }}
      >
        <Icon className="h-6 w-6" style={{ color: accentColor }} />
      </div>
      <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className={cn('h-1.5 w-1.5 rounded-full', statusColors[status])} />
      <Handle type="source" position={Position.Bottom} className="!bg-accent-500 !w-2 !h-2 !border-2" style={{ borderColor: 'var(--color-surface-elevated)' }} />
    </motion.div>
  );
}

const nodeTypes = { topologyNode: TopologyNode } as any;

const initialNodes = [
  { id: 'gateway', type: 'topologyNode', position: { x: 250, y: 0 }, data: { label: 'Gateway', icon: 'gateway', status: 'success', accentColor: '#3b82f6' } },
  { id: 'cdn', type: 'topologyNode', position: { x: 430, y: 0 }, data: { label: 'CDN', icon: 'cdn', status: 'success', accentColor: '#8b5cf6' } },
  { id: 'api', type: 'topologyNode', position: { x: 250, y: 130 }, data: { label: 'API', icon: 'api', status: 'success', accentColor: '#06b6d4' } },
  { id: 'workers', type: 'topologyNode', position: { x: 70, y: 260 }, data: { label: 'Workers', icon: 'workers', status: 'success', accentColor: '#22c55e' } },
  { id: 'db', type: 'topologyNode', position: { x: 250, y: 260 }, data: { label: 'Database', icon: 'db', status: 'success', accentColor: '#f59e0b' } },
  { id: 'cache', type: 'topologyNode', position: { x: 430, y: 260 }, data: { label: 'Cache', icon: 'cache', status: 'warning', accentColor: '#ef4444' } },
];

const initialEdges = [
  { id: 'e-gw-api', source: 'gateway', target: 'api', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
  { id: 'e-api-wk', source: 'api', target: 'workers', animated: true, style: { stroke: '#06b6d4', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' } },
  { id: 'e-api-db', source: 'api', target: 'db', animated: true, style: { stroke: '#f59e0b', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
  { id: 'e-api-cache', source: 'api', target: 'cache', animated: true, style: { stroke: '#ef4444', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } },
  { id: 'e-gw-cdn', source: 'gateway', target: 'cdn', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
  { id: 'e-wk-db', source: 'workers', target: 'db', style: { stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' } },
  { id: 'e-db-cache', source: 'db', target: 'cache', style: { stroke: 'var(--color-border)', strokeWidth: 1, strokeDasharray: '4 4' } },
];

interface TopologyViewProps {
  className?: string;
}

export function TopologyView({ className }: TopologyViewProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div
      className={cn('rounded-xl overflow-hidden border', className)}
      style={{
        height: 400,
        backgroundColor: 'var(--color-panel-bg)',
        borderColor: 'var(--color-border-light)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        minZoom={0.5}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { stroke: 'var(--color-border)', strokeWidth: 1.5 },
        }}
        className="topology-flow"
      >
        <Background color="var(--color-border-subtle)" gap={20} size={1} />
        <Controls
          showInteractive={false}
          className="!rounded-lg !shadow-lg"
          style={{
            background: 'var(--color-surface-elevated)',
            borderColor: 'var(--color-border-light)',
            bottom: 10,
            left: 10,
          }}
        />
        <MiniMap
          nodeStrokeColor="var(--color-primary-500)"
          nodeColor="var(--color-surface-elevated)"
          nodeBorderRadius={8}
          maskColor="var(--color-overlay)"
          pannable
          zoomable
          style={{
            background: 'var(--color-panel-bg)',
            border: '1px solid var(--color-border-light)',
            borderRadius: '8px',
            bottom: 10,
            right: 10,
          }}
        />
      </ReactFlow>
    </div>
  );
}
