import { Helmet } from 'react-helmet-async'

export default function PrivacyPolicy() {
  return (
    <div className="section max-w-4xl mx-auto py-16">
      <Helmet>
        <title>Privacy Policy | Kesara Batik</title>
        <meta name="description" content="Kesara Batik Privacy Policy" />
      </Helmet>

      <h1 className="font-display text-3xl text-deep font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-6">Effective Date: June 23, 2026 · Last Updated: June 23, 2026</p>

      <p className="mb-4">Welcome to Kesara Batik! We create authentic, high-quality batik clothing in Sri Lanka and deliver our handcrafted creations worldwide. Protecting your privacy is important to us, and we are committed to handling your personal information responsibly and securely.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-2">To process your orders and provide our services, we may collect:</p>
      <h3 className="font-semibold">Personal Information</h3>
      <ul className="list-disc list-inside mb-2">
        <li>Full Name</li>
        <li>Billing and Delivery Address</li>
        <li>Email Address</li>
        <li>Phone Number</li>
      </ul>

      <h3 className="font-semibold">Order Information</h3>
      <ul className="list-disc list-inside mb-2">
        <li>Purchased Products</li>
        <li>Order History</li>
        <li>Transaction Details</li>
      </ul>

      <h3 className="font-semibold">Technical Information</h3>
      <ul className="list-disc list-inside mb-4">
        <li>IP Address</li>
        <li>Browser Type</li>
        <li>Device Information</li>
        <li>Website Usage Data</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Payment Security</h2>
      <p className="mb-2">Your financial security is our highest priority. All online payments are processed securely through Dialog Genie, a PCI-DSS compliant payment gateway. Kesara Batik does NOT store your credit card or debit card information and does NOT have access to your banking credentials.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. How We Use Your Information</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Process and deliver your orders.</li>
        <li>Provide order confirmations and tracking updates.</li>
        <li>Respond to customer inquiries and support requests.</li>
        <li>Improve our website and customer experience.</li>
        <li>Comply with legal, tax, and regulatory obligations.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Sharing of Information</h2>
      <p className="mb-2">We never sell your personal information. We may share information only with payment providers (Dialog Genie), delivery partners required to complete your delivery, and legal authorities when required by law.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. International Customers</h2>
      <p className="mb-2">We serve customers worldwide and respect applicable international privacy regulations, including GDPR principles. You may request access, correction, or deletion of your personal information.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Data Security</h2>
      <p className="mb-2">We implement reasonable technical and organizational measures to protect your personal information.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Contact Us</h2>
      <p className="mb-2">If you have any questions regarding this Privacy Policy or your personal information, please contact:</p>
      <p className="mb-8 font-semibold">Kesara Batik<br/>Email: kesarabatik.info@gmail.com<br/>Phone: +94 77 488 1013</p>
    </div>
  )
}
