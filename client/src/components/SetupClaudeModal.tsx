import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Github,
    Check,
    Copy,
    Terminal,
    KeyRound,
    Settings2,
    Rocket,
    ExternalLink,
} from "lucide-react";
import clsx from "clsx";

interface SetupClaudeModalProps {
    open: boolean;
    onClose: () => void;
}

const REPO_URL = "https://github.com/palaniprashanth01/Flight-deals-finder-using-Claude";

const CLONE_CMD = `git clone ${REPO_URL}.git
cd Flight-deals-finder-using-Claude
npm install
npm run build`;

const ENV_TEMPLATE = `AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
SERPAPI_API_KEY=your_serpapi_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret`;

const CLAUDE_CONFIG = `{
  "mcpServers": {
    "flight-deals-finder": {
      "command": "node",
      "args": [
        "/absolute/path/to/Flight-deals-finder-using-Claude/build/index.js"
      ],
      "env": {
        "AMADEUS_CLIENT_ID": "your_amadeus_client_id",
        "AMADEUS_CLIENT_SECRET": "your_amadeus_client_secret",
        "SERPAPI_API_KEY": "your_serpapi_key"
      }
    }
  }
}`;

type Step = {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    summary: string;
    code?: string;
    lang?: string;
    body?: React.ReactNode;
};

const steps: Step[] = [
    {
        icon: Terminal,
        title: "Clone & build the MCP server",
        summary: "Grab the source, install dependencies, and build the TypeScript output.",
        code: CLONE_CMD,
        lang: "bash",
    },
    {
        icon: KeyRound,
        title: "Add your API keys",
        summary:
            "Create a .env file in the project root with your Amadeus, SerpAPI and Razorpay test keys.",
        code: ENV_TEMPLATE,
        lang: "env",
    },
    {
        icon: Settings2,
        title: "Paste into Claude Desktop config",
        summary:
            "Open Claude Desktop → Settings → Developer → Edit Config, then paste the block below. Replace the path with your absolute project path.",
        code: CLAUDE_CONFIG,
        lang: "json",
    },
    {
        icon: Rocket,
        title: "Restart Claude & start flying",
        summary:
            'Fully quit Claude Desktop, reopen it, then ask: "Find me the cheapest flight from Mumbai to Berlin next month for 2 adults."',
    },
];

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (e) {
            console.error("clipboard copy failed", e);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                {lang && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
                        {lang}
                    </span>
                )}
            </div>
            <button
                onClick={copy}
                aria-label={copied ? "Copied" : "Copy to clipboard"}
                className={clsx(
                    "absolute top-2 right-2 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-all",
                    copied
                        ? "bg-success/15 border-success/40 text-success"
                        : "bg-brand/15 border-edge-strong text-ink hover:bg-brand/25"
                )}
            >
                {copied ? (
                    <>
                        <Check className="h-3.5 w-3.5" /> Copied
                    </>
                ) : (
                    <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                    </>
                )}
            </button>
            <pre className="mt-0 rounded-2xl border border-edge bg-canvas/80 pt-10 pb-4 px-4 text-[12px] leading-relaxed text-ink/90 overflow-x-auto font-mono">
                <code>{code}</code>
            </pre>
        </div>
    );
}

export default function SetupClaudeModal({ open, onClose }: SetupClaudeModalProps) {
    const [active, setActive] = useState(0);

    // Lock body scroll while open + close on Escape
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="setup-claude-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                >
                    {/* backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-canvas/80 backdrop-blur-md"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* sheet */}
                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                        }}
                        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-edge-strong bg-gradient-to-b from-surface-elev/60 to-surface/95 shadow-[0_40px_120px_-20px_color-mix(in_oklab,var(--color-brand)_45%,transparent)] flex flex-col"
                    >
                        {/* glow */}
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* header */}
                        <div className="relative flex items-start justify-between gap-4 p-6 border-b border-edge">
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand/15 border border-edge-strong text-[10px] uppercase tracking-[0.2em] text-ink-muted mb-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                    One-click setup
                                </div>
                                <h2
                                    id="setup-claude-title"
                                    className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-gradient"
                                >
                                    Connect Flight Deals to Claude
                                </h2>
                                <p className="text-sm text-ink-muted mt-1 max-w-md">
                                    Install the SkySense MCP server in Claude Desktop in under 2 minutes.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full border border-edge text-ink/70 hover:text-ink hover:bg-brand/15 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* stepper */}
                        <div className="relative px-6 pt-5">
                            <div className="flex items-center gap-2">
                                {steps.map((s, i) => {
                                    const reached = i <= active;
                                    return (
                                        <button
                                            key={s.title}
                                            onClick={() => setActive(i)}
                                            className="group flex-1 text-left"
                                            aria-current={i === active ? "step" : undefined}
                                        >
                                            <div className="flex items-center gap-2">
                                                <motion.span
                                                    layout
                                                    className={clsx(
                                                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold border transition-colors",
                                                        reached
                                                            ? "bg-brand text-white border-brand-strong shadow-[0_0_18px_color-mix(in_oklab,var(--color-brand)_55%,transparent)]"
                                                            : "bg-surface text-ink-subtle border-edge"
                                                    )}
                                                >
                                                    {i + 1}
                                                </motion.span>
                                                <div className="flex-1 h-[2px] rounded-full overflow-hidden bg-edge">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-brand to-brand-strong"
                                                        initial={false}
                                                        animate={{ width: reached ? "100%" : "0%" }}
                                                        transition={{ duration: 0.45 }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] uppercase tracking-[0.14em]">
                                {steps.map((s, i) => (
                                    <button
                                        key={s.title}
                                        onClick={() => setActive(i)}
                                        className={clsx(
                                            "text-left truncate transition-colors",
                                            i === active ? "text-ink" : "text-ink-subtle hover:text-ink-muted"
                                        )}
                                    >
                                        {s.title.split(" & ")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* body */}
                        <div className="relative flex-1 overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={active}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="space-y-5"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="shrink-0 h-12 w-12 rounded-2xl bg-brand/15 border border-edge-strong flex items-center justify-center text-brand">
                                            {(() => {
                                                const Ico = steps[active].icon;
                                                return <Ico className="h-6 w-6" />;
                                            })()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-ink tracking-tight">
                                                Step {active + 1} — {steps[active].title}
                                            </h3>
                                            <p className="text-sm text-ink-muted mt-1">
                                                {steps[active].summary}
                                            </p>
                                        </div>
                                    </div>

                                    {steps[active].code && (
                                        <CodeBlock
                                            code={steps[active].code!}
                                            lang={steps[active].lang}
                                        />
                                    )}

                                    {active === 3 && (
                                        <div className="rounded-2xl border border-edge bg-canvas/60 p-4 space-y-3">
                                            <p className="text-xs uppercase tracking-[0.18em] text-ink-subtle">
                                                Try one of these prompts
                                            </p>
                                            <ul className="space-y-2 text-sm">
                                                {[
                                                    "Find the cheapest flights from Mumbai to Berlin next month for 2 adults",
                                                    "Compare BLR → SIN return fares for the next 3 weekends",
                                                    "Book me the cheapest CCU → DEL flight tomorrow, window seat",
                                                ].map((p) => (
                                                    <li
                                                        key={p}
                                                        className="rounded-xl border border-edge bg-brand/5 px-3 py-2 text-ink/90"
                                                    >
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* footer */}
                        <div className="relative border-t border-edge p-4 sm:p-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-canvas/40">
                            <a
                                href={REPO_URL}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-edge text-ink-muted hover:text-ink hover:border-edge-strong hover:bg-brand/10 transition-colors text-sm"
                            >
                                <Github className="h-4 w-4" />
                                View on GitHub
                                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                            </a>
                            <div className="flex items-center gap-2 justify-end">
                                <button
                                    onClick={() => setActive((i) => Math.max(0, i - 1))}
                                    disabled={active === 0}
                                    className="px-4 py-2 rounded-full text-sm text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Back
                                </button>
                                {active < steps.length - 1 ? (
                                    <button
                                        onClick={() => setActive((i) => Math.min(steps.length - 1, i + 1))}
                                        className="px-5 py-2 rounded-full text-sm font-medium bg-brand hover:bg-brand-hover text-white border border-brand-strong/60 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-brand)_70%,transparent)] active:scale-[0.98] transition-all"
                                    >
                                        Next step →
                                    </button>
                                ) : (
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2 rounded-full text-sm font-medium bg-brand hover:bg-brand-hover text-white border border-brand-strong/60 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-brand)_70%,transparent)] active:scale-[0.98] transition-all"
                                    >
                                        Done — close
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
