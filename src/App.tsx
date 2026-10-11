import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  CheckCircle2,
  CircleHelp,
  Code2,
  Copy,
  GitBranch,
  LayoutGrid,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import {
  ACCENTS,
  DEFAULT_PREFERENCES,
  getTokenCss,
  getTokenVariables,
  loadPreferences,
  savePreferences,
  type Density,
  type Preferences,
  type Theme,
} from "./system";
import { ApproachAndClosing, Hero, Mark, SiteFooter } from "./Presentation";
import "./App.css";

type CanvasView = "workspace" | "components" | "tokens";
type CodeView = "button" | "tokens" | "dialog";
type ProjectStatus = "In progress" | "In review" | "Completed";
type Project = {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  initial: string;
  color: string;
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Orbit redesign",
    description: "Product design · Updated today",
    status: "In progress",
    initial: "O",
    color: "blue",
  },
  {
    id: 2,
    name: "Atlas components",
    description: "Design system · Updated yesterday",
    status: "In review",
    initial: "A",
    color: "purple",
  },
  {
    id: 3,
    name: "Northstar launch",
    description: "Marketing · Updated 2 days ago",
    status: "Completed",
    initial: "N",
    color: "orange",
  },
];

function navigateTabs<T extends string>(
  event: KeyboardEvent<HTMLButtonElement>,
  values: readonly T[],
  selected: T,
  select: (value: T) => void,
) {
  const current = values.indexOf(selected);
  const next =
    event.key === "ArrowRight"
      ? (current + 1) % values.length
      : event.key === "ArrowLeft"
        ? (current - 1 + values.length) % values.length
        : event.key === "Home"
          ? 0
          : event.key === "End"
            ? values.length - 1
            : -1;
  if (next < 0) return;
  event.preventDefault();
  select(values[next]);
  event.currentTarget.parentElement
    ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    [next]?.focus();
}

const CANVAS_VIEWS = ["workspace", "components", "tokens"] as const;
const CODE_VIEWS = ["button", "tokens", "dialog"] as const;
const DEMO_TABS = ["profile", "notifications"] as const;

function App() {
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [canvasView, setCanvasView] = useState<CanvasView>("workspace");
  const [codeView, setCodeView] = useState<CodeView>("button");
  const [projects, setProjects] = useState(initialProjects);
  const [projectFilter, setProjectFilter] = useState<"All" | ProjectStatus>(
    "All",
  );
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [demoTab, setDemoTab] = useState<"profile" | "notifications">(
    "profile",
  );
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => savePreferences(preferences), [preferences]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogOpen && !dialog.open) dialog.showModal();
    if (!dialogOpen && dialog.open) dialog.close();
  }, [dialogOpen]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          (projectFilter === "All" || project.status === projectFilter) &&
          `${project.name} ${project.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [projects, projectFilter, query],
  );

  const codeSnippets: Record<CodeView, string> = {
    button: `<button className="ui-button ui-button-primary" type="button">\n  Create project\n</button>\n\n/* These are the live canvas token names. */\n.ui-button { border-radius: var(--ui-radius); }\n.ui-button-primary {\n  background: var(--ui-accent);\n  border-color: var(--ui-accent);\n}`,
    tokens: getTokenCss(preferences),
    dialog: `const dialogRef = useRef<HTMLDialogElement>(null);\n\n<button onClick={() => dialogRef.current?.showModal()}>\n  Create project\n</button>\n\n<dialog ref={dialogRef} aria-labelledby="dialog-title">\n  <h2 id="dialog-title">New project</h2>\n  <form method="dialog">\n    <button type="submit">Close</button>\n  </form>\n</dialog>`,
  };

  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }
  function showToast(message: string) {
    setToast(message);
  }
  function openDialog(event: MouseEvent<HTMLButtonElement>) {
    dialogTriggerRef.current = event.currentTarget;
    setDialogOpen(true);
  }
  function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;
    setProjects((current) => [
      {
        id: Date.now(),
        name,
        description: "New project · Updated just now",
        status: "In progress",
        initial: name.charAt(0).toUpperCase(),
        color: "blue",
      },
      ...current,
    ]);
    setNewProjectName("");
    setQuery("");
    setProjectFilter("All");
    setDialogOpen(false);
    showToast(`${name} was created`);
  }
  function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setInviteError("");
    showToast(`Demo invitation for ${inviteEmail.trim()}. No email was sent.`);
    setInviteEmail("");
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(codeSnippets[codeView]);
      setCopied(true);
    } catch {
      showToast("Clipboard access is unavailable in this browser.");
    }
  }

  const previewStyle = getTokenVariables(preferences) as CSSProperties;

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner page-container">
          <a
            className="brand"
            href="#top"
            aria-label="Aperture UI Lab, back to top"
          >
            <Mark />
            <span className="brand-name">
              aperture<span className="brand-dot">.</span>
            </span>
            <span className="brand-suffix">UI LAB</span>
          </a>
          <nav
            className={`main-nav${mobileNavOpen ? " main-nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <a href="#studio" onClick={() => setMobileNavOpen(false)}>
              Playground
            </a>
            <a href="#approach" onClick={() => setMobileNavOpen(false)}>
              Approach
            </a>
            <a href="#source" onClick={() => setMobileNavOpen(false)}>
              Source
            </a>
          </nav>
          <a
            className="header-github"
            href="https://github.com/jinjutroy/aperture-ui-lab"
            target="_blank"
            rel="noreferrer"
          >
            <GitBranch size={17} />
            <span>View on GitHub</span>
            <ArrowUpRight size={15} />
          </a>
          <button
            className="mobile-menu"
            type="button"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <Hero />

        <section
          className="studio-section"
          id="studio"
          aria-labelledby="studio-title"
        >
          <div className="page-container">
            <div className="section-heading">
              <div>
                <div className="section-kicker">
                  <span>01 / PLAYGROUND</span>
                  <span className="section-kicker-rule" />
                </div>
                <h2 id="studio-title">
                  Make it <em>yours.</em>
                </h2>
              </div>
              <p>
                Every adjustment flows through the same token layer. The canvas
                updates instantly, and your choices stay when you return.
              </p>
            </div>
            <div className="studio-layout">
              <aside
                className="control-panel"
                aria-labelledby="control-heading"
              >
                <div className="control-header">
                  <div className="control-icon">
                    <SlidersHorizontal size={20} />
                  </div>
                  <div>
                    <span className="panel-overline">SYSTEM CONTROLS</span>
                    <h3 id="control-heading">Tune the canvas</h3>
                  </div>
                </div>
                <div className="control-group">
                  <div className="control-label-row">
                    <span id="accent-label">Accent color</span>
                    <span>{ACCENTS[preferences.accent].label}</span>
                  </div>
                  <div
                    className="swatch-list"
                    role="group"
                    aria-labelledby="accent-label"
                  >
                    {(
                      Object.entries(ACCENTS) as [
                        keyof typeof ACCENTS,
                        (typeof ACCENTS)[keyof typeof ACCENTS],
                      ][]
                    ).map(([key, accent]) => (
                      <button
                        key={key}
                        type="button"
                        className={`swatch${preferences.accent === key ? " swatch-active" : ""}`}
                        style={{ "--swatch": accent.hex } as CSSProperties}
                        aria-label={`${accent.label} accent`}
                        aria-pressed={preferences.accent === key}
                        onClick={() => updatePreference("accent", key)}
                      >
                        {preferences.accent === key && (
                          <Check size={15} strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-group">
                  <div className="control-label-row">
                    <span id="theme-label">Canvas theme</span>
                  </div>
                  <div
                    className="control-segment"
                    role="group"
                    aria-labelledby="theme-label"
                  >
                    {(
                      [
                        ["light", Sun, "Light"],
                        ["dark", Moon, "Dark"],
                      ] as const
                    ).map(([theme, Icon, label]) => (
                      <button
                        key={theme}
                        type="button"
                        className={
                          preferences.theme === theme ? "selected" : ""
                        }
                        aria-pressed={preferences.theme === theme}
                        onClick={() =>
                          updatePreference("theme", theme as Theme)
                        }
                      >
                        <Icon size={16} /> {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="control-group">
                  <div className="control-label-row">
                    <label htmlFor="radius-control">Corner radius</label>
                    <span>{preferences.radius}px</span>
                  </div>
                  <input
                    id="radius-control"
                    className="radius-slider"
                    type="range"
                    min="6"
                    max="24"
                    step="1"
                    value={preferences.radius}
                    style={
                      {
                        "--range-progress": `${((preferences.radius - 6) / 18) * 100}%`,
                      } as CSSProperties
                    }
                    onChange={(event) =>
                      updatePreference("radius", Number(event.target.value))
                    }
                  />
                  <div className="range-labels">
                    <span>Sharp</span>
                    <span>Soft</span>
                  </div>
                </div>
                <div className="control-group">
                  <div className="control-label-row">
                    <span id="density-label">Spacing density</span>
                  </div>
                  <div
                    className="control-segment"
                    role="group"
                    aria-labelledby="density-label"
                  >
                    {(["comfortable", "compact"] as Density[]).map(
                      (density) => (
                        <button
                          key={density}
                          type="button"
                          className={
                            preferences.density === density ? "selected" : ""
                          }
                          aria-pressed={preferences.density === density}
                          onClick={() => updatePreference("density", density)}
                        >
                          {density === "comfortable"
                            ? "Comfortable"
                            : "Compact"}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <button
                  className="reset-button"
                  type="button"
                  onClick={() => setPreferences(DEFAULT_PREFERENCES)}
                >
                  <RotateCcw size={15} /> Reset to defaults
                </button>
                <div className="control-footer">
                  <span className="online-dot" /> Changes saved in this browser
                </div>
              </aside>
              <div className="studio-main">
                <div className="canvas-toolbar">
                  <div className="canvas-title">
                    <span className="canvas-title-icon">
                      <LayoutGrid size={17} />
                    </span>
                    <div>
                      <strong>Live canvas</strong>
                      <span>Sample workspace · interactive preview</span>
                    </div>
                  </div>
                  <div className="canvas-toolbar-right">
                    <span className="live-indicator">
                      <span /> LIVE
                    </span>
                    <span className="canvas-size">RESPONSIVE</span>
                  </div>
                </div>
                <div
                  className="canvas-tabs"
                  role="tablist"
                  aria-label="Canvas view"
                >
                  {(
                    [
                      ["workspace", "Workspace"],
                      ["components", "Components"],
                      ["tokens", "Tokens"],
                    ] as const
                  ).map(([view, label]) => (
                    <button
                      key={view}
                      id={`canvas-tab-${view}`}
                      type="button"
                      role="tab"
                      aria-selected={canvasView === view}
                      aria-controls={`canvas-panel-${view}`}
                      tabIndex={canvasView === view ? 0 : -1}
                      className={canvasView === view ? "active" : ""}
                      onClick={() => setCanvasView(view)}
                      onKeyDown={(event) =>
                        navigateTabs(
                          event,
                          CANVAS_VIEWS,
                          canvasView,
                          setCanvasView,
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div
                  className={`preview-window theme-${preferences.theme}`}
                  style={previewStyle}
                >
                  <div
                    id={`canvas-panel-${canvasView}`}
                    role="tabpanel"
                    aria-labelledby={`canvas-tab-${canvasView}`}
                  >
                    {canvasView === "workspace" && (
                      <div className="demo-app">
                        <aside
                          className="demo-sidebar"
                          aria-label="Sample workspace navigation"
                        >
                          <div className="demo-sidebar-logo">
                            N<span>.</span>
                          </div>
                          <button
                            className="demo-side-item active"
                            type="button"
                            aria-label="Overview"
                            title="Overview"
                          >
                            <LayoutGrid size={18} />
                          </button>
                          <button
                            className="demo-side-item"
                            type="button"
                            aria-label="Settings preview"
                            title="Settings preview"
                            onClick={() =>
                              showToast(
                                "Settings are illustrated in the Components tab.",
                              )
                            }
                          >
                            <Settings2 size={18} />
                          </button>
                          <div className="demo-side-spacer" />
                          <button
                            className="demo-side-item"
                            type="button"
                            aria-label="Help"
                            title="Help"
                            onClick={() =>
                              showToast(
                                "This is a sample workspace for the UI Lab.",
                              )
                            }
                          >
                            <CircleHelp size={18} />
                          </button>
                          <div className="demo-avatar">AL</div>
                        </aside>
                        <div className="demo-content">
                          <div className="demo-topbar">
                            <span>
                              Workspace <span className="crumb-divider">/</span>{" "}
                              Overview
                            </span>
                            <div>
                              <button
                                type="button"
                                aria-label="Show notifications"
                                onClick={() =>
                                  showToast("You are all caught up.")
                                }
                              >
                                <Bell size={17} />
                              </button>
                              <span className="demo-avatar demo-avatar-mobile">
                                AL
                              </span>
                            </div>
                          </div>
                          <div className="demo-body">
                            <div className="demo-welcome">
                              <div>
                                <div className="demo-eyebrow">
                                  <span /> YOUR WORKSPACE
                                </div>
                                <h3>
                                  Good morning, Alex{" "}
                                  <span aria-hidden="true">✳</span>
                                </h3>
                                <p>Here’s what’s moving across your team.</p>
                              </div>
                              <button
                                className="ui-button ui-button-primary"
                                type="button"
                                onClick={openDialog}
                              >
                                <Plus size={17} /> New project
                              </button>
                            </div>
                            <div className="demo-metrics">
                              <div className="metric-card">
                                <span>ACTIVE PROJECTS</span>
                                <strong>
                                  {projects
                                    .filter(
                                      (project) =>
                                        project.status !== "Completed",
                                    )
                                    .length.toString()
                                    .padStart(2, "0")}
                                </strong>
                                <small>
                                  <ArrowUpRight size={13} /> In motion
                                </small>
                              </div>
                              <div className="metric-card">
                                <span>IN REVIEW</span>
                                <strong>
                                  {projects
                                    .filter(
                                      (project) =>
                                        project.status === "In review",
                                    )
                                    .length.toString()
                                    .padStart(2, "0")}
                                </strong>
                                <small>
                                  <span className="metric-minidot" /> Needs
                                  attention
                                </small>
                              </div>
                              <div className="metric-card">
                                <span>COMPLETED</span>
                                <strong>
                                  {projects
                                    .filter(
                                      (project) =>
                                        project.status === "Completed",
                                    )
                                    .length.toString()
                                    .padStart(2, "0")}
                                </strong>
                                <small>
                                  <CheckCircle2 size={13} /> Looking good
                                </small>
                              </div>
                            </div>
                            <div className="demo-projects">
                              <div className="projects-heading">
                                <div>
                                  <h4>
                                    Projects <span>{projects.length}</span>
                                  </h4>
                                  <p>Keep the important work in view.</p>
                                </div>
                                <button
                                  type="button"
                                  className="ui-icon-button"
                                  aria-label="More project options"
                                  onClick={() =>
                                    showToast(
                                      "Project options are a design preview.",
                                    )
                                  }
                                >
                                  <MoreHorizontal size={20} />
                                </button>
                              </div>
                              <div className="projects-tools">
                                <div
                                  className="project-filters"
                                  role="group"
                                  aria-label="Filter projects"
                                >
                                  <button
                                    type="button"
                                    className={
                                      projectFilter === "All" ? "active" : ""
                                    }
                                    aria-pressed={projectFilter === "All"}
                                    onClick={() => setProjectFilter("All")}
                                  >
                                    All
                                  </button>
                                  <button
                                    type="button"
                                    className={
                                      projectFilter === "In progress"
                                        ? "active"
                                        : ""
                                    }
                                    aria-pressed={
                                      projectFilter === "In progress"
                                    }
                                    onClick={() =>
                                      setProjectFilter("In progress")
                                    }
                                  >
                                    In progress
                                  </button>
                                  <button
                                    type="button"
                                    className={
                                      projectFilter === "Completed"
                                        ? "active"
                                        : ""
                                    }
                                    aria-pressed={projectFilter === "Completed"}
                                    onClick={() =>
                                      setProjectFilter("Completed")
                                    }
                                  >
                                    Completed
                                  </button>
                                </div>
                                <label className="project-search">
                                  <Search size={16} />
                                  <span className="sr-only">
                                    Search projects
                                  </span>
                                  <input
                                    value={query}
                                    onChange={(event) =>
                                      setQuery(event.target.value)
                                    }
                                    placeholder="Search projects"
                                  />
                                </label>
                              </div>
                              <div className="project-list">
                                {filteredProjects.length ? (
                                  filteredProjects.map((project) => (
                                    <div
                                      className="project-row"
                                      key={project.id}
                                    >
                                      <div
                                        className={`project-initial project-initial-${project.color}`}
                                      >
                                        {project.initial}
                                      </div>
                                      <div className="project-name">
                                        <strong>{project.name}</strong>
                                        <span>{project.description}</span>
                                      </div>
                                      <span
                                        className={`status-badge status-${project.status.toLowerCase().replace(" ", "-")}`}
                                      >
                                        <span />
                                        {project.status}
                                      </span>
                                      <button
                                        type="button"
                                        className="project-arrow"
                                        aria-label={`View ${project.name} preview`}
                                        onClick={() =>
                                          showToast(
                                            `${project.name} is a sample project.`,
                                          )
                                        }
                                      >
                                        <ArrowUpRight size={17} />
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <div className="project-empty">
                                    <Search size={21} />
                                    <strong>No matching projects</strong>
                                    <span>Try another search or filter.</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {canvasView === "components" && (
                      <div className="components-canvas">
                        <div className="components-heading">
                          <div className="demo-eyebrow">
                            <span /> COMPONENT LIBRARY
                          </div>
                          <h3>Small parts. Big impact.</h3>
                          <p>
                            Each piece has a purpose, a state, and a way to
                            interact.
                          </p>
                        </div>
                        <div className="component-grid">
                          <section className="component-card">
                            <div className="component-card-head">
                              <span>01 / ACTIONS</span>
                              <Code2 size={16} />
                            </div>
                            <h4>Buttons</h4>
                            <p>Clear hierarchy for the next step.</p>
                            <div className="button-examples">
                              <button
                                type="button"
                                className="ui-button ui-button-primary"
                                onClick={() =>
                                  showToast("Primary action confirmed.")
                                }
                              >
                                <Plus size={16} /> Primary action
                              </button>
                              <button
                                type="button"
                                className="ui-button ui-button-secondary"
                                onClick={() =>
                                  showToast("Secondary action confirmed.")
                                }
                              >
                                Secondary <ArrowRight size={15} />
                              </button>
                              <button
                                type="button"
                                className="ui-icon-button"
                                aria-label="More actions"
                                onClick={() =>
                                  showToast("Icon action confirmed.")
                                }
                              >
                                <MoreHorizontal size={20} />
                              </button>
                            </div>
                          </section>
                          <section className="component-card">
                            <div className="component-card-head">
                              <span>02 / INPUTS</span>
                              <Code2 size={16} />
                            </div>
                            <h4>Form field</h4>
                            <p>Helpful feedback at the point of action.</p>
                            <form
                              className="invite-form"
                              onSubmit={submitInvite}
                              noValidate
                            >
                              <label htmlFor="invite-email">
                                Invite a teammate
                              </label>
                              <span className="form-note">
                                Demo only — no email is sent.
                              </span>
                              <div className="input-action">
                                <input
                                  id="invite-email"
                                  type="email"
                                  value={inviteEmail}
                                  aria-invalid={Boolean(inviteError)}
                                  aria-describedby={
                                    inviteError ? "invite-error" : undefined
                                  }
                                  placeholder="name@company.com"
                                  onChange={(event) => {
                                    setInviteEmail(event.target.value);
                                    setInviteError("");
                                  }}
                                />
                                <button
                                  type="submit"
                                  className="ui-button ui-button-primary"
                                >
                                  Invite
                                </button>
                              </div>
                              {inviteError && (
                                <span className="field-error" id="invite-error">
                                  {inviteError}
                                </span>
                              )}
                            </form>
                          </section>
                          <section className="component-card">
                            <div className="component-card-head">
                              <span>03 / PREFERENCES</span>
                              <Code2 size={16} />
                            </div>
                            <h4>Switch</h4>
                            <p>A clear on and off state with a full label.</p>
                            <div className="switch-row">
                              <div>
                                <strong>Email notifications</strong>
                                <span>Updates on projects you follow</span>
                              </div>
                              <button
                                type="button"
                                role="switch"
                                aria-label="Email notifications"
                                aria-checked={alertsEnabled}
                                className={`ui-switch${alertsEnabled ? " is-on" : ""}`}
                                onClick={() =>
                                  setAlertsEnabled((enabled) => !enabled)
                                }
                              >
                                <span />
                              </button>
                            </div>
                          </section>
                          <section className="component-card">
                            <div className="component-card-head">
                              <span>04 / NAVIGATION</span>
                              <Code2 size={16} />
                            </div>
                            <h4>Tabs</h4>
                            <p>Related content, one focused view.</p>
                            <div
                              className="demo-tabs"
                              role="tablist"
                              aria-label="Sample settings"
                            >
                              <button
                                id="demo-tab-profile"
                                role="tab"
                                aria-controls="demo-panel-profile"
                                tabIndex={demoTab === "profile" ? 0 : -1}
                                aria-selected={demoTab === "profile"}
                                type="button"
                                className={
                                  demoTab === "profile" ? "active" : ""
                                }
                                onClick={() => setDemoTab("profile")}
                                onKeyDown={(event) =>
                                  navigateTabs(
                                    event,
                                    DEMO_TABS,
                                    demoTab,
                                    setDemoTab,
                                  )
                                }
                              >
                                Profile
                              </button>
                              <button
                                id="demo-tab-notifications"
                                role="tab"
                                aria-controls="demo-panel-notifications"
                                tabIndex={demoTab === "notifications" ? 0 : -1}
                                aria-selected={demoTab === "notifications"}
                                type="button"
                                className={
                                  demoTab === "notifications" ? "active" : ""
                                }
                                onClick={() => setDemoTab("notifications")}
                                onKeyDown={(event) =>
                                  navigateTabs(
                                    event,
                                    DEMO_TABS,
                                    demoTab,
                                    setDemoTab,
                                  )
                                }
                              >
                                Notifications
                              </button>
                            </div>
                            <div
                              role="tabpanel"
                              id={`demo-panel-${demoTab}`}
                              aria-labelledby={`demo-tab-${demoTab}`}
                              className="demo-tab-panel"
                            >
                              {demoTab === "profile" ? (
                                <>
                                  <div className="small-avatar">AL</div>
                                  <div>
                                    <strong>Alex Lee</strong>
                                    <span>Workspace admin</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Bell size={19} />
                                  <div>
                                    <strong>Stay in the loop</strong>
                                    <span>
                                      {alertsEnabled
                                        ? "Email updates are on."
                                        : "Email updates are off."}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </section>
                          <section className="component-card component-card-wide">
                            <div className="component-card-head">
                              <span>05 / FEEDBACK</span>
                              <Code2 size={16} />
                            </div>
                            <div className="wide-card-content">
                              <div>
                                <h4>Dialog & toast</h4>
                                <p>
                                  Actions have a beginning, a clear outcome, and
                                  a path back.
                                </p>
                              </div>
                              <div className="wide-card-actions">
                                <button
                                  type="button"
                                  className="ui-button ui-button-secondary"
                                  onClick={openDialog}
                                >
                                  Open dialog <ArrowUpRight size={15} />
                                </button>
                                <button
                                  type="button"
                                  className="ui-button ui-button-primary"
                                  onClick={() =>
                                    showToast("Your changes have been saved.")
                                  }
                                >
                                  Show toast <Bell size={15} />
                                </button>
                              </div>
                            </div>
                          </section>
                        </div>
                      </div>
                    )}
                    {canvasView === "tokens" && (
                      <div className="tokens-canvas">
                        <div className="components-heading">
                          <div className="demo-eyebrow">
                            <span /> DESIGN TOKENS
                          </div>
                          <h3>Decisions, made reusable.</h3>
                          <p>
                            A small token set creates a consistent language
                            across the interface.
                          </p>
                        </div>
                        <div className="token-grid">
                          <div className="token-card">
                            <span>COLOR / ACCENT</span>
                            <div className="token-color-sample">
                              <span
                                style={{
                                  background: ACCENTS[preferences.accent].hex,
                                }}
                              />
                              <strong>
                                {ACCENTS[preferences.accent].label}
                              </strong>
                            </div>
                            <code>{ACCENTS[preferences.accent].hex}</code>
                          </div>
                          <div className="token-card">
                            <span>SHAPE / RADIUS</span>
                            <div
                              className="radius-sample"
                              style={{ borderRadius: preferences.radius }}
                            >
                              <span />
                            </div>
                            <code>{preferences.radius}px</code>
                          </div>
                          <div className="token-card">
                            <span>RHYTHM / DENSITY</span>
                            <div className="density-sample">
                              <span />
                              <span />
                              <span />
                            </div>
                            <code>
                              {preferences.density === "comfortable"
                                ? "1"
                                : "0.78"}{" "}
                              scale
                            </code>
                          </div>
                          <div className="token-card">
                            <span>MODE / THEME</span>
                            <div className="theme-sample">
                              {preferences.theme === "light" ? (
                                <Sun size={26} />
                              ) : (
                                <Moon size={26} />
                              )}
                              <strong>
                                {preferences.theme === "light"
                                  ? "Light"
                                  : "Dark"}
                              </strong>
                            </div>
                            <code>color-scheme: {preferences.theme}</code>
                          </div>
                        </div>
                        <div className="token-note">
                          <Sparkles size={18} />
                          <p>
                            These values are shared with the workspace and
                            component previews. Change a control on the left to
                            see the whole system respond.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="code-panel" id="source">
                  <div className="code-panel-top">
                    <div>
                      <span className="code-panel-overline">
                        UNDER THE HOOD
                      </span>
                      <h3>Inspect the implementation</h3>
                    </div>
                    <span className="code-panel-language">
                      <span /> REACT + CSS
                    </span>
                  </div>
                  <div className="code-toolbar">
                    <div
                      className="code-tabs"
                      role="tablist"
                      aria-label="Code example"
                    >
                      {(
                        [
                          ["button", "Button"],
                          ["tokens", "Tokens"],
                          ["dialog", "Dialog"],
                        ] as const
                      ).map(([view, label]) => (
                        <button
                          key={view}
                          id={`code-tab-${view}`}
                          type="button"
                          role="tab"
                          aria-selected={codeView === view}
                          aria-controls={`code-panel-${view}`}
                          tabIndex={codeView === view ? 0 : -1}
                          className={codeView === view ? "active" : ""}
                          onClick={() => setCodeView(view)}
                          onKeyDown={(event) =>
                            navigateTabs(
                              event,
                              CODE_VIEWS,
                              codeView,
                              setCodeView,
                            )
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="copy-button"
                      onClick={copyCode}
                      aria-label={copied ? "Code copied" : "Copy code"}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "Copied" : "Copy code"}
                    </button>
                  </div>
                  <pre
                    id={`code-panel-${codeView}`}
                    role="tabpanel"
                    aria-labelledby={`code-tab-${codeView}`}
                  >
                    <code>{codeSnippets[codeView]}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ApproachAndClosing />
      </main>
      <SiteFooter />
      <dialog
        ref={dialogRef}
        className={`project-dialog theme-${preferences.theme}`}
        style={previewStyle}
        aria-labelledby="new-project-title"
        onClose={() => {
          setDialogOpen(false);
          dialogTriggerRef.current?.focus();
        }}
      >
        <div className="dialog-head">
          <div className="dialog-icon">
            <Plus size={22} />
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => setDialogOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <h2 id="new-project-title">Create a project</h2>
        <p>
          Give your next idea a place to grow. This sample project stays here
          until you refresh.
        </p>
        <form onSubmit={createProject}>
          <label htmlFor="new-project-name">Project name</label>
          <input
            id="new-project-name"
            autoFocus
            required
            maxLength={50}
            value={newProjectName}
            onChange={(event) => setNewProjectName(event.target.value)}
            placeholder="e.g. Horizon dashboard"
          />
          <div className="dialog-actions">
            <button
              className="ui-button ui-button-secondary"
              type="button"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </button>
            <button className="ui-button ui-button-primary" type="submit">
              Create project <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </dialog>
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-icon">
            <Check size={17} />
          </span>
          <span>{toast}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
