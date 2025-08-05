import { NextRequest, NextResponse } from 'next/server';
import { sendcloudClient, SendcloudShippingAddress } from '@/lib/sendcloud-client';

export async function POST(request: NextRequest) {
  try {
    const { shippingAddress, weight = 1 } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Convert Stripe address format to Sendcloud format
    const sendcloudAddress: SendcloudShippingAddress = {
      name: shippingAddress.name,
      address_1: shippingAddress.address.line1,
      address_2: shippingAddress.address.line2 || undefined,
      city: shippingAddress.address.city,
      postal_code: shippingAddress.address.postal_code,
      country: shippingAddress.address.country,
      phone: shippingAddress.phone,
    };

    // Default from address (your warehouse/shop address)
    const fromAddress: SendcloudShippingAddress = {
      name: 'Your Store Name',
      address_1: '123 Warehouse Street',
      city: 'Amsterdam',
      postal_code: '1000 AA',
      country: 'NL',
      phone: '+31 20 123 4567',
    };

    // Get shipping rates from Sendcloud
    const shippingRates = await sendcloudClient.getShippingRates(
      fromAddress,
      sendcloudAddress,
      weight
    );

    return NextResponse.json({ shippingRates });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
} 