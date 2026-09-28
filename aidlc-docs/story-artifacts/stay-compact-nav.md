# User Stories — Stay Compact Navigation

**Intent:** On phones and tablets, replace the sideways-scrolling row of chips with a compact bar that says where the guest is and opens the full list of sections.

**Decided with Thomas (Session 14):**
- A compact bar at the top, « 5/9 · Activités », that opens the full list
- A progress line under it
- The chips stay on wide screens, where all nine fit

---

## US-1 — See where I am on a phone

**As a** guest reading the stay page on a phone,
**I want** the bar to name the section I am in and its position,
**So that** I know where I am without hunting through a row of chips.

**Acceptance criteria:**
- Below the width where the chips fit, the sticky bar is one button: « 5/9 · Activités » and an arrow
- Above the first section, it reads « Sommaire »
- Screen readers hear « Section 5 sur 9 : Activités », not « 5 slash 9 »
- The button follows the section being read, like the chips do

---

## US-2 — Reach any section in two taps

**As a** guest on a phone,
**I want** to open the list of all sections and pick one,
**So that** I jump anywhere without swiping.

**Acceptance criteria:**
- Tapping the bar opens the list of the nine numbered sections under it, the current one marked
- Choosing a section closes the list, scrolls to the section and moves focus to it (as in Bolt 13)
- The list is scrollable on its own when it is taller than the screen
- Every entry is at least 44px tall

---

## US-3 — Close the list without choosing

**As a** guest who opened the list by mistake,
**I want** it to close the way I expect,
**So that** it never stays in my way.

**Acceptance criteria:**
- Tapping the bar again, or anywhere outside the list, closes it
- Escape closes it and puts focus back on the bar
- Tabbing out of the list closes it
- The button tells screen readers whether the list is open (`aria-expanded`)

---

## US-4 — See my progress at a glance

**As a** guest scrolling on a phone,
**I want** a line under the bar that fills as I go down the page,
**So that** I see how far I am without reading.

**Acceptance criteria:**
- The line's filled part is (position ÷ 9): about half at « 5/9 », full at « 9/9 », empty above the first section
- It is hidden from screen readers: the button text already says the same
- It moves smoothly only for visitors who have not asked for reduced motion
