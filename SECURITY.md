# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

The AegisAI platform handles financial workloads and regulated data.
Security is our highest priority.

### Private Disclosure

If you discover a security vulnerability, please report it privately:

1. **DO NOT** create a public GitHub issue.
2. **DO NOT** discuss the vulnerability in public channels.
3. Send details to the Security team at **security@aegisai.internal**.
4. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Affected versions/components
   - Any proof-of-concept code (if available)

### Response SLA

| Severity | Initial Response | Fix Target |
|----------|-----------------|------------|
| CRITICAL | 4 hours         | 48 hours   |
| HIGH     | 8 hours         | 7 days     |
| MEDIUM   | 24 hours        | 30 days    |
| LOW      | 72 hours        | 90 days    |

### What to Expect

1. Acknowledgment within SLA timeframe.
2. Regular updates on progress (every 24h for CRITICAL/HIGH).
3. Coordinated disclosure date once fix is ready.
4. Credit in security advisories (if desired).

## Security Practices

- All code is scanned for secrets before commit (detect-secrets)
- SAST (Semgrep, CodeQL) runs on every PR
- SCA (Trivy) blocks vulnerable dependencies
- Container images are scanned and signed
- Infrastructure is validated with Checkov and tfsec
- Runtime security monitored with Falco
- OPA/Gatekeeper enforces pod security standards

## Bug Bounty

We do not currently operate a public bug bounty program.
Security researchers who report valid vulnerabilities will be
recognized in our security advisories.

## Disclosure Policy

We follow a 90-day disclosure timeline:
- Fix developed internally
- Fix deployed to production
- Public advisory published

## Contact

Security team: security@aegisai.internal
PGP key: Available on request
