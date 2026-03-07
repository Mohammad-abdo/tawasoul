# Mahara Kids Exam & Activity Mechanism

## Scope
- This document defines the exact exam/activity behavior implemented in this backend.
- There are no scores, grades, or percentages.
- Completion is binary only.
- Progression is linear and forced.

## Content Creation Hierarchy
1. Category
2. Skill Group
3. Activity

## Database Schema (Tables + Fields)

### activity_categories
- id (uuid, PK)
- name (string)
- createdAt (datetime)
- updatedAt (datetime)

### skill_groups
- id (uuid, PK)
- categoryId (uuid, FK -> activity_categories.id)
- name (string)
- createdAt (datetime)
- updatedAt (datetime)

### activities
- id (uuid, PK)
- skillGroupId (uuid, FK -> skill_groups.id)
- type (enum ActivityType)
- levelOrder (int, sequential within skill group)
- correctImageId (uuid, FK -> activity_images.id, nullable)
- createdAt (datetime)
- updatedAt (datetime)

### activity_images
- id (uuid, PK)
- activityId (uuid, FK -> activities.id)
- assetPath (string, filename only)
- sortOrder (int)
- createdAt (datetime)

### activity_audios
- id (uuid, PK)
- activityId (uuid, FK -> activities.id)
- assetPath (string, filename only)
- sortOrder (int)
- createdAt (datetime)

### activity_match_pairs
- id (uuid, PK)
- activityId (uuid, FK -> activities.id)
- imageId (uuid, FK -> activity_images.id)
- audioId (uuid, FK -> activity_audios.id)

### activity_sequence_items
- id (uuid, PK)
- activityId (uuid, FK -> activities.id)
- imageId (uuid, FK -> activity_images.id)
- position (int)

### child_activity_progress
- id (uuid, PK)
- childId (uuid, FK -> children.id)
- activityId (uuid, FK -> activities.id)
- completed (boolean)
- completedAt (datetime, nullable)
- createdAt (datetime)
- updatedAt (datetime)

## Activity Type Enum
```
LISTEN_WATCH
LISTEN_CHOOSE_IMAGE
MATCHING
SEQUENCE_ORDER
AUDIO_ASSOCIATION
```

## Completion Logic Per Activity Type

### LISTEN_WATCH
- One image and one audio.
- Audio auto-plays on load.
- Completion occurs when first playback ends.
- No validation, no attempts counter.

### LISTEN_CHOOSE_IMAGE
- One audio auto-plays.
- 2–3 images shown.
- One image marked correct.
- Wrong selection: replay audio and retry.
- Correct selection: mark completed.
- No attempts counter, no failure state.

### MATCHING
- Multiple images and multiple audios.
- Child matches sound to image.
- Incorrect match resets only that pair.
- Completion only when all pairs are matched correctly.

### SEQUENCE_ORDER
- Images shown in random order.
- Correct order predefined.
- Wrong order resets the sequence.
- Correct order marks completed.

### AUDIO_ASSOCIATION
- One image and one long audio.
- Child listens only.
- Completion occurs when audio finishes once.
- No speech recognition, no validation.

## Progression Logic (Forced Linear)
- Child always opens the last uncompleted activity.
- Activities unlock strictly in order.
- Completing activity N unlocks N+1 only.
- Replaying completed activities does not affect progress.
- Progress is stored as:
  - completed = true
  - completedAt timestamp

## Unlocking Algorithm (Pseudocode)
```
activities = all activities ordered by:
  category.createdAt ASC,
  skillGroup.createdAt ASC,
  activity.levelOrder ASC,
  activity.createdAt ASC

completedIds = all child_activity_progress where childId = X and completed = true

currentActivity = first activity where activity.id not in completedIds
```

## API Flow (User Side)

### Fetch Current Activity
- GET `/api/user/mahara/activities/current?childId=...`
- Returns the last uncompleted activity with assets only.

### Submit Interaction
- POST `/api/user/mahara/activities/submit`
- Body includes:
  - childId
  - activityId
  - event (for LISTEN_WATCH / AUDIO_ASSOCIATION)
  - selectedImageId (for LISTEN_CHOOSE_IMAGE)
  - matches[] (for MATCHING)
  - sequence[] (for SEQUENCE_ORDER)
- Backend validates interaction against stored logic.

### Mark Completion
- On valid completion, backend sets:
  - completed = true
  - completedAt = now

### Load Next Activity
- Backend returns next activity after completion.
- If none remain, returns null.

## Admin Content Creation

### Categories
- Create/update/delete categories.
- Categories are only used for ordering and grouping.

### Skill Groups
- Create/update/delete skill groups under a category.

### Activities (Strict Requirements)
- Activity type is locked after creation.
- Level order is required and sequential within a skill group.
- Assets are required:
  - Audio is mandatory for every activity.
  - Images required depending on type.
- Correct logic is required when applicable:
  - Correct image for LISTEN_CHOOSE_IMAGE.
  - Matching pairs for MATCHING.
  - Ordered sequence for SEQUENCE_ORDER.

## Constraints (Enforced)
- No scores, grades, or percentages.
- No attempts counter.
- No difficulty or time limits.
- No activity list or category navigation for children.
- Audio files are uploaded manually by admin.
- No AI voices, no text-to-speech.
- No analytics, no reports.
