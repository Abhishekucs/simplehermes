const ROW_1 = [
  "Translate messages in real time",
  "Organize your inbox",
  "Answer support tickets",
  "Summarize long documents",
  "Sync across time zones",
  "Do your taxes",
  "Track expenses and receipts",
  "Compare insurance quotes",
];

const ROW_2 = [
  "Price-drop alerts",
  "Compare product specs",
  "Negotiate deals",
  "Run payroll calculations",
  "Find discount codes",
  "Generate invoices",
  "Track investments",
  "Budget planning",
];

const ROW_3 = [
  "Create presentations from bullet points",
  "Book travel and hotels",
  "Find recipes",
  "Prioritize leads",
  "Screen cold outreach",
  "Draft proposals",
  "Schedule meetings",
];

const ROW_4 = [
  "Draft job descriptions",
  "Run standup summaries",
  "Track OKRs and KPIs",
  "Monitor news",
  "Write blog posts",
  "Create social media content",
  "Manage customer feedback",
];

const ROW_5 = [
  "Schedule follow-ups",
  "Send reminders",
  "Automate responses",
  "Research competitors",
  "Plan events",
  "Generate reports",
  "Analyze trends",
];

function MarqueeRow({
  items,
  direction,
  speed,
}: {
  items: string[];
  direction: "left" | "right";
  speed: number;
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <div
        className="flex w-max gap-3"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {duplicated.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-800 bg-[#111111] px-4 py-2 text-sm text-gray-300"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function UseCases() {
  return (
    <section className="py-20 overflow-hidden">
      <div className="text-center">
        <h2 className="text-3xl font-medium tracking-tighter text-white sm:text-4xl">
          What can Hermes do for you?
        </h2>
        <p className="mt-4 text-lg text-gray-400">
          One assistant, thousands of use cases
        </p>
      </div>

      <div className="mt-12 space-y-4">
        <MarqueeRow items={ROW_1} direction="left" speed={30} />
        <MarqueeRow items={ROW_2} direction="right" speed={35} />
        <MarqueeRow items={ROW_3} direction="left" speed={28} />
        <MarqueeRow items={ROW_4} direction="right" speed={32} />
        <MarqueeRow items={ROW_5} direction="left" speed={26} />
      </div>

      <p className="mt-12 text-center text-sm italic text-gray-500">
        PS. You can add as many use cases as you want via natural language
      </p>
    </section>
  );
}
