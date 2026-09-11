import { Check, Minus } from 'lucide-react';
import type { PricingFeature } from '@/types';

export function PricingFeatures({ features }: { features: PricingFeature[] }) {
  return (
    <ul className="pricing-features">
      {features.map((feature) => (
        <li className={feature.included ? 'is-included' : 'is-excluded'} key={feature.id}>
          {feature.included ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
          <span>{feature.label}</span>
        </li>
      ))}
    </ul>
  );
}
