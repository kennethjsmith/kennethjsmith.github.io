export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__logo" href="#top" aria-label="Home">
        KS
      </a>
      <nav className="nav__links" aria-label="Sections">
        <a href="#about">About</a>
        <a href="#projects">Projects</a>
        <a href="/assets/SmithK_Resume.pdf" target="_blank" rel="noopener">
          Resume
        </a>
      </nav>
    </header>
  )
}
