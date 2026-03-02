import { groq } from "next-sanity";

export const allCoursesQuery = groq`
  *[_type == "course"] | order(_createdAt desc) {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "id": _id,
      title,
      "description": "",
      type,
      "sortOrder": order,
      lessons[]-> {
        "id": _id,
        title,
        "slug": slug.current,
        "xpReward": coalesce(xp, 0),
        estimatedMinutes,
        difficulty,
        "sortOrder": 0
      }
    }
  }
`;

export const courseBySlugQuery = groq`
  *[_type == "course" && slug.current == $slug][0] {
    "id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "id": _id,
      title,
      "description": "",
      type,
      "sortOrder": order,
      lessons[]-> {
        "id": _id,
        title,
        "slug": slug.current,
        "xpReward": coalesce(xp, 0),
        estimatedMinutes,
        difficulty,
        "sortOrder": 0
      }
    }
  }
`;

export const lessonBySlugQuery = groq`
  *[_type == "lesson" && slug.current == $slug][0] {
    "id": _id,
    title,
    "slug": slug.current,
    "xpReward": coalesce(xp, 0),
    estimatedMinutes,
    difficulty,
    "sortOrder": 0,
    "contentBlocks": contentBlocks[] {
      "id": _key,
      "type": blockType,
      "sortOrder": 0,
      "data": select(
        blockType == "text" => {
          "type": "text",
          "content": textContent
        },
        blockType == "code_example" => {
          "type": "code_example",
          "language": coalesce(language, "typescript"),
          "code": coalesce(code, ""),
          "filename": filename
        },
        blockType == "code_challenge" => {
          "type": "code_challenge",
          "language": coalesce(language, "typescript"),
          "starterCode": coalesce(starterCode, ""),
          "solutionCode": coalesce(solutionCode, ""),
          "testCases": [],
          "hints": coalesce(hints, []),
          "maxAttempts": 3
        },
        blockType == "quiz" => {
          "type": "quiz",
          "questionType": "mcq",
          "content": coalesce(quizQuestion, ""),
          "responseConfig": {
            "options": coalesce(quizOptions, [])
              | order(@) []
              { "label": string(@), "text": @, "is_correct": false }
          }
        },
        blockType == "callout" => {
          "type": "callout",
          "calloutType": coalesce(calloutType, "info"),
          "title": calloutTitle,
          "content": coalesce(calloutContent, "")
        },
        blockType == "image" => {
          "type": "image",
          "src": image.asset->url,
          "alt": coalesce(alt, ""),
          "caption": caption
        },
        blockType == "video_embed" => {
          "type": "video_embed",
          "url": coalesce(videoUrl, ""),
          "title": videoTitle
        }
      )
    }
  }
`;
