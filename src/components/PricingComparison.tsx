import { Check, Minus } from 'lucide-react';
import type { PublicPricing, PricingComparisonValue } from '@/types';

const valueLabels: Record<PricingComparisonValue, string> = {
  included: 'Incluído',
  excluded: 'Não incluído',
  not_applicable: 'Não se aplica',
  separate: 'Calculado à parte',
};

function ComparisonValue({ value }: { value: PricingComparisonValue }) {
  const positive = value === 'included';
  return (
    <span className={`comparison-value ${positive ? 'is-included' : ''}`} title={valueLabels[value]}>
      {positive ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
      <span>{valueLabels[value]}</span>
    </span>
  );
}

interface PricingComparisonProps {
  comparison: PublicPricing['section']['comparison'];
  products: PublicPricing['products'];
}

export function PricingComparison({ comparison, products }: PricingComparisonProps) {
  return (
    <div className="pricing-comparison">
      <h3>{comparison.title}</h3>
      <div className="comparison-scroll" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th scope="col">Item</th>
              {products.map((product) => <th scope="col" key={product.id}>{product.shortName}</th>)}
            </tr>
          </thead>
          <tbody>
            {comparison.items.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.label}</th>
                {products.map((product) => (
                  <td key={product.id}><ComparisonValue value={item.products[product.id] ?? 'not_applicable'} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
