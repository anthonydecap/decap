import { Container } from '@/components/Container'
import { FadeIn } from '@/components/FadeIn'
import { Button } from '@/components/Button'

/**
 * Component for "Success" Slices.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Success({ slice }: { slice: any }): React.JSX.Element {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="py-16"
    >
      <Container className="mt-8 sm:mt-12 lg:mt-16">
        <FadeIn>
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {slice.primary.title || 'Payment Successful!'}
            </h1>
            
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {slice.primary.subtitle || 'Thank you for your purchase. You will receive a confirmation email shortly.'}
            </p>
            
            {slice.primary.order_number && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
                <p className="text-sm text-gray-600">
                  {slice.primary.order_number_label || 'Order Number:'}
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {slice.primary.order_number}
                </p>
              </div>
            )}
            
            <div className="mt-8 flex justify-center space-x-4">
              {slice.primary.continue_shopping_text && (
                <Button href="/" className="bg-blue-600 hover:bg-blue-700">
                  {slice.primary.continue_shopping_text}
                </Button>
              )}
              
              {slice.primary.view_orders_text && (
                <Button href="/orders" className="bg-gray-200 text-gray-900 hover:bg-gray-300">
                  {slice.primary.view_orders_text}
                </Button>
              )}
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  )
} 