# User Stories — Home Mobile Navigation

**Intent:** Give visitors on a phone a way to move around the home page once the hero has scrolled away, with contacting the owners always one tap away.

**Decided with Thomas (Session 15):**
- A compact bar, sticky, always visible on phones
- A permanent « Contact » shortcut in it
- The same behaviour as the `/stay` bar (Bolt 14), without numbers or progress line

---

## US-1 — Always have a menu on a phone

**As a** visitor on a phone, anywhere on the home page,
**I want** a menu that stays at the top of the screen,
**So that** I can reach another section without scrolling back up.

**Acceptance criteria:**
- Up to 768px wide, a bar sits right under the hero and stays at the top of the screen once it gets there, down to the end of the page
- Its « Menu » button opens the list of the four sections: L'appartement, Équipements, Activités, Contact
- Choosing a section closes the list, scrolls to it with its heading visible below the bar, and moves focus to it
- The list closes like the `/stay` one: tapping the button again, tapping outside, Escape (focus back on the button), tabbing out
- From 769px up, nothing changes: no bar

---

## US-2 — Know which section I am in

**As a** visitor scrolling on a phone,
**I want** the bar to name the section I am reading,
**So that** I keep my bearings on a long page.

**Acceptance criteria:**
- The button reads the current section's name, « Équipements ▾ », and « Menu ▾ » above the first section
- Screen readers hear « Menu, section actuelle : Équipements »
- In the open list, the current section is highlighted and marked `aria-current="location"`

---

## US-3 — Contact the owners in one tap

**As a** potential renter who has seen enough,
**I want** a « Contact » button that is always on screen,
**So that** I can get in touch the moment I decide.

**Acceptance criteria:**
- A « Contact » link sits on the right of the bar, at all times
- It goes to the Contact section, heading visible below the bar, focus on the section
- It is at least 44px tall

---

## US-4 — Reach my stay and my language from anywhere

**As a** guest, or a visitor who prefers English,
**I want** « Mon séjour » and the language flags in the menu,
**So that** I don't have to scroll back to the hero to find them.

**Acceptance criteria:**
- Below a separator, the open list shows « Mon séjour » (for guests only, as in the navbar) and the two language flags
- They behave exactly as in the navbar: « Mon séjour » opens `/stay`; a flag opens the same page in the other language, keeping the section
