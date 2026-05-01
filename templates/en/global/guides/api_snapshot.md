# api_snapshot.json

- `endpoints[]`: HTTP/RPC/GraphQL endpoint registry.
- `endpoints[].method`: HTTP method or operation kind.
- `endpoints[].path`: route path or operation name.
- `endpoints[].request`: request params/body summary.
- `endpoints[].response`: response shape summary.
- `endpoints[].owner`: task id that owns the endpoint.

Invariants:
- Register endpoints before or alongside implementation.
- Keep request/response names aligned with code and spec.