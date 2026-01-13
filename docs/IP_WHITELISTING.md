# IP Whitelisting Implementation Guide

## Overview

IP Whitelisting restricts admin dashboard access to specific IP addresses or CIDR ranges. This adds an additional layer of security by ensuring only connections from trusted networks can access admin accounts.

---

## Architecture

### Components

1. **Backend**
   - `IpWhitelistGuard`: Global guard that checks IP addresses
   - `AdminSecurityService`: CRUD operations for IP whitelist entries
   - `AdminSecurityController`: API endpoints for managing whitelist
   - `AdminIpWhitelist` model: Database table for whitelist entries

2. **Frontend**
   - IP Whitelist management page
   - Add/edit/delete IP addresses
   - View usage statistics

3. **Database**
   - `admin_ip_whitelist` table with IP addresses and metadata

---

## Database Schema

```prisma
model AdminIpWhitelist {
  id          String    @id @default(uuid())
  ipAddress   String    @unique
  description String?
  userId      String?
  isActive    Boolean   @default(true)
  createdBy   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastUsedAt  DateTime?
  usageCount  Int       @default(0)

  user        User?     @relation(fields: [userId], references: [id])
  creator     User      @relation("IpWhitelistCreator", fields: [createdBy], references: [id])

  @@index([ipAddress])
  @@index([userId])
  @@index([isActive])
  @@map("admin_ip_whitelist")
}
```

---

## Backend Implementation

### IP Whitelist Guard

**Location**: `src/common/guards/ip-whitelist.guard.ts`

**Behavior**:

1. Applied globally to all routes
2. Checks if user is admin (`ADMIN`, `SUPPORT`, `SUPER_ADMIN`)
3. If admin:
   - Extract client IP from request
   - Query `AdminIpWhitelist` for active entries
   - Check if IP matches any whitelist entry (supports CIDR)
   - Update `lastUsedAt` and `usageCount` on match
   - Allow or deny request
4. If not admin:
   - Allow request (no IP restriction)

**IP Extraction**:

- Checks `X-Forwarded-For` header first (for proxies/load balancers)
- Falls back to `request.ip`
- Supports multiple IPs in `X-Forwarded-For` (takes first)

**CIDR Support**:

- Uses `ip-address` library for CIDR matching
- Supports IPv4 and IPv6 CIDR notation
- Example: `192.168.1.0/24` matches all IPs from `192.168.1.1` to `192.168.1.254`

### Skip IP Whitelist Decorator

**Location**: `src/common/decorators/skip-ip-whitelist.decorator.ts`

**Usage**:

```typescript
@SkipIpWhitelist()
@Get('public-endpoint')
async publicEndpoint() {
  // This endpoint bypasses IP whitelisting
}
```

**Use Cases**:

- Public API endpoints
- Health checks
- Webhook endpoints

---

## API Endpoints

### Get IP Whitelist Entries

**Endpoint**: `GET /admin/security/ip-whitelist`

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `isActive`: Filter by active status (optional)
- `userId`: Filter by user ID (optional)

**Response**:

```typescript
{
  data: IpWhitelistEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Add IP Whitelist Entry

**Endpoint**: `POST /admin/security/ip-whitelist`

**Request**:

```typescript
{
  ipAddress: string;      // Required: IP or CIDR
  description?: string;   // Optional: Description
  userId?: string;        // Optional: Assign to specific user
  isActive?: boolean;     // Optional: Default true
}
```

**Response**:

```typescript
{
  id: string;
  ipAddress: string;
  description: string | null;
  userId: string | null;
  isActive: boolean;
  createdAt: string;
  // ... other fields
}
```

### Update IP Whitelist Entry

**Endpoint**: `PATCH /admin/security/ip-whitelist/:id`

**Request**:

```typescript
{
  description?: string;
  isActive?: boolean;
}
```

**Note**: IP address cannot be changed. Delete and recreate to change IP.

### Delete IP Whitelist Entry

**Endpoint**: `DELETE /admin/security/ip-whitelist/:id`

**Response**:

```typescript
{
  success: boolean;
  message: string;
}
```

---

## IP Address Formats

### Supported Formats

**IPv4 Single IP**:

```
192.168.1.1
```

**IPv4 CIDR Range**:

```
192.168.1.0/24        # All IPs from 192.168.1.1 to 192.168.1.254
10.0.0.0/8            # All IPs from 10.0.0.1 to 10.255.255.254
172.16.0.0/12         # All IPs from 172.16.0.1 to 172.31.255.254
```

**IPv6 Single IP**:

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
2001:db8:85a3::8a2e:370:7334  # Compressed format
```

**IPv6 CIDR Range**:

```
2001:0db8::/32
2001:db8:85a3::/48
```

### Validation

- IPv4: Must match `^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$`
- IPv6: Must match `^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}(\/\d{1,3})?$`
- CIDR prefix: IPv4 (0-32), IPv6 (0-128)

---

## Frontend Implementation

### IP Whitelist Management Page

**Location**: `/app/dashboard/security/ip-whitelist/page.tsx`

**Features**:

- List all whitelist entries
- Add new IP addresses
- Edit descriptions and status
- Delete entries
- Filter by status
- Search by IP or description
- View usage statistics

### Adding an IP Address

1. Click "Add IP Address"
2. Enter IP address or CIDR range
3. Add optional description
4. Set status (Active/Inactive)
5. Click "Add IP Address"

### Editing an Entry

1. Click edit icon on entry
2. Update description or status
3. Click "Update"

**Note**: IP address cannot be changed. Delete and recreate to change IP.

---

## Security Considerations

### IP Spoofing

- **Risk**: Attackers could spoof IP addresses
- **Mitigation**: Use `X-Forwarded-For` header validation
- **Best Practice**: Configure reverse proxy/load balancer to set trusted headers

### CIDR Range Size

- **Risk**: Overly broad CIDR ranges (e.g., `0.0.0.0/0`) allow all IPs
- **Mitigation**: Validate CIDR prefix length
- **Best Practice**: Use smallest possible CIDR range

### Dynamic IPs

- **Risk**: Home/remote IPs change frequently
- **Mitigation**: Use VPN with static IP
- **Best Practice**: Whitelist VPN server IP, not individual home IPs

### Lockout Prevention

- **Risk**: Removing current IP locks out admin
- **Mitigation**: Require multiple IPs before allowing deletion
- **Best Practice**: Always have at least 2 whitelisted IPs

---

## Usage Tracking

### Metrics Collected

- `lastUsedAt`: Timestamp of last successful match
- `usageCount`: Total number of successful matches

### Use Cases

- Identify unused IPs for cleanup
- Monitor access patterns
- Detect suspicious activity
- Audit compliance

---

## Best Practices

### Office Networks

- Use CIDR notation for office IP ranges
- Example: `192.168.1.0/24` for office network

### Remote Access

- Use VPN with static IP
- Whitelist VPN server IP
- Don't whitelist individual home IPs

### Multiple Locations

- Add all office locations to whitelist
- Use descriptive descriptions
- Example: "Lagos Office - Main Building"

### Testing

- Temporarily disable IP whitelisting (set `isActive: false`)
- Don't delete entries during testing
- Use staging environment for testing

### Maintenance

- Review whitelist monthly
- Remove unused IPs
- Update descriptions regularly
- Document why each IP is whitelisted

---

## Troubleshooting

### Locked Out

**Problem**: Can't access admin dashboard after removing IP

**Solution**:

1. Contact another admin to add your IP
2. Use VPN with whitelisted IP
3. Contact system administrator

**Prevention**: Always have multiple IPs whitelisted

### IP Not Matching

**Problem**: IP should match CIDR range but doesn't

**Solution**:

1. Verify CIDR notation is correct
2. Check if IP is within range
3. Verify IP extraction (check `X-Forwarded-For` header)

### False Positives

**Problem**: Legitimate IPs being blocked

**Solution**:

1. Check if IP is in whitelist
2. Verify IP is active (`isActive: true`)
3. Check IP extraction logic
4. Review guard logs

---

## API Examples

### Add Office IP Range

```bash
curl -X POST https://api.raverpay.com/admin/security/ip-whitelist \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ipAddress": "192.168.1.0/24",
    "description": "Lagos Office Network",
    "isActive": true
  }'
```

### List Active IPs

```bash
curl -X GET "https://api.raverpay.com/admin/security/ip-whitelist?isActive=true" \
  -H "Authorization: Bearer $TOKEN"
```

### Deactivate IP

```bash
curl -X PATCH https://api.raverpay.com/admin/security/ip-whitelist/$ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

---

## Future Enhancements

- [ ] IP geolocation integration
- [ ] Automatic IP whitelisting for trusted devices
- [ ] IP whitelist expiration dates
- [ ] IP whitelist approval workflow
- [ ] Integration with VPN providers
- [ ] IP whitelist analytics dashboard

---

**Last Updated**: January 2025  
**Version**: 1.0
