import { Helmet } from 'react-helmet-async'

export default function ReturnRefundPolicy() {
  return (
    <div className="section max-w-4xl mx-auto py-16">
      <Helmet>
        <title>Return & Refund Policy | Kesara Batik</title>
        <meta name="description" content="Kesara Batik Return & Refund Policy" />
      </Helmet>

      <h1 className="font-display text-3xl text-deep font-bold mb-4">Refund & Return Policy</h1>

      <p className="mb-4">At Kesara Batik, every garment is handcrafted using traditional Sri Lankan batik techniques. Slight variations in color and patterns are natural characteristics of handmade batik and make each piece unique.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Return Eligibility</h2>
      <h3 className="font-semibold">Sri Lankan Orders</h3>
      <p className="mb-2">Returns must be requested within <strong>7 days</strong> of receiving the order.</p>
      <h3 className="font-semibold">International Orders</h3>
      <p className="mb-4">Returns must be requested within <strong>14 days</strong> of receiving the order.</p>

      <p className="mb-4">To qualify for a return, products must be unused, unworn, unwashed, unaltered, in original condition and returned with all original tags attached.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Requesting a Return</h2>
      <p className="mb-2">To initiate a return, email us at <strong>kesarabatik.info@gmail.com</strong> with:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Order Number</li>
        <li>Product Photos</li>
        <li>Reason for Return</li>
      </ul>
      <p className="mb-4">Please indicate whether you require a refund or an exchange.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Refund Processing</h2>
      <p className="mb-2">Approved refunds will be processed through the original payment method used during purchase.</p>
      <p className="mb-2">Estimated Processing Times:</p>
      <ul className="list-disc list-inside mb-2">
        <li>Sri Lankan Cards: 3–7 business days</li>
        <li>International Cards: 7–14 business days</li>
      </ul>
      <p className="mb-4">Non-refundable charges: original shipping fees, customs duties, import taxes, government charges.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Return Shipping</h2>
      <p className="mb-2"><strong>Our Error:</strong> If we shipped an incorrect item or the item has a manufacturing defect, Kesara Batik will cover all return shipping costs.</p>
      <p className="mb-4"><strong>Customer Preference:</strong> If the return is due to change of mind, incorrect size selection or personal preference, the customer is responsible for return shipping costs.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Exchanges</h2>
      <p className="mb-4">Subject to stock availability, we may offer exchanges for different sizes, alternative designs, or replacement of defective items.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Contact Information</h2>
      <p className="font-semibold">Email: kesarabatik.info@gmail.com<br/>Phone: +94 77 488 1013</p>
    </div>
  )
}
