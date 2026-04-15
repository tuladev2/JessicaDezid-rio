# Design System Document: The Editorial Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Atelier"**

This design system moves away from the clinical, sterile grids of traditional medical sites and toward the world of high-end editorial fashion and boutique hospitality. The goal is to position 'Jessica Dezidério' not just as a practitioner, but as a curator of beauty. 

We break the "template" look through **Intentional Asymmetry**. Hero sections should feature off-center typography paired with overlapping imagery. We treat the digital canvas as a series of physical layers—fine paper, frosted glass, and silk—to create a sense of tactile luxury. The experience should feel like flipping through a premium thick-stock magazine: airy, authoritative, and calming.

---

## 2. Colors & Tonal Depth

Our palette is rooted in the sophistication of 'Dusty Rose' (`primary`) and 'Champagne' (`secondary`), anchored by 'Gold' (`tertiary`) accents.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They create visual noise that disrupts the "welcoming" vibe. Instead:
- **Background Transitions:** Define boundaries by shifting from `surface` to `surface-container-low`.
- **Negative Space:** Use generous padding (64px+) to define the start of a new content block.

### Surface Hierarchy & Nesting
Treat the UI as a layered stack. Do not place elements randomly; follow the logic of material thickness:
1.  **Base Layer:** `surface` (#fdf8f5) - The expansive canvas.
2.  **Sectional Layer:** `surface-container-low` (#f8f3f0) - Used for wide-width background blocks to group related content.
3.  **Interactive Layer:** `surface-container-lowest` (#ffffff) - Reserved for cards or floating elements to provide the "cleanest" focal point.

### Signature Textures: Glass & Gradients
To avoid a flat, "digital" feel:
- **The Champagne Glow:** Use a linear gradient from `primary_container` (#d2a0a0) at 0% to `surface` (#fdf8f5) at 100% for large hero backgrounds.
- **Glassmorphism:** For floating navigation bars or appointment modals, use `surface` at 80% opacity with a `backdrop-filter: blur(12px)`.

---

## 3. Typography: The Graceful Dialogue

The contrast between the serif and sans-serif is the heartbeat of this system.

*   **Display & Headlines (Noto Serif):** This is our "Editorial Voice." Use `display-lg` for impactful brand statements. It should feel graceful and "high-fashion."
*   **Titles & Body (Manrope):** This is our "Functional Voice." Manrope provides a clean, modern counter-balance that ensures medical information remains legible and trustworthy.

**Design Note:** Always pair a `headline-lg` (Serif) with a `body-md` (Sans) to create a clear hierarchy. Never use the Serif for long-form body text; it is reserved for "Moments of Beauty."

---

## 4. Elevation & Depth

We achieve depth through **Tonal Layering** rather than structural lines or heavy shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container` background. The subtle shift from #ffffff to #f2edea creates a natural "lift."
*   **Ambient Shadows:** If a shadow is required (e.g., a floating CTA button), use:
    *   `color: rgba(28, 27, 26, 0.06)` (a tint of our `on-surface`)
    *   `blur: 32px`
    *   `y-offset: 16px`
*   **The "Ghost Border":** For input fields or cards where definition is critical for accessibility, use `outline-variant` (#d4c4b7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons (The Statement Piece)
*   **Primary:** Background `primary` (#7d5454), Text `on-primary` (#ffffff). Use `rounded-full` (9999px) for a soft, approachable feel.
*   **Secondary:** Background `secondary_container` (#f4dfcb), Text `on-secondary_container`. Use for secondary actions like "Learn More."
*   **Tertiary (The "Gold" Action):** Text `tertiary` (#775a19) with a 1px underline in `tertiary_fixed_dim`. No background container.

### Input Fields
*   **Style:** Minimalist. Only a bottom border using `outline-variant` (#d4c4b7) at 40% opacity. 
*   **State:** On focus, the border transitions to `primary` (#7d5454) with a subtle `primary_container` glow.

### Cards & Lists (The Editorial Grid)
*   **Forbid Dividers:** Do not use horizontal lines to separate list items. Use 24px of vertical whitespace and a hover state that shifts the background to `surface-container-high`.
*   **Image Treatment:** All images should use `rounded-lg` (1rem). When possible, overlap a `display-sm` heading over the edge of an image to create an "asymmetric" layout.

### Specialized Component: The "Ritual" Card
For aesthetic procedures, use a card with `surface-container-lowest` background, a 48px `primary_container` icon circle, and `headline-sm` typography. This elevates a simple service to a premium experience.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace White Space:** If a section feels "busy," double the padding. This is a clinic of luxury; space equals premium.
*   **Use Subtle Animation:** Fade-in-up transitions (duration: 600ms, easing: cubic-bezier(0.22, 1, 0.36, 1)) should be applied to all headline elements.
*   **Mix Alignments:** Try left-aligning a headline while right-aligning the supporting body text to create a custom, designed feel.

### Don't:
*   **Don't use Pure Black:** Always use `on-background` (#1c1b1a) for text. Pure black is too harsh for the "Dusty Rose" palette.
*   **Don't use Box Shadows on everything:** Let the colors do the work. Only 5% of elements should have a shadow.
*   **Don't crowd images:** Allow images of the clinic or Jessica to "breathe" with at least 40px of margin from any text.
