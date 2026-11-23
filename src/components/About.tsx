export default function About() {
  return (
    <section id="about" className="section">
      <h2>About</h2>
      <div className="about">
        <div className="about__text">
          <p>
            I live in Los Angeles and work remotely as a software engineer at Veeva Systems.
          </p>
          <p>
            My degree is in Computer Science &amp; Systems from the University of Washington Tacoma,
            where I graduated summa cum laude in 2022 with a minor in mathematics.
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
