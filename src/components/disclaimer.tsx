import { ShieldIcon } from "@/components/icons";
import { Card } from "@/components/card";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <Card className="border-mint-200 bg-mint-50/90 shadow-none">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-mint-700">
          <ShieldIcon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">Educational use only</h2>
          <p className="mt-1 text-sm leading-6 text-ink-700">
            Sip the Dip shows user-defined market conditions, manual tracking, and hypothetical simulations. It does not provide personalized investment advice, recommendations, guarantees, or order execution.
            {!compact ? " Review your assumptions and consider speaking with a qualified professional before making financial decisions." : null}
          </p>
        </div>
      </div>
    </Card>
  );
}
