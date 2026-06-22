import { Helmet } from 'react-helmet-async'

export default function TermsAndConditions() {
  return (
    <div className="section max-w-4xl mx-auto py-16">
      <Helmet>
        <title>Terms & Conditions | Kesara Batik</title>
        <meta name="description" content="Kesara Batik Terms & Conditions" />
      </Helmet>

      <h1 className="font-display text-3xl text-deep font-bold mb-4">Terms & Conditions</h1>

      <p className="mb-4">Welcome to Kesara Batik. By accessing our website or placing an order, you agree to the following Terms and Conditions.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. General Conditions</h2>
      <p className="mb-2">By using this website, you confirm that you are legally capable of entering into a binding agreement and that the information you provide is accurate and complete.</p>
      <p className="mb-4">Handmade Product Notice: All Kesara Batik products are handcrafted using traditional Sri Lankan batik techniques. Minor variations in color shades, wax patterns and dye distribution are natural characteristics and should not be considered defects.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Pricing & Payments</h2>
      <p className="mb-2">Prices are displayed in Sri Lankan Rupees (LKR). International customers may see approximate conversions. Final payment amounts may vary due to exchange rate fluctuations and bank fees. Payments are processed securely through Dialog Genie.</p>
      <p className="mb-4">We reserve the right to cancel any transaction identified as fraudulent, suspicious, or high-risk.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. Shipping & Delivery</h2>
      <p className="mb-2"><strong>Sri Lanka:</strong> Estimated delivery: 3–5 business days.</p>
      <p className="mb-4"><strong>International Shipping:</strong> Estimated delivery: 7–14 business days depending on destination and customs processing.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. Customs & Import Duties</h2>
      <p className="mb-4">For international orders the customer acts as the importer of record and is responsible for customs duties, import taxes and regulatory fees imposed by their country. These charges are not included in product prices or shipping fees.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. Intellectual Property</h2>
      <p className="mb-4">All content on this website, including logos, product photographs, text, graphics, website design, batik artwork and patterns remains the exclusive property of Kesara Batik.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. Limitation of Liability</h2>
      <p className="mb-4">Kesara Batik shall not be liable for indirect, incidental, or consequential damages arising from the use of our products or services.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. Governing Law</h2>
      <p className="mb-4">These Terms and Conditions shall be governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any disputes shall be subject to the jurisdiction of Sri Lankan courts.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">8. Changes to These Terms</h2>
      <p className="mb-4">We reserve the right to modify these Terms and Conditions at any time. Changes become effective immediately upon publication on our website.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p className="font-semibold">Kesara Batik<br/>Email: kesarabatik.info@gmail.com<br/>Phone: +94 77 488 1013</p>
    </div>
  )
}
