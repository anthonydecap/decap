import { NextResponse } from 'next/server';
import { sendcloudClient } from '@/lib/sendcloud-client';

export async function GET() {
  try {
    // Test with a sample address
    const testFromAddress = {
      name: 'Your Store Name',
      address_1: '123 Warehouse Street',
      city: 'Amsterdam',
      postal_code: '1000 AA',
      country: 'NL',
      phone: '+31 20 123 4567',
    };

    const testToAddress = {
      name: 'John Doe',
      address_1: '456 Main Street',
      city: 'New York',
      postal_code: '10001',
      country: 'US',
      phone: '+1 555 123 4567',
    };

    console.log('Testing Sendcloud integration...');
    console.log('From address:', testFromAddress);
    console.log('To address:', testToAddress);

    const shippingRates = await sendcloudClient.getShippingRates(
      testFromAddress,
      testToAddress,
      2.5 // 2.5kg test weight
    );

    return NextResponse.json({
      success: true,
      shippingRates,
      testData: {
        fromAddress: testFromAddress,
        toAddress: testToAddress,
        weight: 2.5,
      },
    });
  } catch (error) {
    console.error('Error testing Sendcloud:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 