import { Link } from "react-router-dom";

const features = [
  {
    icon: "↗",
    number: "01",
    title: "Easy file management",
    description:
      "Upload and organize your important files in one workspace.",
  },
  {
    icon: "⌁",
    number: "02",
    title: "Sharing and versioning",
    description:
      "Share files and keep track of changes as your work evolves.",
  },
  {
    icon: "✓",
    number: "03",
    title: "Protected access",
    description:
      "Access your personal workspace through your account.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Set up your personal FileNest account.",
  },
  {
    number: "02",
    title: "Upload your files",
    description: "Bring your documents together in one place.",
  },
  {
    number: "03",
    title: "Stay organized",
    description: "Manage, share, and revisit your files when needed.",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      {/* Navigation */}
      <header className="home-nav">
        <Link to="/" className="home-brand" aria-label="FileNest home">
          <span className="home-brand-mark">F</span>
          <span>FileNest</span>
        </Link>

        <nav className="home-nav-links" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
        </nav>
      </header>

      {/* Hero section */}
      <section className="home-hero-section">
        <div className="home-hero-copy">
          <p className="home-eyebrow">YOUR FILES. YOUR SPACE.</p>

          <h1>
            Your files,
            <br />
            <span>all in one place.</span>
          </h1>

          <p className="home-hero-description">
            A simple workspace to upload, organize, share, and keep track
            of the files that matter to you.
          </p>

          {/* The only account button on this page */}
          <div className="home-hero-actions">
            <Link
              to="/register"
              className="home-button home-button-primary"
            >
              Get started <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="home-hero-note">
            <span className="home-note-check">✓</span>
            A personal space for your important files
          </div>
        </div>

        {/* Decorative workspace preview */}
        <div
          className="home-hero-visual"
          aria-label="Illustration of a file workspace"
        >
          <div className="home-visual-glow" />

          <div className="home-floating-label home-floating-label-top">
            <span className="home-floating-icon">✓</span>
            Organized workspace
          </div>

          <div className="home-workspace-card">
            <div className="home-workspace-header">
              <div>
                <span className="home-workspace-kicker">
                  MY WORKSPACE
                </span>
                <h2>Recent files</h2>
              </div>

              <span className="home-workspace-menu">•••</span>
            </div>

            <div className="home-workspace-search">
              <span aria-hidden="true">⌕</span>
              Search your files
            </div>

            <div className="home-workspace-files">
              <div className="home-workspace-file">
                <span className="home-file-icon home-file-icon-blue">
                  PDF
                </span>

                <span className="home-file-details">
                  <strong>Project notes</strong>
                  <small>PDF document</small>
                </span>

                <span className="home-file-more">•••</span>
              </div>

              <div className="home-workspace-file">
                <span className="home-file-icon home-file-icon-purple">
                  IMG
                </span>

                <span className="home-file-details">
                  <strong>Workspace image</strong>
                  <small>Image file</small>
                </span>

                <span className="home-file-more">•••</span>
              </div>

              <div className="home-workspace-file">
                <span className="home-file-icon home-file-icon-green">
                  TXT
                </span>

                <span className="home-file-details">
                  <strong>Important details</strong>
                  <small>Text document</small>
                </span>

                <span className="home-file-more">•••</span>
              </div>
            </div>

            <div className="home-workspace-footer">
              <span className="home-status-dot" />
              Your files, neatly organized
            </div>
          </div>

          <div className="home-floating-label home-floating-label-bottom">
            <span className="home-floating-icon home-floating-icon-blue">
              ↗
            </span>
            Files in one place
          </div>

          <div className="home-visual-orbit home-visual-orbit-one" />
          <div className="home-visual-orbit home-visual-orbit-two" />
        </div>
      </section>

      {/* Feature cards */}
      <section className="home-section" id="features">
        <div className="home-section-heading">
          <p className="home-eyebrow">MADE FOR YOUR WORKFLOW</p>

          <h2>
            Less searching.
            <br />
            <span>More doing.</span>
          </h2>

          <p>
            Keep the files you need organized and accessible from a
            single workspace.
          </p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature, index) => (
            <article
              className="home-feature-card"
              key={feature.number}
              style={{ "--card-index": index }}
            >
              <div className="home-feature-card-top">
                <span className="home-feature-card-icon">
                  {feature.icon}
                </span>

                <span className="home-feature-number">
                  {feature.number}
                </span>
              </div>

              <h3>{feature.title}</h3>
              <p>{feature.description}</p>

              <span className="home-card-arrow" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* Quote section */}
      <section className="home-quote-section">
        <div className="home-quote-mark" aria-hidden="true">
          “
        </div>

        <blockquote>
          Your important files deserve a space that feels
          <span> simple, organized, and yours.</span>
        </blockquote>

        <p>THE FILENEST APPROACH</p>
      </section>

      {/* How it works */}
      <section
        className="home-section home-how-section"
        id="how-it-works"
      >
        <div className="home-section-heading">
          <p className="home-eyebrow">GET STARTED IN THREE STEPS</p>

          <h2>
            A clearer way
            <br />
            <span>to manage your files.</span>
          </h2>
        </div>

        <div className="home-steps">
          {steps.map((step, index) => (
            <article
              className="home-step"
              key={step.number}
              style={{ "--step-index": index }}
            >
              <span className="home-step-number">{step.number}</span>

              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Closing message: no extra button */}
      <section className="home-cta">
        <p className="home-eyebrow">YOUR FILES. YOUR SPACE.</p>

        <h2>
          Keep your files
          <br />
          <span>organized in one place.</span>
        </h2>

        <p>
          A simple workspace for managing the documents that matter to you.
        </p>
      </section>

      {/* Footer: no account button */}
      <footer className="home-footer">
        <Link to="/" className="home-brand" aria-label="FileNest home">
          <span className="home-brand-mark home-brand-mark-small">F</span>
          <span>FileNest</span>
        </Link>

       
      </footer>
    </main>
  );
}