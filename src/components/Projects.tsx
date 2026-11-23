import { projects } from '../data/projects.ts'
import ProjectCard from './ProjectCard.tsx'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      <div className="cards">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
      <p className="more">
        More on <a href="https://github.com/kennethjsmith">GitHub</a>.
      </p>
    </section>
  )
}
