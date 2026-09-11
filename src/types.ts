export type ContentKind = 'book' | 'comic';

export interface ContentPage {
  number: number;
  image: string;
  audio: string | null;
}

export interface ContentItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  age: string | null;
  featured: boolean;
  type: ContentKind;
  cover: string | null;
  pageCount: number;
  pages?: ContentPage[];
}

export type ProgressMap = Record<string, number>;

export type PricingComparisonValue = 'included' | 'excluded' | 'not_applicable' | 'separate';

export interface PricingFeature {
  id: string;
  label: string;
  included: boolean;
}

export interface PricingProduct {
  id: string;
  type: string;
  name: string;
  shortName: string;
  description: string;
  pricingType: string;
  price: number | null;
  pricePrefix: string;
  priceSuffix: string;
  featured: boolean;
  badge: string | null;
  delivery: {
    type: 'online' | 'shipping';
    readerAccess: boolean;
    interactiveBook: boolean;
    pageTurning: boolean;
    audioNarration: boolean;
    physicalBook: boolean;
  };
  cta: { label: string; action: string };
  features: PricingFeature[];
  shipping?: { included: boolean; shortMessage: string; displayMessage: string };
  priceNotice?: string;
}

export interface PublicPricing {
  currency: string;
  locale: string;
  section: {
    eyebrow: string;
    title: string;
    description: string;
    experienceNotice: string;
    digitalDeliveryNotice: string;
    physicalPriceDisclaimer: string;
    comparison: {
      enabled: boolean;
      title: string;
      items: Array<{ id: string; label: string; products: Record<string, PricingComparisonValue> }>;
    };
  };
  products: PricingProduct[];
}

export interface PhysicalPriceResult {
  available: boolean;
  pages?: number;
  price: number | null;
  currency?: string;
  shippingIncluded?: boolean;
  message?: string;
}
