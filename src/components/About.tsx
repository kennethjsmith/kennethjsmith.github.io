export default function About() {
  return (
    <section id="about" className="section">
      <h2>About</h2>
      <div className="about">
        <div className="about__text">
          <p>
            I'm a software engineer at Veeva Systems, based in Los Angeles. I studied Computer
            Science &amp; Systems at the University of Washington Tacoma, graduating summa cum laude
            in 2022 with a minor in mathematics.
          </p>
          <p>
            Away from the keyboard you'll find me scuba diving. Here are some manta rays I met on a
            dive in Kona.
          </p>
        </div>
        <video
          className="about__video"
          controls
          preload="none"
          playsInline
          poster="/assets/mantas-poster.jpg"
          src="/assets/mantas.mp4"
        >
          Your browser doesn't support HTML5 video.
        </video>
      </div>
    </section>
  )
}
