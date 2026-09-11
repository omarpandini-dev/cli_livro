import { ArrowRight } from 'lucide-react';
import type { PricingProduct } from '@/types';
import { PricingFeatures } from './PricingFeatures';

const WHATSAPP_NUMBER = '5547997934627';

interface PricingCardProps {
  product: PricingProduct;
  currency: string;
  locale: string;
}

export function PricingCard({ product, currency, locale }: PricingCardProps) {
  const formattedPrice = product.price === null
    ? null
    : new Intl.NumberFormat(locale, { style: 'currency', currency }).format(product.price);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(product.cta.label)}`;

  return (
    <article className={`pricing-card${product.featured ? ' is-featured' : ''}`}>
      {product.badge && <span className="pricing-badge">{product.badge}</span>}
      <div className="pricing-card-heading">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
      </div>
      <div className="pricing-price" aria-label={`${product.pricePrefix} ${formattedPrice ?? ''}`.trim()}>
        {product.pricePrefix && <span>{product.pricePrefix}</span>}
        <strong>{formattedPrice ?? 'Sob consulta'}</strong>
        {product.priceSuffix && <small>{product.priceSuffix}</small>}
      </div>
      <PricingFeatures features={product.features} />
      {product.shipping && <p className="pricing-shipping">{product.shipping.shortMessage}</p>}
      {product.priceNotice && <p className="pricing-notice">{product.priceNotice}</p>}
      <a
        className="pricing-cta"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        data-product-id={product.id}
        aria-label={`${product.cta.label} pelo WhatsApp`}
      >
        {product.cta.label}<ArrowRight aria-hidden="true" />
      </a>
    </article>
  );
}

