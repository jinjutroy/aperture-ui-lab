import {
  ArrowDownRight,
  ArrowUpRight,
  Layers3,
  MousePointer2,
  ShieldCheck,
} from "lucide-react";

const principles = [
  {
    number: "01",
    icon: <Layers3 size={22} strokeWidth={1.8} />,
    title: "One source of truth",
    copy: "Color, shape, and density are modeled as tokens. Every component responds to the same small set of decisions.",
  },
  {
    number: "02",
    icon: <MousePointer2 size={22} strokeWidth={1.8} />,
    title: "Interaction first",
    copy: "Controls are functional, keyboard reachable, and built with native semantics wherever possible.",
  },
  {
    number: "03",
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    title: "Built for real use",
    copy: "Preferences persist locally. Focus, reduced motion, empty states, and small screens are part of the system.",
  },
];

export function Mark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`brand-mark${small ? " brand-mark-small" : ""}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

export function Hero() {
  return (
    <section className="hero page-container" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="eyebrow-line" /> FRONTEND ENGINEERING / EXPERIMENT
          001
        </div>
        <h1 id="hero-title">
          Interfaces are
          <br />
          <em>systems</em> you can feel
          <span className="hero-period">.</span>
        </h1>
        <p className="hero-description">
          A living UI system for exploring how design decisions shape real
          interactions. Tune the tokens, test the components, inspect the
          implementation.
        </p>
        <div className="hero-actions">
          <a className="hero-primary" href="#studio">
            Enter the playground <ArrowDownRight size={18} />
          </a>
          <a
            className="hero-secondary"
            href="https://github.com/jinjutroy"
            target="_blank"
            rel="noreferrer"
          >
            Explore my GitHub <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-art-grid" />
        <div className="art-orbit art-orbit-one" />
        <div className="art-orbit art-orbit-two" />
        <div className="art-orbit art-orbit-three" />
        <div className="art-core">
          <Mark />
        </div>
        <div className="art-label art-label-top">
          <span className="art-label-dot" /> VARIABLE TOKENS <span>↗</span>
        </div>
        <div className="art-label art-label-bottom">
          01 — 03 <span>INTERACTIVE SYSTEM</span>
        </div>
        <div className="art-cross art-cross-one">+</div>
        <div className="art-cross art-cross-two">+</div>
      </div>
      <div className="hero-bottom">
        <span>SCROLL TO EXPLORE</span>
        <span className="scroll-rule" />
        <span>DESIGNED & BUILT IN THE OPEN</span>
      </div>
    </section>
  );
}

export function ApproachAndClosing() {
  return (
    <>
      <section
        className="approach-section page-container"
        id="approach"
        aria-labelledby="approach-title"
      >
        <div className="section-heading approach-heading">
          <div>
            <div className="section-kicker">
              <span>02 / APPROACH</span>
              <span className="section-kicker-rule" />
            </div>
            <h2 id="approach-title">
              Craft is in the <em>details.</em>
            </h2>
          </div>
          <p>
            Good frontend work holds up beyond the screenshot. This lab makes
            the underlying decisions visible.
          </p>
        </div>
        <div className="principle-grid">
          {principles.map((principle) => (
            <article className="principle-card" key={principle.number}>
              <div className="principle-card-top">
                <span>{principle.number}</span>
                {principle.icon}
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
              <span className="principle-arrow">
                <ArrowUpRight size={20} />
              </span>
            </article>
          ))}
        </div>
      </section>
      <section className="closing-section page-container">
        <div className="closing-card">
          <div className="closing-art" aria-hidden="true">
            <div className="closing-orbit" />
            <Mark />
          </div>
          <div className="closing-content">
            <div className="section-kicker">
              <span>03 / CONTINUE EXPLORING</span>
              <span className="section-kicker-rule" />
            </div>
            <h2>
              Built to be explored.
              <br />
              <em>Made to be extended.</em>
            </h2>
            <p>
              Browse the source, adapt the tokens, or use the interactions as a
              starting point for your own interface.
            </p>
            <a
              href="https://github.com/jinjutroy/aperture-ui-lab"
              target="_blank"
              rel="noreferrer"
            >
              Explore the repository <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer page-container">
      <div className="footer-brand">
        <Mark small />
        <span>
          aperture<span className="brand-dot">.</span>
        </span>
        <span className="footer-separator" /> UI LAB
      </div>
      <span>Designed as an interactive frontend experiment.</span>
      <a href="https://github.com/jinjutroy" target="_blank" rel="noreferrer">
        github.com/jinjutroy <ArrowUpRight size={14} />
      </a>
    </footer>
  );
}
