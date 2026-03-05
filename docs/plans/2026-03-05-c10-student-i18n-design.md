# C10 — Student Component i18n Wiring (Design)

**Date:** 2026-03-05
**Status:** Approved

## Context

C9 wired the 6 most-visible layout/auth components with `useTranslations()`. All student-facing pages still have hard-coded English strings. The i18n infrastructure (routing, request, message files) is fully wired. This design covers wiring every remaining student-facing component.

## Scope

24 components across 7 sections. 101 new keys across 4 new + 3 existing namespaces. All 3 locales (en, pt-BR, es).

## Strategy

- Client components (`"use client"`): `useTranslations("Namespace")`
- 8 pure display components (no `"use client"`): add `"use client"` directive + `useTranslations`
- Parameterized strings: ICU `{variable}` format
- Module-level const arrays with labels (MILESTONES, TIMEFRAMES, THEME_OPTIONS): move inside component body

## New Namespaces

| Namespace | Keys | Used by |
|-----------|------|---------|
| `Lessons` | 11 | lesson-complete-button, lesson-navigation, mobile-lesson-tabs |
| `Profile` | 9 | profile-header, completed-courses, credential-cards |
| `Settings` | 26 | account-settings, appearance-settings, language-settings, linked-accounts |
| `Certificates` | 14 | certificate-display, certificate-share |

## Existing Namespace Additions

| Namespace | New keys | Components |
|-----------|----------|------------|
| `Courses` | 13 | course-filters, course-header, enroll-button, module-list |
| `Dashboard` | 18 | active-courses, activity-feed, recent-achievements, streak-calendar, xp-level-card |
| `Leaderboard` | 10 | leaderboard-filters, leaderboard-table, user-rank-card |

## Key Inventory

### Courses (13 new)

| Key | en |
|-----|-----|
| `modules` | Modules |
| `totalTime` | Total Time |
| `searchPlaceholder` | Search courses... |
| `difficulty` | Difficulty |
| `track` | Track |
| `all` | All |
| `courseCompleted` | Course Completed |
| `viewCredential` | View Credential |
| `continueLearning` | Continue Learning |
| `signingTransaction` | Signing transaction... |
| `enrollNow` | Enroll Now |
| `moduleLabel` | Module {n} |
| `lessonsProgress` | {completed} of {total} lessons |

### Dashboard (18 new)

| Key | en |
|-----|-----|
| `noActiveCourses` | No active courses |
| `enrollPrompt` | Enroll in a course to start learning |
| `browseCourses` | Browse Courses |
| `nextLesson` | Next: {title} |
| `continue` | Continue |
| `noActivityYet` | No activity yet. Start a lesson to begin! |
| `achievements` | Achievements |
| `achievementsEarned` | {earned}/{total} earned |
| `locked` | Locked |
| `dayStreak` | day streak |
| `longest` | Longest: |
| `weekWarrior` | Week Warrior |
| `monthlyMaster` | Monthly Master |
| `centuryScholar` | Century Scholar |
| `progressToLevel` | Progress to Level {level} |
| `xpToNextLevel` | {xp} XP to next level ({total} XP) |
| `less` | Less |
| `more` | More |

### Leaderboard (10 new)

| Key | en |
|-----|-----|
| `thisWeek` | This Week |
| `thisMonth` | This Month |
| `allTime` | All Time |
| `timeframe` | Timeframe |
| `level` | Level |
| `streak` | Streak |
| `you` | You |
| `yourRanking` | Your Ranking |
| `topPercent` | Top {n}% |
| `ofTotal` | of {total} |

### Lessons (11 new)

| Key | en |
|-----|-----|
| `lessonOf` | Lesson {current} of {total} |
| `previous` | Previous |
| `next` | Next |
| `content` | Content |
| `code` | Code |
| `markAsComplete` | Mark as Complete |
| `completing` | Completing... |
| `lessonCompleted` | Lesson completed |
| `allLessonsCompleted` | All lessons completed! |
| `finalizing` | Finalizing... |
| `claimCourseCredential` | Claim Course Credential |

### Profile (9 new)

| Key | en |
|-----|-----|
| `completedCourses` | Completed Courses |
| `coursesCompletedCount` | {n} completed |
| `noCompletedCoursesYet` | No completed courses yet |
| `credentials` | Credentials |
| `credentialsEarnedCount` | {n} earned |
| `earnFirstCredential` | Complete a course to earn your first credential |
| `joined` | Joined {date} |
| `you` | You |
| `level` | Level {n} |

### Settings (26 new)

| Key | en |
|-----|-----|
| `account` | Account |
| `manageProfile` | Manage your profile information. |
| `profilePhoto` | Profile Photo |
| `uploadAvatar` | Click to upload a new avatar |
| `displayName` | Display Name |
| `displayNamePlaceholder` | Enter your display name |
| `email` | Email |
| `emailPlaceholder` | your@email.com |
| `saved` | Saved! |
| `saveChanges` | Save Changes |
| `changesSaved` | Changes saved successfully |
| `appearance` | Appearance |
| `appearanceDescription` | Customize how Superteam Academy looks for you. |
| `theme` | Theme |
| `light` | Light |
| `dark` | Dark |
| `system` | System |
| `accentColor` | Accent Color |
| `language` | Language |
| `languageDescription` | Choose the language for the Superteam Academy interface. Course content availability may vary. |
| `linkedAccounts` | Linked Accounts |
| `linkedAccountsDescription` | Connect external accounts for sign-in and on-chain features. |
| `solanaWallet` | Solana Wallet |
| `connected` | Connected |
| `unlink` | Unlink |
| `connect` | Connect |

### Certificates (14 new)

| Key | en |
|-----|-----|
| `certificateOfCompletion` | Certificate of Completion |
| `awardedTo` | Awarded to |
| `completedOn` | Completed on {date} |
| `totalXp` | Total XP |
| `level` | Level |
| `lessons` | Lessons |
| `shareCredential` | Share Credential |
| `shareOnTwitter` | Share on X (Twitter) |
| `postAchievement` | Post your achievement |
| `shareOnLinkedIn` | Share on LinkedIn |
| `addToProfile` | Add to your profile |
| `copied` | Copied! |
| `copyLink` | Copy Link |
| `downloadImage` | Download Image |

## ICU Parameterized Strings (10 keys)

| Namespace | Key | Template | Usage |
|-----------|-----|----------|-------|
| Courses | `moduleLabel` | `Module {n}` | `t("moduleLabel", { n: index + 1 })` |
| Courses | `lessonsProgress` | `{completed} of {total} lessons` | `t("lessonsProgress", { completed, total })` |
| Dashboard | `nextLesson` | `Next: {title}` | `t("nextLesson", { title })` |
| Dashboard | `achievementsEarned` | `{earned}/{total} earned` | `t("achievementsEarned", { earned, total })` |
| Dashboard | `progressToLevel` | `Progress to Level {level}` | `t("progressToLevel", { level })` |
| Dashboard | `xpToNextLevel` | `{xp} XP to next level ({total} XP)` | `t("xpToNextLevel", { xp, total })` |
| Leaderboard | `topPercent` | `Top {n}%` | `t("topPercent", { n: percentile })` |
| Leaderboard | `ofTotal` | `of {total}` | `t("ofTotal", { total })` |
| Profile | `joined` | `Joined {date}` | `t("joined", { date: joinDate })` |
| Certificates | `completedOn` | `Completed on {date}` | `t("completedOn", { date })` |

## Component Assignment

### Components needing `"use client"` added (8)

- `course-header.tsx`
- `activity-feed.tsx`
- `recent-achievements.tsx`
- `user-rank-card.tsx`
- `profile-header.tsx`
- `completed-courses.tsx`
- `credential-cards.tsx`
- `certificate-display.tsx`

### Module-level consts moving inside component (3)

- `MILESTONES` in `streak-calendar.tsx`
- `TIMEFRAMES` in `leaderboard-filters.tsx`
- `THEME_OPTIONS` in `appearance-settings.tsx`

### Excluded components

- `progress-bar.tsx` — no hard-coded strings
- `badge-showcase.tsx` — renders dynamic badge names from data
- `skill-radar.tsx` — chart with no translatable strings

## Files Modified

- 3 message files: `en.json`, `pt-BR.json`, `es.json`
- 24 component files (listed in Component Assignment)
- Total: 27 files

## Verification

```bash
cd app
npx tsc --noEmit   # 0 errors
npm run build       # 0 errors, 26 routes
```

Manual: switch locale to pt-BR and es, visit all student pages — every label renders in the selected locale.
