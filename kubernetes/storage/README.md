# Storage Strategy

StorageClass definitions and CSI driver configurations for the AegisAI platform.

## StorageClass Tiers

| Name | Type | Reclaim | Binding | Use Case |
|------|------|---------|---------|----------|
| `aegisai-gp3` | EBS gp3 | Delete | Immediate | General purpose (default) |
| `aegisai-gp3-retain` | EBS gp3 | Retain | Immediate | StatefulSets with data retention |
| `aegisai-efs` | EFS | Delete | Immediate | Shared storage (RWX) |
| `aegisai-io2` | EBS io2 | Delete | Immediate | High-performance DB workloads |

## CSI Drivers

| Driver | Storage Class | Status |
|--------|---------------|--------|
| EBS CSI Driver | gp3, io2 | Installed by EKS addon |
| EFS CSI Driver | efs | Installed by EKS addon |

## Volume Binding Modes

| Mode | StorageClasses | Use Case |
|------|---------------|----------|
| `WaitForFirstConsumer` | gp3, io2 | Multi-AZ workloads — pod scheduling determines AZ |
| `Immediate` | efs | Cluster-wide shared storage |

## Default StorageClass

`aegisai-gp3` is the default StorageClass. All PVCs without an explicit `storageClassName` use gp3.

## Encryption

- EBS volumes encrypted by default with AWS managed keys (or customer KMS key)
- EFS encryption at rest enabled by default
- Encryption in transit: EFS uses TLS for mount targets

## Directory

```
storage/
├── README.md
├── kustomization.yaml
└── storage-classes/
    ├── gp3.yaml              # Default: EBS gp3, Delete, WaitForFirstConsumer
    ├── gp3-retain.yaml       # EBS gp3, Retain, WaitForFirstConsumer
    ├── io2.yaml              # EBS io2, Delete, WaitForFirstConsumer
    └── efs.yaml              # EFS, Delete, Immediate
```

> CSI drivers are installed via EKS addons (managed outside this Kustomize tree).
