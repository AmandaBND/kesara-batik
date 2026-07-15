import Seo from '../../components/common/Seo'

const FAQ_ITEMS = [
  {
    question: 'Are batik and bathik the same?',
    answer: 'Yes. Batik is the internationally recognised spelling, while bathik is a common spelling used in Sri Lanka. Both refer to wax-resist dyed fabric and clothing.',
  },
  {
    question: 'What is the price of bathik clothing in Sri Lanka?',
    answer: 'Prices depend on the garment, fabric, design complexity and handwork. Kesara Bathik shows the current LKR price on every product page before checkout.',
  },
  {
    question: 'Can I buy Sri Lankan batik online?',
    answer: 'Yes. Kesara Bathik sells batik sarees, shirts, sarongs, frocks, family kits and accessories online for delivery in Sri Lanka and worldwide.',
  },
  {
    question: 'How long does international shipping take?',
    answer: 'Typical international delivery takes 7–21 business days depending on destination, customs processing and the selected delivery service.',
  },
  {
    question: 'Do you ship to my country?',
    answer: 'We ship worldwide from Sri Lanka. The checkout address form shows the available shipping option for the selected destination.',
  },
  {
    question: 'How are shipping costs calculated?',
    answer: 'Shipping is calculated using package weight, size, destination and service level. The exact charge is shown before payment.',
  },
  {
    question: 'How do I choose the correct size?',
    answer: 'Check the size information on the product page and compare it with a garment that fits you. Contact Kesara Bathik for help when unsure.',
  },
  {
    question: 'How long do I have to request a return?',
    answer: 'Standard return requests must be made within 14 days of delivery. Products must remain unused, unworn and in their original condition.',
  },
]

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
}

export default function FAQ() {
  return (
    <div className="section max-w-4xl mx-auto py-12">
      <Seo
        title="Batik & Bathik FAQs | Prices, Shipping & Sizing | Kesara"
        description="Answers about Sri Lankan batik and bathik prices, online ordering, worldwide shipping, sizing, returns and handcrafted clothing."
        keywords={['batik FAQ', 'bathik price in Sri Lanka', 'Sri Lankan batik online', 'batik shipping', 'bathik sizing', 'Kesara Bathik']}
        path="/faq"
        jsonLd={FAQ_SCHEMA}
      />

      <h1 className="font-display text-3xl text-deep font-bold mb-4">Batik &amp; Bathik Frequently Asked Questions</h1>
      <p className="text-sm leading-6 text-gray-600 mb-8">
        Helpful answers about authentic Sri Lankan batik clothing, bathik prices in Sri Lanka, international delivery, sizing and returns.
      </p>

      <div className="space-y-4">
        {FAQ_ITEMS.map((item, index) => (
          <article key={item.question} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-deep">{index + 1}. {item.question}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{item.answer}</p>
          </article>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Need more help?</h2>
      <p className="mb-4 text-sm leading-6 text-gray-600">
        Email kesarabatik.info@gmail.com or WhatsApp +94 77 488 1013. Include your order number for faster assistance.
      </p>
    </div>
  )
}
