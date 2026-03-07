# Mahara Kids System Flow - Complete Explanation

## 1. HIERARCHICAL EXAM STRUCTURE

### Three-Level Hierarchy:
```
Categories (Level 1)
  └── Tests (Level 2)
      └── Steps/Activities (Level 3)
```

**Categories:**
- Top-level grouping (e.g., "Sound Recognition", "Pronunciation")
- Each category has multiple tests
- Categories are unlocked by default (or based on child's progress)

**Tests:**
- Second-level grouping within a category
- Each test focuses on a specific skill
- Tests may be locked/unlocked based on prerequisites
- Each test contains multiple sequential steps

**Steps/Activities:**
- Individual interactive screens within a test
- Must be completed in strict order
- Cannot skip or go back
- Each step is a full-screen experience
- Types: Listen & Watch, Listen & Choose, Matching, Sequence, Audio Association

---

## 2. NAVIGATION FLOW

### Entry Point → Home Screen
```
Home Screen
  └── Exams Section (Horizontal Slider)
      └── Category Card Tap
          └── Category Page (All Tests in Category)
              └── Test Card Tap
                  └── Test Flow (Linear Steps)
                      └── Final Evaluation Screen
```

### Detailed Flow:

**Step 1: Home Screen**
- User sees dedicated "Exams" section
- Horizontal slider with category cards
- Each card shows: icon, name, soft color
- Smooth swipe, snap-to-card behavior
- RTL/LTR compatible

**Step 2: Category Selection**
- User taps a category card
- Navigate to full-page category view
- Shows all tests in that category
- Tests displayed as large, clear cards
- Locked tests visually indicated (grayed out, lock icon)

**Step 3: Test Entry**
- User taps an unlocked test
- Immediately enters test flow
- No intermediate screens
- Full-screen takeover

**Step 4: Test Flow (Linear)**
- First step appears immediately
- Auto-play audio if exists
- Child completes interaction
- System automatically advances to next step
- No back button
- No navigation bar
- No skip option
- Progress indicator (optional, subtle)

**Step 5: Final Evaluation**
- After last step completes
- Show evaluation screen
- Based on all steps completed
- Visual feedback only (stars, emojis, illustrations)
- Encouraging message
- Option to return to home or try another test

---

## 3. EVALUATION CALCULATION

### How It Works:

**During Test:**
- Each step records interaction result
- No instant feedback per step (to avoid pressure)
- System tracks:
  - Correct interactions
  - Incorrect interactions
  - Completion status
  - Time taken (optional)

**After Test Completion:**
- Calculate total score:
  - Count correct steps
  - Count total steps
  - Calculate percentage
- Determine evaluation level:
  - Excellent (90-100%)
  - Good (70-89%)
  - Needs Practice (50-69%)
  - Keep Trying (<50%)

**Final Evaluation Display:**
- Show result using:
  - Stars (1-5 stars)
  - Emojis (🎉, ⭐, 💪, 🌟)
  - Friendly illustrations
  - Encouraging text
- NO numeric scores visible to child
- NO harsh failure messages
- Always encouraging

---

## 4. KEY DESIGN PRINCIPLES

### Full-Screen Test Steps:
- Each step occupies entire screen
- No distractions
- Focus on ONE action
- Large, clear elements
- Minimal text

### Linear Progression:
- Strictly sequential
- Cannot go back
- Cannot skip
- Must complete to continue
- System controls navigation

### Child-Friendly Feedback:
- Visual only (no numbers)
- Encouraging always
- Soft animations
- Calm colors
- Friendly illustrations

### Global Design:
- Universal color palette
- High contrast
- Large tap targets (48px+)
- Comfortable spacing
- RTL/LTR support
- Cultural neutrality

---

## 5. STATE MANAGEMENT

### Test State:
```dart
{
  testId: string,
  currentStepIndex: number,
  steps: [
    {
      id: string,
      type: string,
      completed: boolean,
      result: boolean | null,
      timestamp: number
    }
  ],
  startTime: number,
  endTime: number | null,
  finalScore: number | null
}
```

### Navigation State:
- Home → Category → Test → Steps → Results
- No back navigation during test
- Can return to home from results

---

## 6. USER EXPERIENCE FLOW

### Happy Path:
1. Open app → Home screen
2. Swipe to find exam category
3. Tap category → See tests
4. Tap test → Enter test flow
5. Complete steps sequentially
6. See final evaluation
7. Return to home or try another test

### Error Handling:
- If test fails to load → Show friendly message
- If step fails → Auto-retry or skip to next
- If audio fails → Show visual alternative
- Always maintain flow continuity

---

## 7. DIFFERENCES FROM QUIZ APPS

### NOT a Quiz App:
- ❌ No instant right/wrong feedback
- ❌ No score per question
- ❌ No time pressure
- ❌ No competitive elements

### IS a Learning Journey:
- ✅ Sequential exploration
- ✅ Focus on completion
- ✅ Encouraging throughout
- ✅ Visual evaluation only
- ✅ Child-paced interaction

---

## 8. IMPLEMENTATION CHECKLIST

- [ ] Home screen with horizontal category slider
- [ ] Category page with test cards
- [ ] Full-screen test step screens
- [ ] Linear navigation (no back button)
- [ ] Progress tracking (silent, not shown to child)
- [ ] Final evaluation screen
- [ ] Splash screen
- [ ] Global design system
- [ ] RTL/LTR support
- [ ] Accessibility features
