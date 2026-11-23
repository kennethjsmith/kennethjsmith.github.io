export type Project = {
  title: string
  description: string
  tags: string[]
  /** Makes the whole card a link when set. */
  url?: string
  /** Label for the link at the bottom of the card. */
  cta?: string
  /** Small image shown above the title. */
  icon?: string
}

export const projects: Project[] = [
  {
    title: 'Ikebana',
    description:
      'A top-down roguelike for the browser, co-developed in JavaScript. It won awards in our cohort. I worked on collisions, performance and a lot of the art.',
    tags: ['JavaScript', 'Canvas', 'Game dev'],
    url: 'https://kennethjsmith.github.io/ikebana/',
    cta: 'Play it →',
    icon: '/assets/goop.gif',
  },
  {
    title: 'PKMN DB',
    description:
      'A registry site for hobbyists, built on a MySQL schema I designed. It ran on Node and Express on Heroku, with the database on Azure.',
    tags: ['Node.js', 'Express', 'MySQL', 'Azure'],
  },
  {
    title: 'User Profiling with Social Media Data',
    description:
      'An ensemble deep-learning model that combined image, text and relational signals to classify users, reaching 88% accuracy.',
    tags: ['Python', 'TensorFlow', 'Keras'],
  },
]
