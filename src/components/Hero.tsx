import SocialLinks from './SocialLinks.tsx'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <img className="hero__photo" src="/assets/headshot.jpg" alt="Ken Smith" width={640} height={640} />
        <div>
          <p className="eyebrow">Hi, I'm</p>
          <h1>Ken Smith</h1>
          <p className="hero__tagline">Software engineer based in Los Angeles.</p>
          <SocialLinks />
        </div>
      </div>
    </section>
  )
}
