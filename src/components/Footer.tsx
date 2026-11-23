const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <p>© {year} Ken Smith</p>
    </footer>
  )
}
