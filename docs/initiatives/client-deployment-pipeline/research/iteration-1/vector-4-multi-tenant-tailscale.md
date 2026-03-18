# Vector 4: Multi-Tenant Tailscale Topology

**Question:** What are real-world patterns for MSPs managing multiple isolated client environments on Tailscale? Own tailnet per client vs shared tailnet with ACLs?
**Agent dispatched:** 2026-03-16

## Findings

### Tailscale's Native Multi-Tailnet Support (Alpha)

- Tailscale now supports multiple tailnets per organization, all backed by a single identity provider. Each tailnet gets its own policy file, tags, devices, and settings. You can assign specific owners and admins per tailnet. ([Multiple tailnets alpha blog](https://tailscale.com/blog/multiple-tailnets-alpha), [Manage multiple tailnets docs](https://tailscale.com/kb/1509/multiple-tailnets))

- API-created tailnets are a distinct variant: no human users, only tagged devices, not managed via admin console. Designed for automation, OEM, and integration. Early testers are spinning up one tailnet per customer to provide secure connectivity between their infrastructure and the customer's environment. ([Multiple tailnets alpha blog](https://tailscale.com/blog/multiple-tailnets-alpha))

- The feature is currently in alpha. Must contact Tailscale sales to enable. Not yet self-service. ([Multiple tailnets docs](https://tailscale.com/kb/1509/multiple-tailnets))

- Identity provider groups sync across all tailnets in the organization (Google Workspace, Okta, Microsoft Entra ID). ([Multiple tailnets docs](https://tailscale.com/kb/1509/multiple-tailnets))

### Per-Client Tailnet Model (Recommended)

- Tailscale's own framing positions per-customer tailnets as the intended pattern: "A per-customer or per-project tailnet provides strong isolation, predictable networking, and straightforward lifecycle management." ([Multiple tailnets alpha blog](https://tailscale.com/blog/multiple-tailnets-alpha))

- TailOps (`mmit-brad/tailops`) is a third-party CLI toolkit built specifically for MSPs managing multiple client tailnets. Enterprise-grade, supports RMM integration, CI/CD automation, and complete Tailscale API v2 coverage. ([GitHub: tailops](https://github.com/mmit-brad/tailops))

- Per-client tailnets provide hard isolation — separate ACL policies, separate device registries, separate DNS namespaces. A misconfiguration in one client's policy cannot leak access to another.

### Shared-Tailnet-with-ACL Model (Not Recommended)

- ACLs are deny-by-default and locally enforced. You can create microsegments where segments cannot access each other. ([ACL policy examples](https://tailscale.com/kb/1192/acl-samples))

- Tailscale is migrating from ACLs to "Grants" — next-gen policy syntax controlling both network and application layer access. Grants get all new features; ACLs are frozen. ([Grants vs ACLs](https://tailscale.com/kb/1467/grants-vs-acls))

- Shared-tailnet isolation is weaker: all devices share the same DNS namespace, device registry, and policy file. Wider blast radius on policy errors.

### Support Access Across Tailnets (Node Sharing)

- Tailscale supports sharing individual machines across tailnet boundaries. Shared machines are quarantined by default — can receive incoming connections but cannot initiate outbound. ([Share your machines docs](https://tailscale.com/kb/1084/sharing))

- This is the support access mechanism: Sherpa shares a management node into each client's tailnet. Client controls acceptance and can revoke.

### Simultaneous Multi-Tailnet Limitation

- A single device cannot connect to multiple tailnets simultaneously. Fundamental Tailscale limitation. ([GitHub Issue #183](https://github.com/tailscale/tailscale/issues/183))

- Fast user switching lets you swap between tailnets quickly but only one at a time. ([Fast user switching docs](https://tailscale.com/kb/1225/fast-user-switching))

- Linux workarounds: multiple `tailscaled` instances with different sockets/TUN interfaces, network namespaces, or userspace SOCKS5 proxy mode. ([GitHub Issue #5721](https://github.com/tailscale/tailscale/issues/5721), [James Guthrie blog](https://jamesguthrie.ch/blog/multi-tailnet-unlocking-access-to-multiple-tailscale-networks/))

- API-created tailnets may sidestep this for server-side management — manage via API without joining as a device.

### Pricing

- Personal plan: Free, 3 users, 100 devices. Starter: $6/user/month. Premium: $18/user/month. Enterprise: contact sales. ([Tailscale pricing](https://tailscale.com/pricing))

- Billing is per active user per tailnet per month. VPS authenticates via auth key with tags, not as a user. ([Pricing FAQ](https://tailscale.com/kb/1251/pricing-faq))

- Multiple tailnets pricing not publicly documented for MSP scenarios.

### Client Handoff

- Tailnet ownership can be transferred via admin console. ([Changing user roles](https://tailscale.com/kb/1171/changing-user-roles))

- No documented tailnet-to-tailnet device migration. Moving devices from Sherpa's tailnet to client-owned requires re-authenticating each device. Strong argument for provisioning on client's own tailnet from day one.

### Tailscale Services

- Tailscale Services (GA late 2025) lets you publish internal resources as named services with stable MagicDNS names and granular access controls. ([Services GA blog](https://tailscale.com/blog/services-ga))

- Relevant for exposing Studio, MCP, and Ollama as discoverable services within a client's tailnet.

## Sources

- [Multiple tailnets alpha blog](https://tailscale.com/blog/multiple-tailnets-alpha)
- [Manage multiple tailnets docs](https://tailscale.com/kb/1509/multiple-tailnets)
- [TailOps - MSP CLI toolkit](https://github.com/mmit-brad/tailops)
- [Share your machines docs](https://tailscale.com/kb/1084/sharing)
- [ACL policy examples](https://tailscale.com/kb/1192/acl-samples)
- [Grants vs ACLs](https://tailscale.com/kb/1467/grants-vs-acls)
- [Access control docs](https://tailscale.com/kb/1393/access-control)
- [Tailscale pricing](https://tailscale.com/pricing)
- [Pricing FAQ](https://tailscale.com/kb/1251/pricing-faq)
- [GitHub Issue #183 - Multiple tailnets simultaneously](https://github.com/tailscale/tailscale/issues/183)
- [GitHub Issue #5721 - Multi-tailnet workarounds](https://github.com/tailscale/tailscale/issues/5721)
- [Multi-Tailnet blog by James Guthrie](https://jamesguthrie.ch/blog/multi-tailnet-unlocking-access-to-multiple-tailscale-networks/)
- [Fast user switching docs](https://tailscale.com/kb/1225/fast-user-switching)
- [Tailscale Services GA blog](https://tailscale.com/blog/services-ga)
- [Tailscale Services beta blog](https://tailscale.com/blog/services-beta)
- [Auth keys docs](https://tailscale.com/kb/1085/auth-keys)
- [OAuth clients docs](https://tailscale.com/kb/1215/oauth-clients)
- [Ephemeral nodes docs](https://tailscale.com/kb/1111/ephemeral-nodes)
- [Changing user roles docs](https://tailscale.com/kb/1171/changing-user-roles)
- [Lawrence Systems forum - MSP discussion](https://forums.lawrencesystems.com/t/implementing-tailscale-netbird-for-smbs/21754)

## Implications

**Recommended topology: one tailnet per client, managed under Sherpa's organization.**

1. **Hard isolation by default.** Each client gets their own policy file, device registry, and DNS namespace. No cross-client leakage possible from ACL misconfiguration. Critical for data sovereignty and regulated clients.

2. **Clean handoff story.** Client takes ownership of their tailnet — no device re-authentication, no policy migration. Starting on a shared Sherpa tailnet would require re-provisioning every device at handoff.

3. **Support access via node sharing.** Sherpa shares a management node into each client's tailnet (quarantined by default). Client controls acceptance and revocation. Cleaner than ACL-based support access.

4. **API-created tailnets for automation.** `sherpa init --remote` can use the Tailscale API to create a client tailnet, generate auth keys, and provision devices programmatically.

5. **Tailscale is building toward this model.** Multi-tailnet feature, API-created tailnets, and TailOps ecosystem all point to per-client tailnets as the expected MSP pattern.

## Open Questions

1. Multi-tailnet alpha availability timeline — production-ready, or need fallback (separate Tailscale accounts per client)?
2. API-created tailnets vs human-managed — do clients need admin console access to their tailnet?
3. Tailnet ownership model: (a) Sherpa creates child tailnets, (b) client owns account + Sherpa gets admin, (c) hybrid with transfer at handoff
4. Headscale (open-source Tailscale control server) for enterprise clients with strict data sovereignty
5. Pricing at scale — sustainable at 20+ client tailnets, or need MSP/reseller arrangement?
6. Cross-tailnet health monitoring — how does Sherpa's dashboard aggregate device status across separate client tailnets via API?
