/**
 * Experience / theme categories.
 * Used to tag and filter destinations and journeys by the kind of
 * trip a traveller is looking for (e.g. temples, hills, beaches).
 *
 * @typedef {Object} Experience
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {string} icon - lucide-react icon name
 */

/** @type {Experience[]} */
export const experiences = [
  {
    id: 'temple-culture',
    name: 'Temple & Culture',
    slug: 'temple-culture',
    description: 'Ancient temples, rituals, and living traditions.',
    icon: 'Landmark',
  },
  {
    id: 'hills-nature',
    name: 'Hills & Nature',
    slug: 'hills-nature',
    description: 'Cool hill towns, viewpoints, and green valleys.',
    icon: 'Mountain',
  },
  {
    id: 'beaches-coast',
    name: 'Beaches & Coast',
    slug: 'beaches-coast',
    description: 'Coastline, sunrise and sunset points, and sea views.',
    icon: 'Waves',
  },
  {
    id: 'heritage-history',
    name: 'Heritage & History',
    slug: 'heritage-history',
    description: 'Forts, palaces, and towns with a long past.',
    icon: 'BookOpen',
  },
  {
    id: 'wildlife-nature',
    name: 'Wildlife & Nature',
    slug: 'wildlife-nature',
    description: 'Forests, tea estates, and protected reserves.',
    icon: 'Trees',
  },
];

export function getExperienceBySlug(slug) {
  return experiences.find((experience) => experience.slug === slug);
}
