# User Stories — Stay Navigation

**Intent:** Keep the guest oriented on the long `/stay` page: always show where they are and let them jump to another section from anywhere.

**Decided with Thomas (Session 13):**
- A sticky chip bar, the same on every screen size
- Numbered sections, in trip order
- A back-to-top button

---

## US-1 — Know where I am

**As a** guest scrolling through the stay page,
**I want** to see which section I am reading,
**So that** I don't get lost in the middle of a long page.

**Acceptance criteria:**
- Once the guest scrolls past the banner, the section bar stays at the top of the screen
- The chip of the section on screen is highlighted, and changes as the guest scrolls
- The highlight is announced to screen readers (`aria-current="location"`), not shown by colour alone
- On a phone, the highlighted chip is scrolled into view within the bar

---

## US-2 — Jump to another section from anywhere

**As a** guest in the middle of the page,
**I want** to reach another section without scrolling back to the top,
**So that** I find what I need quickly.

**Acceptance criteria:**
- The bar lists the nine sections, and each chip links to its section
- After a jump, the section heading is fully visible below the bar, and focus moves to the section (Bolt 10's handling)
- An element that receives keyboard focus is never hidden under the bar (WCAG 2.4.11)
- On a phone, the chips scroll sideways; the page itself never scrolls sideways

---

## US-3 — See the order of the stay

**As a** guest,
**I want** the sections numbered in trip order,
**So that** I see where I am in the stay, from before arrival to after leaving.

**Acceptance criteria:**
- Each chip and each section heading shows its number (1 to 9)
- The number comes from the section's position, not from the data, so reordering the sections keeps the numbering right
- Screen readers read the heading name without the number (the bar is an ordered list, which already gives the position)

---

## US-4 — Get back to the top

**As a** guest on a phone, deep in the page,
**I want** a quick way back to the top,
**So that** I reach the site navbar (home page, « Mon séjour », language) without a long scroll.

**Acceptance criteria:**
- A « Haut de page » button appears once the banner is out of view, and hides when it is back
- It scrolls to the top and moves focus to the « Votre séjour » heading
- It is keyboard reachable, has a visible focus ring and a 44 × 44 px target
