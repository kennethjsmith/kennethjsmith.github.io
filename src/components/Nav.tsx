export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__logo" href="#top" aria-label="Home">
        KS
      </a>
      <nav className="nav__links" aria-label="Sections">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="https://www.linkedin.com/in/kenjamessmith/" target="_blank" rel="noopener">
          LinkedIn
        </a>
      </nav>
    </header>
  )
}
