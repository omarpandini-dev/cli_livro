import { readFileSync } from 'node:fs';
import path from 'node:path';

type ComparisonValue = 'included' | 'excluded' | 'not_applicable' | 'separate';

type DeliveryConfig = {
  type: 'online' | 'shipping';
  reader_access: boolean;
  interactive_book: boolean;
  page_turning: boolean;
  audio_narration: boolean;
  physical_book: boolean;
};

interface PricingConfig {
  currency: string;
  locale: string;
  products: Array<{
    id: string;
    type: string;
    name: string;
    short_name: string;
    description: string;
    pricing_type: string;
    price: number | null;
    price_prefix: string;
    price_suffix: string;
    active: boolean;
    featured: boolean;
    sort_order: number;
    badge: string | null;
    delivery: DeliveryConfig;
    cta: { label: string; action: string };
    features: Array<{ id: string; label: string; included: boolean }>;
    shipping?: { included: boolean; short_message?: string; display_message: string };
    price_notice?: string;
  }>;
  section: {
    eyebrow: string;
    title: string;
    description: string;
    experience_notice: string;
    digital_delivery_notice: string;
    physical_price_disclaimer: string;
  };
  comparison: {
    enabled: boolean;
    title: string;
    items: Array<{ id: string; label: string }>;
  };
}

interface PrintRules {
  currency: string;
  rules: { shipping_included: boolean };
  reference_cases: Array<{
    pages: number;
    desired_revenue: number;
    customer_price: number;
    provider?: string;
  }>;
  page_ranges: Array<{
    min_pages: number;
    max_pages: number;
    customer_price: number | null;
  }>;
}

const configRoot = path.join(process.cwd(), 'src', 'config');

function loadJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(path.join(configRoot, fileName), 'utf8')) as T;
}

const pricingConfig = loadJson<PricingConfig>('pricing.json');
const printRules = loadJson<PrintRules>('print-rules.json');

function comparisonValue(product: PricingConfig['products'][number], featureId: string): ComparisonValue {
  const deliveryValues: Record<string, boolean> = {
    INTERACTIVE_READER: product.delivery.interactive_book,
    PAGE_TURNING: product.delivery.page_turning,
    AUDIO_NARRATION: product.delivery.audio_narration,
    PHYSICAL_BOOK: product.delivery.physical_book,
  };
  const included = featureId in deliveryValues
    ? deliveryValues[featureId]
    : product.features.find((feature) => feature.id === featureId)?.included ?? false;
  return included ? 'included' : 'excluded';
}

export function getPublicPricing() {
  const products = pricingConfig.products
    .filter((product) => product.active)
    .sort((first, second) => first.sort_order - second.sort_order)
    .map((product) => ({
      id: product.id,
      type: product.type,
      name: product.name,
      shortName: product.short_name,
      description: product.description,
      pricingType: product.pricing_type,
      price: product.price,
      pricePrefix: product.price_prefix,
      priceSuffix: product.price_suffix,
      featured: product.featured,
      badge: product.badge,
      delivery: {
        type: product.delivery.type,
        readerAccess: product.delivery.reader_access,
        interactiveBook: product.delivery.interactive_book,
        pageTurning: product.delivery.page_turning,
        audioNarration: product.delivery.audio_narration,
        physicalBook: product.delivery.physical_book,
      },
      cta: product.cta,
      features: product.features,
      shipping: product.shipping ? {
        included: product.shipping.included,
        shortMessage: product.shipping.short_message ?? product.shipping.display_message,
        displayMessage: product.shipping.display_message,
      } : undefined,
      priceNotice: product.price_notice,
    }));

  return {
    currency: pricingConfig.currency,
    locale: pricingConfig.locale,
    section: {
      eyebrow: pricingConfig.section.eyebrow,
      title: pricingConfig.section.title,
      description: pricingConfig.section.description,
      experienceNotice: pricingConfig.section.experience_notice,
      digitalDeliveryNotice: pricingConfig.section.digital_delivery_notice,
      physicalPriceDisclaimer: pricingConfig.section.physical_price_disclaimer,
      comparison: {
        enabled: pricingConfig.comparison.enabled,
        title: pricingConfig.comparison.title,
        items: pricingConfig.comparison.items.map((item) => ({
          id: item.id,
          label: item.label,
          products: Object.fromEntries(products.map((product) => {
            const configuredProduct = pricingConfig.products.find((candidate) => candidate.id === product.id)!;
            return [product.id, comparisonValue(configuredProduct, item.id)];
          })),
        })),
      },
    },
    products,
  };
}

export function getProductById(productId: string) {
  return getPublicPricing().products.find((product) => product.id === productId);
}

export function getPhysicalPriceByPages(pages: number) {
  const range = printRules.page_ranges.find(
    (item) => pages >= item.min_pages && pages <= item.max_pages,
  );

  if (!range || range.customer_price === null) {
    return {
      available: false,
      price: null,
      message: 'Preço do livro físico disponível sob consulta.',
    };
  }

  return {
    available: true,
    pages,
    price: range.customer_price,
    currency: printRules.currency,
    shippingIncluded: printRules.rules.shipping_included,
  };
}
