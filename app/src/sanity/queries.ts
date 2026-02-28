import { groq } from 'next-sanity';

export const allCoursesQuery = groq`
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    language,
    thumbnail,
    tags,
    "moduleCount": count(modules)
  }
`;

export const courseBySlugQuery = groq`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    language,
    thumbnail,
    tags,
    modules[]-> {
      _id,
      title,
      type,
      order,
      lessons[]-> {
        _id,
        title,
        slug,
        xp,
        difficulty,
        estimatedMinutes
      }
    }
  }
`;

export const lessonBySlugQuery = groq`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    xp,
    difficulty,
    estimatedMinutes,
    contentBlocks
  }
`;
