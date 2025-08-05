import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'

 

/**
 * Component for "Checkout" Slices.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Checkout({ slice }: { slice: any }): React.JSX.Element {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-16"
    >
      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <FadeIn>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {slice.primary.title || 'Checkout'}
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                {slice.primary.subtitle || 'Complete your purchase securely'}
              </p>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
              {/* Checkout Form Placeholder */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    {slice.primary.payment_title || 'Payment Information'}
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-sm text-gray-600">
                        {slice.primary.payment_description || 'Payment form will be rendered here'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600">
                          {slice.primary.total_label || 'Total to pay'}
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {slice.primary.total_amount || '$0.00'}
                        </p>
                      </div>
                      
                      <button
                        className="inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {slice.primary.pay_button_text || 'Pay Now'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 text-xs text-gray-500">
                    <p>{slice.primary.security_text || 'Your payment is secured by Stripe. We never store your payment information.'}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary - Dynamic content will be rendered here */}
              <div className="lg:col-span-1 mt-12 lg:mt-0">
                <div className="rounded-lg bg-gray-50 p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    {slice.primary.summary_title || 'Order Summary'}
                  </h2>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Order summary will be displayed dynamically from cart data
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                      <dt className="text-base font-medium text-gray-900">
                        {slice.primary.total_label || 'Total'}
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        Dynamic total from cart
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
} 