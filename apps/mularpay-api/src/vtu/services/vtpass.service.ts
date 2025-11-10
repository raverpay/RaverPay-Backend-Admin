import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface VTPassConfig {
  apiKey: string;
  secretKey: string;
  publicKey: string;
  baseUrl: string;
  webhookSecret: string;
}

interface VTPassResponse<T = unknown> {
  code?: string; // POST endpoints use 'code'
  response_description: string; // GET endpoints use this as status code
  content: T;
  requestId?: string;
  amount?: string;
  transaction_date?: {
    date: string;
  };
  purchased_code?: string;
}

export interface ServiceVariation {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
}

interface VerifyCustomerResponse {
  Customer_Name: string;
  Status: string;
  Due_Date?: string;
  Customer_Number: string;
  Customer_Type?: string;
  Address?: string;
  Minimum_Purchase_Amount?: string;
}

interface TransactionContent {
  transactions: {
    status: string;
    product_name: string;
    unique_element: string;
    unit_price: number;
    quantity: number;
    service_verification: unknown;
    channel: string;
    commission: number;
    total_amount: number;
    discount: unknown;
    type: string;
    email: unknown;
    phone: string;
    name: unknown;
    convinience_fee: number;
    amount: number;
    platform: string;
    method: string;
    transactionId: string;
  };
}

@Injectable()
export class VTPassService {
  private readonly logger = new Logger(VTPassService.name);
  private readonly config: VTPassConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('VTPASS_API_KEY') || '',
      secretKey: this.configService.get<string>('VTPASS_SECRET_KEY') || '',
      publicKey: this.configService.get<string>('VTPASS_PUBLIC_KEY') || '',
      baseUrl:
        this.configService.get<string>('VTPASS_BASE_URL') ||
        'https://sandbox.vtpass.com/api',
      webhookSecret:
        this.configService.get<string>('VTPASS_WEBHOOK_SECRET') || '',
    };

    // Validate configuration
    if (!this.config.apiKey || !this.config.secretKey) {
      this.logger.warn(
        'VTPass API keys not configured. VTU services will not work.',
      );
    }
  }

  private getHeaders() {
    return {
      'api-key': this.config.apiKey,
      'secret-key': this.config.secretKey,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    data?: unknown,
  ): Promise<VTPassResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    this.logger.log(`[VTPass] ${method} ${endpoint}`);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = (await response.json()) as VTPassResponse<T>;

      // Check for success: POST endpoints use 'code', GET endpoints use 'response_description'
      const statusCode = result.code || result.response_description;
      if (statusCode !== '000') {
        this.logger.error(`[VTPass] API error: ${result.response_description}`);
        throw new BadRequestException(
          result.response_description || 'VTPass API error',
        );
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(`[VTPass] Request failed:`, error);
      throw new BadRequestException(
        'Service provider temporarily unavailable. Please try again.',
      );
    }
  }

  // ==================== Product Catalog ====================

  async getServiceVariations(serviceId: string): Promise<ServiceVariation[]> {
    const response = await this.makeRequest<{
      variations: ServiceVariation[];
    }>(`/service-variations?serviceID=${serviceId}`);

    return response.content.variations || [];
  }

  getAirtimeProducts() {
    return [
      { code: 'mtn', name: 'MTN', logo: '🟡' },
      { code: 'glo', name: 'GLO', logo: '🟢' },
      { code: 'airtel', name: 'AIRTEL', logo: '🔴' },
      { code: '9mobile', name: '9MOBILE', logo: '🟢' },
    ];
  }

  async getDataProducts(network: string): Promise<ServiceVariation[]> {
    const serviceId = `${this.mapNetworkToServiceId(network)}-data`;
    return this.getServiceVariations(serviceId);
  }

  async getCableTVProducts(provider: string): Promise<ServiceVariation[]> {
    const serviceId = provider.toLowerCase();
    return this.getServiceVariations(serviceId);
  }

  getElectricityDISCOs() {
    return [
      {
        code: 'ikeja-electric',
        name: 'Ikeja Electric (IKEDC)',
        region: 'Lagos',
      },
      { code: 'eko-electric', name: 'Eko Electric (EKEDC)', region: 'Lagos' },
      {
        code: 'abuja-electric',
        name: 'Abuja Electric (AEDC)',
        region: 'Abuja',
      },
      { code: 'kano-electric', name: 'Kano Electric (KEDCO)', region: 'Kano' },
      {
        code: 'portharcourt-electric',
        name: 'Port Harcourt Electric (PHED)',
        region: 'Port Harcourt',
      },
      { code: 'jos-electric', name: 'Jos Electric (JED)', region: 'Jos' },
      {
        code: 'ibadan-electric',
        name: 'Ibadan Electric (IBEDC)',
        region: 'Ibadan',
      },
      {
        code: 'enugu-electric',
        name: 'Enugu Electric (EEDC)',
        region: 'Enugu',
      },
      {
        code: 'benin-electric',
        name: 'Benin Electric (BEDC)',
        region: 'Benin',
      },
    ];
  }

  // ==================== Validation ====================

  async verifyCustomer(
    billersCode: string,
    serviceId: string,
  ): Promise<VerifyCustomerResponse> {
    const response = await this.makeRequest<VerifyCustomerResponse>(
      '/merchant-verify',
      'POST',
      {
        billersCode,
        serviceID: serviceId,
      },
    );

    return response.content;
  }

  async verifySmartcard(smartcard: string, provider: string) {
    const serviceId = provider.toLowerCase();
    return this.verifyCustomer(smartcard, serviceId);
  }

  async verifyMeterNumber(
    meterNumber: string,
    disco: string,
    meterType: 'prepaid' | 'postpaid',
  ) {
    const serviceId = `${disco.toLowerCase()}-${meterType}`;
    return this.verifyCustomer(meterNumber, serviceId);
  }

  // ==================== Service ID Mapping ====================

  private mapNetworkToServiceId(network: string): string {
    const mapping: Record<string, string> = {
      mtn: 'mtn',
      glo: 'glo',
      airtel: 'airtel',
      '9mobile': 'etisalat', // VTPass uses old brand name
    };
    return mapping[network.toLowerCase()] || network.toLowerCase();
  }

  // ==================== Purchases ====================

  async purchaseAirtime(data: {
    network: string;
    phone: string;
    amount: number;
    reference: string;
  }) {
    const response = await this.makeRequest<TransactionContent>(
      '/pay',
      'POST',
      {
        request_id: data.reference,
        serviceID: this.mapNetworkToServiceId(data.network),
        amount: data.amount,
        phone: data.phone,
      },
    );

    return {
      status:
        response.content.transactions.status === 'delivered'
          ? 'success'
          : 'failed',
      transactionId: response.content.transactions.transactionId,
      token: data.reference,
      productName: response.content.transactions.product_name,
      amount: response.content.transactions.amount,
      commission: response.content.transactions.commission,
    };
  }

  async purchaseData(data: {
    network: string;
    phone: string;
    productCode: string;
    amount: number;
    reference: string;
  }) {
    const response = await this.makeRequest<TransactionContent>(
      '/pay',
      'POST',
      {
        request_id: data.reference,
        serviceID: `${this.mapNetworkToServiceId(data.network)}-data`,
        billersCode: data.phone,
        variation_code: data.productCode,
        amount: data.amount,
        phone: data.phone,
      },
    );

    return {
      status:
        response.content.transactions.status === 'delivered'
          ? 'success'
          : 'failed',
      transactionId: response.content.transactions.transactionId,
      token: data.reference,
      productName: response.content.transactions.product_name,
      amount: response.content.transactions.amount,
      commission: response.content.transactions.commission,
    };
  }

  async payCableTV(data: {
    provider: string;
    smartcard: string;
    productCode: string;
    amount: number;
    phone: string;
    reference: string;
  }) {
    const response = await this.makeRequest<TransactionContent>(
      '/pay',
      'POST',
      {
        request_id: data.reference,
        serviceID: data.provider.toLowerCase(),
        billersCode: data.smartcard,
        variation_code: data.productCode,
        amount: data.amount,
        phone: data.phone,
        subscription_type: 'renew',
      },
    );

    return {
      status:
        response.content.transactions.status === 'delivered'
          ? 'success'
          : 'failed',
      transactionId: response.content.transactions.transactionId,
      token: data.reference,
      productName: response.content.transactions.product_name,
      amount: response.content.transactions.amount,
      commission: response.content.transactions.commission,
    };
  }

  async payElectricity(data: {
    disco: string;
    meterNumber: string;
    meterType: 'prepaid' | 'postpaid';
    amount: number;
    phone: string;
    reference: string;
  }) {
    const serviceId = `${data.disco.toLowerCase()}-${data.meterType}`;

    const response = await this.makeRequest<TransactionContent>(
      '/pay',
      'POST',
      {
        request_id: data.reference,
        serviceID: serviceId,
        billersCode: data.meterNumber,
        variation_code: data.meterType,
        amount: data.amount,
        phone: data.phone,
      },
    );

    return {
      status:
        response.content.transactions.status === 'delivered'
          ? 'success'
          : 'failed',
      transactionId: response.content.transactions.transactionId,
      token: data.reference,
      productName: response.content.transactions.product_name,
      amount: response.content.transactions.amount,
      commission: response.content.transactions.commission,
      meterToken: response.purchased_code || undefined,
    };
  }

  // ==================== Transaction Query ====================

  async queryTransaction(reference: string) {
    const response = await this.makeRequest<TransactionContent>(
      '/requery',
      'POST',
      {
        request_id: reference,
      },
    );

    return {
      status:
        response.content.transactions.status === 'delivered'
          ? 'success'
          : 'failed',
      transactionId: response.content.transactions.transactionId,
      amount: response.content.transactions.amount,
    };
  }

  // ==================== Webhook Verification ====================

  verifyWebhook(signature: string, payload: unknown): boolean {
    if (!signature || !this.config.webhookSecret) {
      return false;
    }

    const hash = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}
