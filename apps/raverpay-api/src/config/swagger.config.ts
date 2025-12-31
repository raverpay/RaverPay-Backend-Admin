import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger/OpenAPI Configuration for Raverpay API
 * 
 * This configuration sets up comprehensive API documentation with:
 * - JWT authentication scheme
 * - Organized endpoint tags
 * - Environment-based servers
 * - Custom branding
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Raverpay API')   
    .setDescription(
      `
# Raverpay Fintech Platform API

Welcome to the Raverpay API documentation. This API powers a comprehensive fintech platform with:

## Core Features
- **Wallet Management** - Multi-currency wallets with real-time balance tracking
- **Payments** - Fund, withdraw, and P2P transfers
- **Circle Integration** - USDC wallets, CCTP bridging, and paymaster functionality
- **Authentication** - JWT-based auth with role-based access control
- **VTU Services** - Airtime and data purchases
- **Giftcards** - Buy and sell giftcards
- **Crypto** - Cryptocurrency trading via Venly
- **Admin Dashboard** - Comprehensive admin controls and analytics
- **Notifications** - Multi-channel notifications (Email, Push, In-App)
- **Cashback** - Rewards and cashback system

## Authentication
Most endpoints require JWT authentication. To authenticate:
1. Login via \`POST /api/auth/login\` to get an access token
2. Include the token in the \`Authorization\` header: \`Bearer <token>\`
3. Admin endpoints require admin role

## Rate Limiting
All endpoints are rate-limited to prevent abuse:
- Default: 200 requests/minute per user/IP
- Burst protection: 20 requests/10 seconds
- Specific limits apply to sensitive operations (login, register, payments)

## Webhooks
The API receives webhooks from:
- Paystack (payment notifications)
- Circle (wallet and transaction events)
- Resend (email delivery status)
- VTU providers (service fulfillment)

## Support
For API support, contact: support@raverpay.com
      `.trim(),
    )
    .setVersion('1.0.0')
    .setContact(
      'Raverpay Support',
      'https://app.raverpay.com',
      'support@raverpay.com',
    )
    .setLicense('Proprietary', 'https://app.raverpay.com/terms')
    // Add servers based on environment
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api-staging.raverpay.com', 'Staging')
    .addServer('https://api.raverpay.com', 'Production')
    // JWT Authentication
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name will be used in @ApiBearerAuth()
    )
    // Organize endpoints by tags
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile and account management')
    .addTag('Wallet', 'Wallet balance and operations')
    .addTag('Payments', 'Payment processing and webhooks')
    .addTag('Transactions', 'Transaction history and details')
    .addTag('Circle', 'Circle USDC wallets and operations')
    .addTag('Circle - User Controlled', 'User-controlled Circle wallets')
    .addTag('Circle - Paymaster', 'Paymaster pre-approval and operations')
    .addTag('Circle - Webhooks', 'Circle webhook handlers')
    .addTag('VTU', 'Airtime and data top-up services')
    .addTag('Crypto', 'Cryptocurrency trading via Venly')
    .addTag('Virtual Accounts', 'Virtual account management')
    .addTag('Cashback', 'Cashback and rewards')
    .addTag('Notifications', 'User notifications and preferences')
    .addTag('Support', 'Customer support and help')
    .addTag('Devices', 'Device management')
    .addTag('Limits', 'Transaction limits')
    .addTag('App Config', 'Application configuration')
    .addTag('Diagnostic', 'System health and diagnostics')
    // Admin tags
    .addTag('Admin - Users', 'Admin user management')
    .addTag('Admin - Wallets', 'Admin wallet operations')
    .addTag('Admin - Transactions', 'Admin transaction management')
    .addTag('Admin - Circle', 'Admin Circle operations')
    .addTag('Admin - Crypto', 'Admin crypto operations')
    .addTag('Admin - VTU', 'Admin VTU management')
    .addTag('Admin - Giftcards', 'Admin giftcard management')
    .addTag('Admin - KYC', 'Admin KYC verification')
    .addTag('Admin - Support', 'Admin support management')
    .addTag('Admin - Notifications', 'Admin notification management')
    .addTag('Admin - Analytics', 'Admin analytics and reporting')
    .addTag('Admin - Advanced Analytics', 'Advanced analytics and insights')
    .addTag('Admin - Virtual Accounts', 'Admin virtual account management')
    .addTag('Admin - Venly Wallets', 'Admin Venly wallet management')
    .addTag('Admin - Admins', 'Admin user management')
    .addTag('Admin - Emails', 'Admin email management')
    .addTag('Admin - Audit Logs', 'Admin audit log viewing')
    .addTag('Admin - Rate Limits', 'Admin rate limit management')
    .addTag('Admin - Deletions', 'Admin data deletion operations')
    // Webhook tags
    .addTag('Webhooks - Paystack', 'Paystack webhook handlers')
    .addTag('Webhooks - Circle', 'Circle webhook handlers')
    .addTag('Webhooks - Resend', 'Resend webhook handlers')
    .addTag('Webhooks - VTU', 'VTU webhook handlers')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  // Setup Swagger UI with custom options
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Raverpay API Documentation',
    customfavIcon: 'https://app.raverpay.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #6366f1; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
    `,
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token between page refreshes
      filter: true, // Enable search/filter
      displayRequestDuration: true, // Show request duration
      docExpansion: 'none', // Collapse all by default
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
    },
  });

  console.log('📚 Swagger documentation available at /api/docs');
}

/**
 * Check if Swagger should be enabled based on environment
 */
export function shouldEnableSwagger(): boolean {
  const env = process.env.NODE_ENV;
  const forceEnable = process.env.ENABLE_SWAGGER === 'true';
  const forceDisable = process.env.DISABLE_SWAGGER === 'true';

  if (forceDisable) return false;
  if (forceEnable) return true;

  // Enable in development and staging, disable in production by default
  return env !== 'production';
}
