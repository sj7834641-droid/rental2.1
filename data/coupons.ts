export interface Coupon {
  code: string;
  title: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "RAPID100",
    title: "Flat ₹100 OFF",
    description: "Get ₹100 instant discount on minimum rental order of ₹400",
    discountType: "flat",
    discountValue: 100,
    minOrderValue: 400
  },
  {
    code: "RENTELO20",
    title: "20% OFF Special",
    description: "Save 20% on any bike rental up to a maximum of ₹150",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 200,
    maxDiscount: 150
  },
  {
    code: "WEEKEND50",
    title: "Weekend ₹50 OFF",
    description: "Save ₹50 on city weekend exploratory rides",
    discountType: "flat",
    discountValue: 50,
    minOrderValue: 250
  }
];
