import { groq } from "next-sanity";

export const allCoursesQuery = groq`
  *[_type == "course" && isPublished == true] | order(_createdAt desc) {
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
  *[_type == "course" && isPublished == true && slug.current == $slug][0] {
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
          "testCases": coalesce(testCases, []),
          "hints": coalesce(hints, []),
          "validationRules": coalesce(validationRules, []),
          "maxAttempts": coalesce(maxAttempts, 3)
        },
        blockType == "quiz" => {
          "type": "quiz",
          "questionType": coalesce(questionType, "mcq"),
          "content": coalesce(quizQuestion, ""),
          "responseConfig": {
            "options": coalesce(quizOptions, []),
            "correctAnswer": correctAnswer,
            "correctAnswers": correctAnswers,
            "responseConfigJson": responseConfigJson
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

export const adminCoursesQuery = groq`
  *[_type == "course"] | order(_createdAt desc) {
    "_id": _id,
    title,
    "slug": slug.current,
    description,
    isPublished,
    publishedAt,
    difficulty,
    language,
    _createdAt,
    "moduleCount": count(modules),
    "lessonCount": count(modules[]->lessons[])
  }
`;

export const adminCourseByIdQuery = groq`
  *[_type == "course" && _id == $id][0] {
    "_id": _id,
    title,
    "slug": slug.current,
    description,
    language,
    difficulty,
    isPublished,
    publishedAt,
    "thumbnail": thumbnail.asset->url,
    tags,
    modules[]-> {
      "_id": _id,
      title,
      description,
      type,
      "order": order,
      lessons[]-> {
        "_id": _id,
        title,
        "slug": slug.current,
        "xp": coalesce(xp, 0),
        estimatedMinutes,
        difficulty
      }
    }
  }
`;

export const adminLessonByIdQuery = groq`
  *[_type == "lesson" && _id == $id][0] {
    "_id": _id,
    title,
    "slug": slug.current,
    "xp": coalesce(xp, 0),
    estimatedMinutes,
    difficulty,
    contentBlocks[] {
      _key,
      blockType,
      textContent,
      language,
      code,
      filename,
      starterCode,
      solutionCode,
      hints,
      testCases,
      validationRules,
      maxAttempts,
      quizQuestion,
      quizOptions,
      correctAnswer,
      correctAnswers,
      responseConfigJson,
      questionType,
      calloutType,
      calloutTitle,
      calloutContent,
      "imageUrl": image.asset->url,
      "imageAssetId": image.asset._ref,
      alt,
      caption,
      videoUrl,
      videoTitle
    }
  }
`;
