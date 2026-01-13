# Plan: Admin Security Implementation with MFA & IP Whitelisting

This plan implements multi-factor authentication (MFA), IP whitelisting, and enhanced security for admin users following the specifications in [adminsecurity.md](adminsecurity.md) while adhering to the manual SQL migration process in [PRISMA_MIGRATION_WORKAROUND.md](PRISMA_MIGRATION_WORKAROUND.md).

## Steps

1. **Create feature branch** - `git checkout -b feature/admin-security-mfa` from main branch to isolate changes
2. **Update Prisma schema** - Add MFA fields to [User model](raverpay-api/prisma/schema.prisma), create `AdminIpWhitelist` model, enhance `RefreshToken` with session fields
3. **Generate Prisma client** - Run `pnpm prisma generate` to get TypeScript types before database migration
4. **Create manual SQL migration script** - Write idempotent SQL (`IF NOT EXISTS`) for all schema changes following [PRISMA_MIGRATION_WORKAROUND.md](PRISMA_MIGRATION_WORKAROUND.md)
5. **Execute SQL migration** - Apply SQL script using `psql` with `DIRECT_URL` connection, verify tables created successfully
6. **Install npm packages** - Add `speakeasy`, `qrcode`, `ip-address`, `qrcode.react` to dependencies
7. **Implement MFA backend** - Create 10 new endpoints in [AuthController](raverpay-api/src/auth/auth.controller.ts): setup, verify-setup, verify, verify-backup, disable, regenerate-backup-codes, status, sessions, verify-password-reauth
8. **Create IP whitelist guard** - Build [IpWhitelistGuard](raverpay-api/src/common/guards/ip-whitelist.guard.ts) with CIDR support, apply to admin routes
9. **Enhance session management** - Update [RefreshToken creation](raverpay-api/src/auth/auth.service.ts) to track device/location, implement concurrent session limits (max 3 for admins)
10. **Build admin security controller** - Create [AdminSecurityController](raverpay-api/src/admin/security/admin-security.controller.ts) for IP whitelist CRUD operations
11. **Implement frontend MFA flow** - Update [login page](raverpay-admin/app/login/page.tsx) with MFA step, create [MFA setup page](raverpay-admin/app/dashboard/security/mfa/setup/page.tsx)
12. **Create security settings UI** - Build [security settings page](raverpay-admin/app/dashboard/settings/security/page.tsx) and [sessions page](raverpay-admin/app/dashboard/security/sessions/page.tsx)
13. **Write comprehensive tests** - Unit tests for MFA logic, integration tests for auth flow, security tests for bypass attempts
14. **Deploy to staging** - Test all features thoroughly, verify audit logging, test IP blocking
15. **Gradual production rollout** - Phase 1: MFA optional, Phase 2: mandatory for SUPER_ADMIN, Phase 3: mandatory for all admin roles after 2-week notice

## Further Considerations

1. **Database migration safety?** Should we create a rollback SQL script before applying changes in case something goes wrong?
2. **MFA enforcement timeline?** Confirm: Week 1 optional, Week 2 SUPER_ADMIN mandatory, Week 4 all admin roles mandatory?
3. **IP whitelist approach?** Start with global whitelist for all admins, or implement per-admin from the beginning? Office IPs vs remote work needs clarification.
