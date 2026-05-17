import { Tick02Icon } from "@hugeicons/core-free-icons";
import { PLAN } from "@/lib/constants";
import { GetStartedButton } from "@/components/auth/get-started-button";

function HugeIcon({
  icon,
  className,
}: {
  icon: [string, Record<string, string | number>][];
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {icon.map(([tag, attrs], i) => {
        const Tag = tag as "path";
        return <Tag key={i} {...attrs} />;
      })}
    </svg>
  );
}

export function Pricing() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-md text-center">
        <h2 className="text-2xl font-medium text-white">Simple Pricing</h2>
        <p className="mt-2 text-sm text-gray-400">
          One plan, everything included
        </p>

        <div className="mt-8 rounded-2xl border border-gray-800 bg-[#111111] p-6 text-left">
          <h3 className="text-lg font-medium text-white">{PLAN.name}</h3>
          <p className="mt-1 text-3xl font-medium text-white">{PLAN.price}</p>

          <ul className="mt-6 space-y-2">
            {PLAN.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-gray-400"
              >
                <HugeIcon
                  icon={Tick02Icon as [string, Record<string, string | number>][]}
                  className="h-4 w-4 shrink-0 text-gray-400"
                />
                {feature}
              </li>
            ))}
          </ul>

          <GetStartedButton />
        </div>
      </div>
    </section>
  );
}
