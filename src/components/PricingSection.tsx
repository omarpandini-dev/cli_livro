import { useEffect, useState } from 'react';
import { MonitorSmartphone, Sparkles } from 'lucide-react';
import { pricingService } from '@/services/pricingService';
import type { PublicPricing } from '@/types';
import { PricingCard } from './PricingCard';
import { PricingComparison } from './PricingComparison';

export function PricingSection() {
  const [pricing, setPricing] = useState<PublicPricing | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    pricingService.getPricing()
      .then((data) => { if (active) setPricing(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);

  if (error) return <p className="error-banner">Não foi possível carregar as opções de compra.</p>;
  if (!pricing) return <section className="pricing-section pricing-loading" aria-label="Carregando opções de compra"><span /><span /><span /></section>;

  return (
    <section id="precos" className="pricing-section" aria-labelledby="pricing-title">
      <div className="pricing-heading">
        <p className="eyebrow"><Sparkles aria-hidden="true" />{pricing.section.eyebrow}</p>
        <h2 id="pricing-title">{pricing.section.title}</h2>
        <p>{pricing.section.description}</p>
      </div>
      <aside className="pricing-experience-notice">
        <MonitorSmartphone aria-hidden="true" />
        <div>
          <p>{pricing.section.experienceNotice}</p>
          <p>{pricing.section.digitalDeliveryNotice}</p>
        </div>
      </aside>
      <div className="pricing-grid">
        {pricing.products.map((product) => (
          <PricingCard product={product} currency={pricing.currency} locale={pricing.locale} key={product.id} />
        ))}
      </div>
      {pricing.section.comparison.enabled && <PricingComparison comparison={pricing.section.comparison} products={pricing.products} />}
      <p className="pricing-disclaimer">{pricing.section.physicalPriceDisclaimer}</p>
    </section>
  );
}
