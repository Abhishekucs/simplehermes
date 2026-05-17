const TRADITIONAL_STEPS = [
  { label: "Purchase local virtual machine", time: "10 min" },
  { label: "Creating SSH keys and storing securely", time: "3 min" },
  { label: "Connecting to the server via SSH", time: "3 min" },
  { label: "Installing Node.js and NPM", time: "5 min" },
  { label: "Installing Hermes", time: "2 min" },
  { label: "Setting up Hermes", time: "5 min" },
  { label: "Connecting to Telegram", time: "2 min" },
];

export function Comparison() {
  return (
    <section className="py-20">
      <div>
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D77655]" />
          <span className="text-sm font-medium text-[#D77655]">Comparison</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D77655]" />
        </div>

        <h2 className="mt-6 text-center text-3xl font-medium tracking-tighter text-white sm:text-4xl">
          Traditional Hermes vs SimpleHermes
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div>
            <h3 className="text-lg italic text-gray-400">Traditional</h3>
            <div className="mt-6 space-y-4">
              {TRADITIONAL_STEPS.map((step) => (
                <div
                  key={step.label}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-300">{step.label}</span>
                  <span className="text-gray-500">{step.time}</span>
                </div>
              ))}
            </div>
            <div className="my-4 h-px bg-gray-800" />
            <div className="flex justify-between text-sm">
              <span className="font-medium italic text-white">Total</span>
              <span className="font-medium text-white">30 min</span>
            </div>
          </div>

          <div className="w-px" style={{ background: "linear-gradient(to bottom, transparent, #4b5563, transparent)" }} />

          <div>
            <h3 className="text-lg italic text-gray-400">SimpleHermes</h3>
            <p className="mt-4 text-4xl font-medium text-white">&lt;1 min</p>
            <p className="mt-4 text-sm text-gray-400">
              Pick a model, connect Telegram, deploy — done under 1 minute.
            </p>
            <p className="mt-3 text-sm text-gray-400">
              Servers, SSH and Hermes Environment are already setup waiting to
              get assigned. Simple, secure and fast connection to your bot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
