import type { Project } from '../data/projects.ts'

export default function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      {project.icon && <img className="card__icon" src={project.icon} alt="" width={48} height={48} />}
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ul className="tags">
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      {project.url && project.cta && <span className="card__cta">{project.cta}</span>}
    </>
  )

  return project.url ? (
    <a className="card card--link" href={project.url}>
      {body}
    </a>
  ) : (
    <article className="card">{body}</article>
  )
}
