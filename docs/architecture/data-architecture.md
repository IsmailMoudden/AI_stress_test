# Data Architecture

The future data architecture must preserve provenance, auditability, and explicit approval state.

## Future Stores

- PostgreSQL for transactional scenario, workflow, approval, and audit records.
- Redis for short-lived coordination, queues, and cache use cases.
- Neo4j or another graph store for relationship-heavy knowledge and lineage use cases if justified.
- Vector storage for retrieval use cases where approved by data governance.

## Data State Principles

- Draft state is mutable and user-controlled.
- Approved versions are immutable.
- AI suggestions are separate from approved scenario state until accepted.
- Official valuation outputs reference risk engine execution identifiers.
- Data retention must follow internal policy and regulatory obligations.

