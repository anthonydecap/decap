interface SendcloudShippingAddress {
  name: string;
  company_name?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
  email?: string;
}

interface SendcloudShippingMethod {
  id: number;
  name: string;
  price: string;
  currency: string;
  min_delivery_time: number;
  max_delivery_time: number;
  carrier: string;
  service_point_input: string;
}

interface SendcloudShippingMethodResponse {
  id: number;
  name: string;
  price: string;
  currency: string;
  min_delivery_time: number;
  max_delivery_time: number;
  carrier: string;
  service_point_input: string;
  price_formatted: string;
}



class SendcloudClient {
  private publicKey: string;
  private secretKey: string;
  private baseUrl = 'https://panel.sendcloud.sc/api/v2';

  constructor() {
    this.publicKey = process.env.SENDCLOUD_PUBLIC_KEY || '';
    this.secretKey = process.env.SENDCLOUD_SECRET_KEY || '';
    
    if (!this.publicKey || !this.secretKey) {
      console.warn('Sendcloud credentials not found in environment variables');
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const auth = Buffer.from(`${this.publicKey}:${this.secretKey}`).toString('base64');
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sendcloud API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getShippingRates(
    fromAddress: SendcloudShippingAddress,
    toAddress: SendcloudShippingAddress,
    weight: number = 1 // Default weight in kg
  ): Promise<SendcloudShippingMethod[]> {
    try {
      // Step 1: Get all available shipping methods
      const shippingMethodsResponse = await this.makeRequest('/shipping_methods', {
        method: 'GET',
      });

      console.log('Sendcloud shipping methods response:', shippingMethodsResponse);

      // Filter for UPS methods
      const upsMethods = (shippingMethodsResponse.shipping_methods as SendcloudShippingMethodResponse[])?.filter((method) => 
        method.carrier?.toLowerCase().includes('ups')
      ) || [];

      console.log('UPS methods found:', upsMethods);

      if (upsMethods.length === 0) {
        console.log('No UPS shipping methods found in Sendcloud');
        return this.getFallbackUPSRates(weight, toAddress.country);
      }

      // Step 2: Get pricing for each UPS method using the shipping-price endpoint
      const ratesWithPricing = await Promise.all(
        upsMethods.map(async (method) => {
          try {
            // Build the shipping-price endpoint URL with required parameters
            const params = new URLSearchParams({
              shipping_method_id: method.id.toString(),
              from_country: fromAddress.country,
              to_country: toAddress.country,
              weight: Math.round(weight * 1000).toString(), // Convert to grams
              weight_unit: 'gram',
              from_postal_code: fromAddress.postal_code,
              to_postal_code: toAddress.postal_code
            });

            console.log(`Fetching pricing for method ${method.id} with params:`, params.toString());

            const priceResponse = await this.makeRequest(`/shipping-price?${params.toString()}`, {
              method: 'GET',
            });

            console.log(`Price response for method ${method.id}:`, priceResponse);

            // The response is an array of prices, we want the one for our to_country
            const priceForCountry = Array.isArray(priceResponse) 
              ? priceResponse.find(p => p.to_country === toAddress.country)
              : priceResponse;

            if (priceForCountry && priceForCountry.price) {
              return {
                id: method.id,
                name: method.name,
                price: priceForCountry.price,
                currency: priceForCountry.currency || 'EUR',
                min_delivery_time: method.min_delivery_time || 3,
                max_delivery_time: method.max_delivery_time || 7,
                carrier: method.carrier,
                service_point_input: method.service_point_input || 'required',
              };
            } else {
              console.log(`No pricing found for method ${method.id} to ${toAddress.country}`);
              // Return method with fallback pricing
              return {
                id: method.id,
                name: method.name,
                price: this.calculateFallbackRate(weight, toAddress.country),
                currency: 'EUR',
                min_delivery_time: method.min_delivery_time || 3,
                max_delivery_time: method.max_delivery_time || 7,
                carrier: method.carrier,
                service_point_input: method.service_point_input || 'required',
              };
            }
          } catch (error) {
            console.error(`Error getting pricing for method ${method.id}:`, error);
            // Return method with fallback pricing
            return {
              id: method.id,
              name: method.name,
              price: this.calculateFallbackRate(weight, toAddress.country),
              currency: 'EUR',
              min_delivery_time: method.min_delivery_time || 3,
              max_delivery_time: method.max_delivery_time || 7,
              carrier: method.carrier,
              service_point_input: method.service_point_input || 'required',
            };
          }
        })
      );

      console.log('Final rates with pricing:', ratesWithPricing);
      return ratesWithPricing;
    } catch (error) {
      console.error('Error fetching shipping rates from Sendcloud:', error);
      // Return fallback UPS rates if Sendcloud API fails
      return this.getFallbackUPSRates(weight, toAddress.country);
    }
  }

  private calculateFallbackRate(weight: number, country: string): string {
    // Fallback calculation only used when Sendcloud API fails
    let baseRate = 15; // Base rate in EUR
    let weightRate = weight * 2; // 2 EUR per kg
    
    // Add country-specific surcharges and adjustments
    if (country === 'US' || country === 'CA') {
      baseRate = 25; // Higher base rate for North America
      weightRate = weight * 3; // Higher weight rate
    } else if (['GB', 'IE'].includes(country)) {
      baseRate = 18; // Slightly higher for UK/Ireland
      weightRate = weight * 2.5;
    } else if (['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'].includes(country)) {
      // European countries - standard rates
      baseRate = 12;
      weightRate = weight * 1.5;
    }
    
    const totalRate = baseRate + weightRate;
    return totalRate.toFixed(2);
  }

  private getFallbackUPSRates(weight: number, country: string): SendcloudShippingMethod[] {
    const baseRate = this.calculateFallbackRate(weight, country);
    
    return [
      {
        id: 1,
        name: 'UPS Standard',
        price: baseRate,
        currency: 'EUR',
        min_delivery_time: 3,
        max_delivery_time: 7,
        carrier: 'UPS',
        service_point_input: 'required',
      },
      {
        id: 2,
        name: 'UPS Express',
        price: (parseFloat(baseRate) * 1.5).toFixed(2),
        currency: 'EUR',
        min_delivery_time: 1,
        max_delivery_time: 3,
        carrier: 'UPS',
        service_point_input: 'required',
      },
    ];
  }
}

export const sendcloudClient = new SendcloudClient();
export type { SendcloudShippingAddress, SendcloudShippingMethod }; 