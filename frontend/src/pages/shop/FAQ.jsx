import Seo from '../../components/common/Seo'

export default function FAQ() {
  return (
    <div className="section max-w-4xl mx-auto py-16">
      <Seo
        title="FAQs | Kesara Bathik"
        description="Answers to common questions about shipping, sizing and refunds at Kesara Bathik."
        path="/faq"
      />

      <h1 className="font-display text-3xl text-deep font-bold mb-4">Frequently Asked Questions</h1>
      <p className="text-sm text-gray-600 mb-6">Answers to common questions about shipping, sizing and refunds.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">1. How long does international shipping take?</h2>
      <p className="mb-4">Typical international delivery times are 7–21 business days depending on destination and customs processing. Expedited options (when available) are shown during checkout.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">2. Do you ship to my country?</h2>
      <p className="mb-4">We ship worldwide from Colombo. Very remote or restricted destinations may be unavailable; the checkout address form will indicate available shipping options.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">3. How are shipping costs calculated?</h2>
      <p className="mb-4">Shipping is calculated from package weight/size, destination, and service level. You’ll see exact costs before you pay at checkout.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">4. What if my package is delayed or lost?</h2>
      <p className="mb-4">If tracking shows excessive delay, contact us with your order number. We will liaise with the carrier and, if lost, arrange a replacement or refund according to the situation.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">5. How do I pick the right size?</h2>
      <p className="mb-4">Refer to the product size chart on each product page and measure a garment that fits you well. If unsure, contact us with your measurements and the product SKU for guidance.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">6. What should I do if an item doesn't fit?</h2>
      <p className="mb-4">If an item doesn't fit, you may return it within the return window (see Return & Refund Policy). Items must be unworn, with tags and original packaging to qualify.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">7. How long do I have to request a refund or exchange?</h2>
      <p className="mb-4">Standard returns must be initiated within 14 days of delivery. For exceptions (sale items, customized pieces), check the product page or contact support.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">8. How and when will I receive my refund?</h2>
      <p className="mb-4">Refunds are issued to the original payment method within 5–10 business days after we receive and inspect the returned item. Timing may vary by bank or payment provider.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">9. Who pays for return shipping?</h2>
      <p className="mb-4">Customers pay return shipping unless the return is due to our error (wrong/defective item), in which case we cover return costs or provide a prepaid label.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">10. What if my item arrives damaged or defective?</h2>
      <p className="mb-4">Report damaged or defective items within 7 days of delivery with photos of the item and packaging. We will replace the item or issue a full refund after verification.</p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact</h2>
      <p className="mb-4">For further help, email kesarabatik.info@gmail.com or WhatsApp +94 77 488 1013 and include your order number for faster support.</p>
    </div>
  )
}
