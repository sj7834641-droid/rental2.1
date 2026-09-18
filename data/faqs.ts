export interface FAQItem {
  question: string;
  answer: string;
  category: 'booking' | 'deposit' | 'safety' | 'rides';
}

export const FAQ_DATA: FAQItem[] = [
  {
    category: 'deposit',
    question: "When and how will my security deposit be refunded?",
    answer: "Your security deposit (e.g. ₹500, ₹800, or ₹1) is refunded immediately upon vehicle return at our hub after digital inspection. The amount reflects back into your original payment source (UPI/bank/card) within 2 to 24 hours.",
  },
  {
    category: 'booking',
    question: "What documents are required to pick up a bike?",
    answer: "You must present an original valid Driver's License (DL) for two-wheelers with gear/non-gear and an original Government ID (Aadhaar Card or Passport). Learner's License (LLR) is not accepted.",
  },
  {
    category: 'safety',
    question: "Are helmets included with the rental?",
    answer: "Yes! Every RapidRental vehicle comes with one sanitized high-quality ISI-certified helmet included completely free of charge. You can also add an extra pillion helmet for just ₹50 during checkout.",
  },
  {
    category: 'rides',
    question: "What is the fuel policy?",
    answer: "Bikes are delivered with sufficient fuel to reach the nearest fuel station. You must return the vehicle with the same fuel level as recorded on the digital handover checklist.",
  },
  {
    category: 'rides',
    question: "What is the speed limit and kilometer allowance?",
    answer: "All vehicles include a generous kilometer allowance (150 km/day for scooters, 200 km/day for bikes). Excess distance is charged at just ₹4/km. City speed limits are capped at 70 km/h in accordance with traffic safety regulations.",
  },
  {
    category: 'safety',
    question: "What should I do in case of a breakdown or puncture?",
    answer: "Call our 24/7 Roadside Assistance toll-free emergency hotline immediately at 1800-419-7274. Our mobile technical patrol will reach your location within 30-45 minutes anywhere within BBMP limits.",
  }
];
