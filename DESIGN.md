# Ingenieur Labs: design reference

This file says what the site looks like, how it moves and why. It also records
where each decision came from, so the next change can follow the same reasoning.
`AGENTS.md` covers the user, the workflow, the code map and the commands. If the
two disagree, the hard rules in `AGENTS.md` and the user's latest word win; fix
this file to match.

Last checked against the code and the reference sites on 2026-10-06. When you
change a design value (a token, a timing, a shader constant), update it here in
the same commit.

Contents:

1. The idea
2. Inspiration and lineage: Vercel, distrategy, plastic.design, and the CD
3. Principles
4. Tokens: colour, type, space, shape
5. Page structure and components
6. The field
7. Motion
8. Voice and copy
9. The mark
10. Responsive, accessibility and fallbacks
11. What was rejected, and the lesson
12. Extending the design
13. Do and don't

---

## 1. The idea

Ingenieur Labs is a venture studio: it turns ambitious ideas into working
software, and working software into companies. The company's private concept is
a tesseract, "making things that seem beyond us concrete." The tesseract is
never drawn. It shows up in two ways:

- **In language.** "Some ideas arrive with one dimension too many."
- **As resolution.** An idea is rough and low-fidelity; a company is sharp and
  full colour. The site draws that literally: the same image goes from 1-bit
  dots to 8 colours to fine dither to smooth colour. The hero plays it in under
  two seconds as the name resolves. The journey plays it slowly, one step per
  stage, and then the image opens up to become the page.

The image itself is **light on the silver side of a CD**: a mirror-silver surface
with one soft fold, green at the heart of the fold, and thin spectral streaks
where the light splits. The CD is the light, never the object. No disc is drawn.

The feel the user asked for: **"a Ferrari, not a car."** Sleek, fast, exact,
expensive, without showing anything literal. **Minimal-maximal**: a black,
strict, Vercel-quiet page carrying two or three maximal moments (the wordmark,
the statement, the journey window opening) that each mean something.

## 2. Inspiration and lineage

Three websites and one object. Vercel sets the design language. The two Plastic
sites set scroll, typography and gradient behaviour. The CD sets the colour and
the interaction.

Reference sites change (Vercel redesigns its Ship page every year). The notes
below describe what each showed on 2026-10-06. Look again before borrowing
something new, and borrow the idea, never the pixels.

### Vercel: the main inspiration (design language)

Vercel's system is called **Geist**: the Geist Sans and Geist Mono typefaces,
a strict grey scale, hairlines instead of boxes, pill buttons, and huge type
with tight tracking. The direction the user gave is "Vercel, pushed further."

The user remembers a Vercel "hero style" site with an image of a person on it,
but could not find it again. The likeliest match is `vercel.com/ship`: it is
already on the user's list of references, and its "Featured speakers" section
shows a large portrait. That match is unconfirmed, so the other candidates stay
listed:

| Page | What it shows | What it shares with this site |
| --- | --- | --- |
| `vercel.com/font` | The Geist type specimen. A giant "Geist." on a light page over a hairline grid, with `+` crosshairs at the grid corners and small black mono tags for the vertical metrics (710, 530, 0, −150). | The hairline frame with crosshairs where sections meet; the mono readout beside the journey window; giant type as the hero image; the full stop after a display word. |
| `vercel.com/ship` (likeliest) | Ship 26 (San Francisco, Oct 15). Black page, `#ededed` text, display set in Geist Pixel at 96px with about −0.06em tracking, uppercase mono nav, a pixel-art pyramid, a notched pixel CTA, hairline FAQ rows. "Featured speakers": a hairline-bordered list of names and roles in uppercase mono, with the current speaker lit and the rest dim, beside a large black-and-white portrait of that speaker. Further down, a strip of black-and-white event photos. Already listed in `AGENTS.md` as a reference the user likes. | Pure black base and `#ededed` text; mono labels; a pixel look as an aesthetic, which this site uses as its 1-bit "idea" stage; the current item lit and the rest dim, as in the statement and the step drum. The speakers section is the closest model for a founders section. |
| `vercel.com` (home) | Light page, "Agentic Infrastructure" in Geist at 64px with −0.06em tracking, a filled dark pill CTA next to an outlined pill, a black triangle with a soft glow. | The button pair: filled pill (green here) next to a ghost pill. |
| `vercel.com/geist/introduction` | The Geist design system docs. | Source for Geist conventions when in doubt. |

What this site takes from Vercel:

- **Geist and Geist Mono**, and nothing else.
- **The grey scale.** `--text #ededed` and `--muted #8f8f8f` are the same greys
  Vercel uses for dark text and secondary text.
- **Hairlines and crosshairs.** The page sits in a 1400px frame with 1px side
  rails; each new section starts with a 1px rule and a small `+` at each end.
- **Tracking that tightens with size**, from −0.01em on buttons to −0.055em on
  the step names.
- **Pill buttons**: a filled pill for the main action and a ghost pill beside
  it.
- **Mono for machine-ish text**: step indices, the resolution readout, the
  build hash, the scroll cue.
- **A sticky header**: translucent black, 12px blur, and a hairline once you
  scroll.

How it pushes past Vercel: Vercel is greyscale and calm. This site adds one
electric accent (`#00ff88`), sets the name edge to edge as a living surface,
and makes scrolling change the state of the page, not just reveal it.

### distrategy.plastic.design: scroll, typography, gradients

An event microsite by the studio Plastic for Danosa ("Building together.",
London). Observed on 2026-10-06:

- **Type.** Suisse Intl at weight 500, display sizes of 180–228px, tracking
  about −0.02 to −0.03em, very large numerals. Body is weight 300–400. One
  family, used at extreme size contrast.
- **Gradient as light.** The hero is a heavily blurred blob of cobalt to sky blue
  on light grey, with giant black type over it. The colour is a soft light
  source behind the type, not a fill inside a shape.
- **Words lit one at a time.** A stack of words ("Distribution. Insights.
  Collaboration. … — Future.") fades from white to near-black, so emphasis is a
  gradient of light. In the pinned manifesto, one sentence at a time turns white
  inside a paragraph that is otherwise almost black.
- **A rolling counter.** Beside the manifesto, huge numerals (01–08) roll
  vertically as you scroll, like a reel.
- **Emphasis by colour, not weight.** Cards begin with "You" in full black and
  continue in grey, separated by hairline column rules.
- **Folded material.** Macro photos of folded orange sheet and a blue roll.

Where it shows here:

- The **statement** holds in the middle of the screen while a light reads it
  word by word, from `--dim #2e2e2e` to white, ending on a green "ship". This is
  the manifesto's lit sentence, with the light moving per word.
- The **journey steps** sit on a drum that rolls vertically and clicks from one
  step to the next. This is the rolling counter, made into a click wheel.
- The **field** is a soft light behind and inside the type, and its shape is a
  fold of material.
- The **hero lede** starts with one white sentence and continues in muted grey,
  as the cards set "You" in black and the rest in grey.

### plastic.design: scroll, typography, studio voice

The Plastic studio's own site ("We design brands for a world in motion").
Observed on 2026-10-06:

- **Type.** Neue Montreal, mostly light (300) uppercase display at about 90–95px,
  centred hero; a giant "Let's talk.↘" (weight 400, about 140px) as the closer;
  small uppercase labels.
- **The page changes state as you scroll.** Sections switch from white to
  black, and the header reads over both.
- **Current item lit.** In the services list the current item ("01. Strategy.")
  is full strength and the following items are faint, the same idea as
  distrategy's lit sentence.
- **Type as image.** The client list is a justified wall of huge uppercase
  names. Work and stories run in horizontal carousels with a "01 / 12" counter
  and outlined arrow pills.
- **A contact moment at the end** and a persistent "Contact us." pill.
- **Studio voice**: short declarative sentences that end in full stops.

Where it shows here: the studio framing and voice ("From idea to company.",
"Rough is fine. Real is required."); the page ending in one large contact
moment (the window opens into the page and the contact panel appears on it);
only the current step showing at full strength.

What was deliberately not taken: white sections (the page stays black), light
uppercase display (Geist 500–700 in sentence case reads more engineered), and
marquees.

### The CD: where the gradient comes from

The gradient is modelled on light reflecting off the silver side of a CD. The
user's own reference for the colours was a CD under light. How a real disc
behaves, and where each behaviour lives in `src/field/field.frag`:

| On a real CD | In the field |
| --- | --- |
| The data side is a mirror: a thin metal layer under clear plastic, so most of it reads as plain silver. | `SILVER` → `WHITE` is the base. It is brightest just above the crest, where the light catches. |
| A highlight sits where the light source reflects, and it slides when you tilt the disc. | The `sheen` sits on the crest and follows the pointer sideways (`along = q.x - tilt.x * 1.5`). |
| The spiral track (about 1.6 µm apart) works as a diffraction grating, so white light leaves it split into a spectrum: rainbow bands that fan out from the centre. | A rainbow fan from a hub far off the surface (`hub = (-2.6, -2.2)`), so only a streak crosses the field and the centre is never in view. |
| Which colour reaches your eye depends on the angle, so tilting slides and swings the bands. | Tilt turns the fan (`aim`) and rolls its hues. |
| Turning the disc quickly in the hand makes the colours flicker. | `uSwing` (pointer speed) rolls every hue and flares the streaks, then settles. |
| A thin rainbow edge where light grazes a curve. | The `fringe`: a thin spectrum on the silver side of the crest. |
| The colours seen in the user's CD photo. | The spectral ramp: Klein blue `#4100F5` → aquamarine `#9BF0E1` → green `#00FF88` → citric `#CDF564` → tangerine `#FF4632`. |

The **shape** comes from a different reference: the user's mesh gradient, a
bright ribbon arching over a rounded fold with one crisp crest. The CD gives
the light and colour; the mesh gradient gives the form.

The CD stays abstract. A literal disc (v2's black CD) was rejected; so was a
visible centre or spiral (early v3). If the hub of the fan ever comes into
view, it is wrong.

## 3. Principles

Each rule records a decision the user made, usually after rejecting something.

1. **Black page, one accent.** The page is pure `#000`. `#00ff88` is the only UI
   colour. The CD colours live inside the field and nowhere else.
2. **One surface, shown twice.** The field appears in the wordmark and in the
   journey window. It never covers the page as a background (v1's mistake).
3. **Type is flat.** No 3D, bevel, chrome, glow or shadow on type. The field is
   the only material on the page.
4. **Motion is a state change.** Every scroll animation changes what something
   is: the resolution climbs, the light reads, the step clicks, the window opens.
   No generic fade-ups, no bounce, no overshoot.
5. **Everything moves toward the pointer, and nothing is centred on it.** The
   pointer tilts a surface; it does not drag a spotlight or a swirl.
6. **Less colour as motion increases.** Once the swing flare arrived, the user's
   favourite colour mix became "a bit too much colour", and they chose the
   modest one. Re-check colour after any interaction change.
7. **Move along the spectrum, not across it.** RGB-blending green into tangerine
   goes olive and murky. Interpolate along the ramp.
8. **No black inside the field.** It is silver, green and spectrum. Black only
   appears in the 1-bit dither stage, where it is the page showing through.
9. **Quiet everywhere else.** Most of the page is grey text on black, so the
   few maximal moments land.

## 4. Tokens

All tokens live in `:root` in `src/style.css`. The field's colours are constants
in `src/field/field.frag`.

### Colour: page and UI

| Token | Value | Use |
| --- | --- | --- |
| `--black` | `#000000` | Page, header (at 88% opacity with blur), contact panel, text on green. |
| `--white` | `#ffffff` | Headings, lit statement words, the hero lede's first sentence, hover text, the mark. |
| `--text` | `#ededed` | Body text. |
| `--muted` | `#8f8f8f` | Secondary text: lede, step text, nav, footer, labels. About 6.5:1 on black. |
| `--dim` | `#2e2e2e` | Statement words before the light reaches them. Repeated as `DIM` in `motion.ts`; keep the two in sync. |
| `--line` | `#1f1f1f` | Frame rails, section rules, the header's hairline, the footer rule. |
| `--line-strong` | `#333333` | Crosshairs, ghost button border, journey window outline, unlit progress bars. |
| `--green` | `#00ff88` | The accent: primary button, focus ring, selection, lit progress bars, "ship". |
| `--green-hover` | `#7dffc1` | Primary button hover. |
| `--green-soft` | `#64b977` | The "Scroll to develop" cue only: a quieter green for a hint. |
| (literal) | `#6b6b6b` | Ghost button border on hover. |

How much green: the main button, the progress bars, the focus ring and one word.
Never a green heading, a green background panel or green body text.

### Colour: the field

| Constant | Hex | Role |
| --- | --- | --- |
| `WHITE` | `#f6f8fa` | Brightest silver; light just above the crest. |
| `SILVER` | `#b3b9bf` | Silver away from the light. |
| `GREEN` | `#00ff88` | The heart of the fold. |
| `FOLD` | `#009e66` | Green in the fold's shadow, right under the crest. |
| `BLUE` | `#4100f5` | Klein blue; the fold opens into it on the left. Ramp 0. |
| `AQUA` | `#9bf0e1` | Aquamarine. Ramp 0.3. |
| `CITRIC` | `#cdf564` | Citric. Ramp 0.7. |
| `TANGERINE` | `#ff4632` | Tangerine; the fold opens into it on the right. Ramp 1. |

The ramp runs Klein blue (0) → aquamarine (0.3) → green (0.5) → citric (0.7) →
tangerine (1). The fold starts at green (0.5) and moves along the ramp toward the
side's colour as it deepens, scaled by `reach = 0.45`. `brand(i)` uses the same
eight colours as the palette for the 8-colour dither stage, in the order white,
silver, green, fold, citric, aqua, tangerine, blue.

`--cd` is a still CSS version of the field (silver, a sharp edge into deep green,
green, aquamarine, Klein blue at 152°). It is used without WebGL and as the
journey's background before the canvas paints.

### Type

Geist (variable, 100–900) and Geist Mono (400–600) from Google Fonts. The hero
wordmark is drawn into a canvas mask, so `main.ts` waits for Geist 700 before
drawing it (at most 2.5s).

| Token | Size | Used for | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- | --- |
| `--t-xs` | 13px | Mono labels: step index, readout, footer, scroll cue | 400 | 0 (cue: +0.04em, uppercase) | 1.6 |
| `--t-sm` | 15px | Buttons, brand name | 500 / 600 | −0.01em / −0.02em | |
| `--t-base` | 17px | Body | 400 | 0 | 1.6 |
| `--t-lg` | 19 → 24px | Hero lede, journey title, step text, contact text | 400 / 500 | −0.02em | 1.4 |
| `--t-xl` | 36 → 76px | Contact title | 600 | −0.045em | 1 |
| `--t-2xl` | 36 → 92px | Statement | 500 | −0.045em | 1.04 |
| `--t-3xl` | 52 → 152px | Step names (phone: 36 → 52px) | 600 | −0.055em | 0.92 |
| wordmark | full frame width | "ingenieur" | 700 | −0.05em | |

Rules:

- **Tracking tightens as size grows.** A new size goes between its neighbours.
- **Sentence case.** Uppercase only for the tiny mono cue. Display lines end in
  a full stop ("From idea to company.").
- **Emphasis by colour, not weight.** White against muted grey; green for one
  word at most.
- **Weights:** 400 body, 500 lede/statement/buttons, 600 headings, 700 only for
  the wordmark.
- **Measure:** the lede is at most 32rem, step text 24rem, statement 15em,
  contact title 13em.
- The hero `h1` is a canvas. Its text, "Ingenieur Labs", is in a visually hidden
  span.

### Space and layout

| Token | Value | Use |
| --- | --- | --- |
| `--edge` | 0 → 40px (2.5vw) | Gap between the viewport and the frame rails. |
| `--pad` | 20 → 40px (3vw) | Inner padding of every section and the header. |
| `--header` | 64px | Header height; the journey pins below it. |
| frame width | `min(1400px, 100% - 2 × --edge)` | `.frame`, the header's inner row, the footer. |

- Everything sits in `.frame`: 1px `--line` rails on both sides.
- A `<section>` placed after another inside `main.frame` automatically gets a
  1px top rule and 13px `+` crosshairs on the rails
  (`.frame > section + section`). Phones hide the crosshairs.
- Vertical space is generous and fluid: the statement has 7–15rem above and
  below; the hero leaves 5–13rem between the intro and the wordmark.
- The journey is a grid: copy on the left, the square window on the right
  (`--window: min(56vh, 38vw)`). On phones it stacks title, window, steps,
  progress.

### Shape, depth, borders

- **Pills for buttons only** (`border-radius: 999px`; 44px tall, 34px small).
- **Everything else is square**: the journey window, the contact panel,
  progress bars.
- **No shadows, no glows, no cards.** Depth comes from hairlines, black panels
  over the field, and the header's blur.
- **Borders are 1px**, in `--line` or `--line-strong`.

## 5. Page structure and components

The page tells the studio's story once, in order. The structure is part of the
design.

```
header   brand mark + "Ingenieur Labs" · Approach · Contact · [Get in touch]
hero     lede + two buttons, then "ingenieur" edge to edge      idea → company in 1.8s
statement  three phrases, read by a light, ending on "ship"     what we believe
journey  pinned, 620vh: Idea → Prototype → Product → Company    idea → company, slowly
         the window opens into the page; the contact panel appears on it
footer   © · email · GitHub · build hash
```

**Header.** Sticky, 64px, black at 88% with a 12px blur. Its hairline appears
once the page has scrolled 8px. Left: the white mark (26px) and "Ingenieur Labs"
(15px, 600). Right: nav links in muted grey (white on hover), then a small green
pill. On phones the nav is hidden and the pill stays.

**Buttons.** `.button--green`: green fill, black text, lighter green on hover.
`.button--ghost`: transparent with a `--line-strong` border; the border and text
brighten on hover. All transitions are 160ms ease. Pair them green first, ghost
second.

**Hero.** The intro row has the lede on the left (first sentence white, the rest
muted) and the buttons on the right, aligned to the bottom. Below it,
"ingenieur" spans the frame as a canvas with the field drawn inside the letters.
On phones the wordmark moves above the intro and runs nearly edge to edge.

**Statement.** One paragraph in three phrases, `--t-2xl`, 500. With motion on, it
pins at the centre of the visible area while a light reads it.

**Journey ("From idea to company.").** A pinned scene:

- *Title* in muted `--t-lg`, with a green-soft mono cue, "Scroll to develop ↓",
  whose arrow bobs gently.
- *Steps*: index in mono, name in `--t-3xl`, one line of text. They sit on a
  drum and only the current one shows.
- *Progress*: four 2px bars, lit green up to the current step.
- *Viewer*: a square window outlined in `--line-strong`, with the field showing
  through it, and a mono readout below ("Resolution 14 px · Colour 1-bit"). The
  viewer is exactly the window's width; the readout wraps instead of widening it.
- *Contact panel* (`#contact`): black, square, centred over the opened field.
  "Have an idea that feels out of reach?", "Tell us about it.", a green pill with
  the email address and a ghost GitHub pill.

**Footer.** Inside the frame: copyright, email and GitHub links, and
"Build <hash>" in mono, from `__COMMIT__`.

## 6. The field

One fragment shader (`src/field/field.frag`) drawn by `src/field/field.ts` into
any 2D mask: the letters of the wordmark, or the full-bleed rectangle behind the
journey that is clipped to the window.

### Shape

- A silver surface with **one soft fold** leaning up to the right (the space is
  rotated about 18°).
- The **crest** is one broad hump plus a smaller harmonic. Above it is silver;
  below it is the fold. `crest` offset `-0.14` sets how much is silver.
- The crest is the **only sharp edge** (a ±0.01 smoothstep, like a fold in
  silk). Everything else is soft.
- A slow, low noise warp (`* 0.22`) makes it read as fabric, not a drawn curve.
- It drifts very slowly on its own (time factors of 0.04–0.11).

### Colour logic

1. Silver above the crest, brightest just over it, with a white sheen on the
   crest that follows the pointer. Far from the crest the silver picks up a
   trace of the ramp colour (`* 0.35 * reach`).
2. The fold, under the crest: `FOLD` dark green at the very edge, then `GREEN`,
   then, with depth, along the ramp toward Klein blue (left) or tangerine
   (right), scaled by `reach = 0.45`. The deepest part lifts slightly toward
   white, so it never goes dark.
3. The rainbow fan crosses both. It tints the silver and is screened over the
   fold, so the colours never turn grey.
4. A thin spectral fringe rides the crest on the silver side.
5. Without dither, ±0.5/255 of noise stops the long silver gradients from
   banding.

### Interaction

`main.ts` turns the pointer into two values and the shader reads both.

| Input | Value | Effect |
| --- | --- | --- |
| Pointer position across the viewport | `uTilt`, −1 to 1, eased 9% per frame | Rolls the crest sideways and lifts it; slides the colours (`side`); moves the sheen, fan and fringe toward the pointer. |
| How far the tilt trails the pointer (its speed) | `uSwing`, eased 15% per frame | Rolls every hue (`roll * 0.6`); flares the fan and fringe (up to ×2.2), then settles. |
| No mouse (touch, or before the first move) | — | The disc turns slowly by itself, and scrolling tips it. |
| Reduced motion | — | One fixed tilt, a still frame (time fixed at 4). |

Only a mouse or pen tilts the disc; a finger scrolls the page.

### Fidelity stages

`src/fidelity.ts` defines four stages, shared by the hero intro and the journey.
Between stages the cell size shrinks geometrically, like an image loading.

| Stage | Step | Cell | Colours | Look |
| --- | --- | --- | --- | --- |
| 0 | Idea | 14px | 1-bit | Silver dots on black where the light is strongest; the fold stays mostly dark. |
| 1 | Prototype | 8px | 8 | Ordered Bayer dither between the two nearest of the eight brand colours. |
| 2 | Product | 3px | 27 | Each channel quantised, so the dither stays true to the colour. |
| 3 | Company | native | full | Smooth. |

In dithered stages the mask is sampled per cell too, so the letters' edges turn
to pixels along with the colour. A cell of 1 CSS px means smooth on any screen.
Do not multiply it by the pixel ratio (see `AGENTS.md`, gotchas).

### Scale

- Wordmark: `width / 2.6` per unit, so one fold crosses the whole word.
- Journey: `side × 0.6` inside the window, growing to `max(w, h) × 0.5` as the
  window opens, so opening the window also opens the fold.
- The journey canvas renders at a pixel ratio of 1 (it can cover the screen);
  the wordmark renders at up to 2.
- The render loop only runs while a field is on screen.

The tuning table (which constant controls what, and its current value) is in
`AGENTS.md` under "Where to tune the field."

## 7. Motion

GSAP 3 with ScrollTrigger and SplitText. All of it is in `src/motion.ts`.

### Vocabulary

| Ease | Means | Used for |
| --- | --- | --- |
| `steps(n)` | Resolution climbing in visible jumps, like an image loading | Hero fidelity (`steps(9)`, 1.8s), journey fidelity (`steps(6)`, 0.9s) |
| `expo.out` | Arrives quickly and settles; for things appearing | Hero lede lines, hero buttons, header, contact panel |
| `power3.out` | Quick and straight into place; a click | Drum click-over (0.55s), the window's open value (0.6s) |
| `power2.out` | A small push against the click | The drum leaning (0.3s) |
| `power2.inOut` | A deliberate opening | The window's clip opening into the page |
| `none` (scrubbed) | Tied directly to scrolling | The statement's reading light |
| CSS `160ms ease` | Hover feedback | Buttons, links |

`--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`) is defined in CSS but unused;
it matches `expo.out` if CSS motion is ever needed.

Never: bounce, elastic, back (overshoot), spring wobble, parallax for its own
sake, or a fade-up on every section.

### The moments

**Hero intro (on load).** The page is held for at most 3s until the script
runs. Then, on one timeline: the wordmark resolves from 1-bit to smooth (from
0.15s, 1.8s, `steps(9)`); the lede's lines rise out of masks (from 0.5s, 1.2s,
0.08s stagger); the buttons rise 14px and fade in (from 0.75s); the header fades
in (from 0.85s).

**Statement hold (scroll).** The paragraph pins at the middle of the area below
the header for `HOLD = 1.1` screens of scrolling. A light reads it word by word:
each word goes from `#2e2e2e` to white over `WORD = 0.6`, with the next starting
`WORD_GAP = 0.14` later and a `PHRASE_GAP = 0.5` beat between phrases. "ship"
lights green. It stays fully lit for a moment before moving on. It holds only
on the way down: once the reader is past it, the pin is removed without moving
anything on screen, and it re-arms out of sight. "Contact" skips it.

**Journey (scroll, 620vh).** Progress `p` runs 0 to 1 through the pinned scene:

| `p` | What happens |
| --- | --- |
| 0 – 0.60 | Four steps, 0.15 each. Within a step the drum leans only `LEAN = 0.1` of the way to the next; at the threshold it clicks over in one eased turn. Each click also steps the window's fidelity and updates the readout and progress bars. |
| 0.64 – 0.82 | The window opens until the field fills the screen. The copy fades out in the first quarter of the opening, before the colour reaches it. |
| 0.80 | The contact panel rises 24px and fades in over the field (0.8s). |
| 0.92 | Where the "Contact" links jump to. |

The drum: steps sit `DRUM_ANGLE = 16°` apart on a cylinder whose pitch is the
tallest step plus 32px. A step fades as it rolls away and the list is masked at
its top and bottom 12%, so at rest only the current step shows and no reel is
visible.

**Small things.** The header's hairline appears after 8px of scroll (200ms). The
scroll cue's arrow bobs on a 1.8s loop; it is the only looping CSS animation.

### Reduced motion

Every state is kept and every tween is removed: the hero shows at full
resolution, the statement does not pin, the steps and the window change at
once, the field is a still frame, and the cue's arrow stops.

## 8. Voice and copy

- **A studio speaking as "we".** Never "two friends".
- **Short, declarative sentences, with full stops**, including in headings.
- **Parallel pairs.** "We turn ambitious ideas into working software, and
  working software into companies." "Rough is fine. Real is required." "Too big
  to hold, too early to explain."
- **Plain, concrete words.** "A working version in weeks, not a pitch deck."
  No hype words ("revolutionary", "cutting-edge", "synergy").
- **The tesseract stays in the language only**: "one dimension too many", "a
  shape you can ship", "an idea that feels out of reach".
- **British spelling** in visible copy ("Colour", "8 colours").
- **Contact:** `ingenieur.labs@gmail.com` and the GitHub organization
  `KC-Ventures`.

## 9. The mark

Three pointy-top hexagons stacked like a club suit, with a chevron stem, traced
from the user's `assets/logo_reference.png`. It is not a tesseract and may
appear on the site.

| File | Use |
| --- | --- |
| Inline in `index.html` (`.brand__mark`) | The header: white through `currentColor`, 26px tall. |
| `public/brand/mark-white.svg` | The mark on dark backgrounds. |
| `public/brand/mark-green.svg` | `#00ff88`, for accent uses. |
| `public/brand/mark-refracted.svg` | A still frame of the field (silver, a rainbow fringe on one crisp crest, green fold). For avatars and social images. |
| `public/favicon.svg` | Green mark on a black rounded tile, heavier stroke (36), so it reads at 16px and on light tab bars. |
| `public/brand/png/`, `public/apple-touch-icon.png` | Square PNGs, mark centred at 70% of the side; `avatar-*-1024.png` sit on black. Regenerate with `node scripts/export-brand.mjs`. |

The rounded favicon tile is the only rounded rectangle in the brand. It is an
app icon, not a UI pattern.

## 10. Responsive, accessibility and fallbacks

**Phones (≤ 760px).** The nav hides and the header keeps its button; the
crosshairs hide; the wordmark moves above the intro and runs nearly edge to
edge; the journey stacks title, window (`min(68vw, 28vh)`), steps and
progress; the readout always takes two lines so the window never moves; step
names drop to 36–52px.

**High-density screens.** The user's screen is 2×. Check every visual change
at `"dpr": 2`; a dither bug once showed only there.

**Accessibility.**

- Focus: a 2px green outline with a 3px offset. Selection: green with black text.
- A skip link to `#main`. Decorative canvases and the readout are
  `aria-hidden`; the hero's `h1` text is visually hidden.
- The contact panel is `inert` until it shows.
- Contrast: `--muted` on black is about 6.5:1. `--dim` is only a transient
  state of the statement; without the script the paragraph is white.
- Reduced motion is honoured everywhere (see Motion).

**Fallbacks.**

- No WebGL (`.no-webgl`): the wordmark is set in Geist 700 with the `--cd`
  gradient clipped to the text, and the window shows `--cd`.
- No JavaScript: the journey is not pinned and reads as a normal section with
  all four steps and the contact panel visible. The intro is never hidden for
  more than 3s.

## 11. What was rejected, and the lesson

| Version | What it was | Why it was rejected | Lesson |
| --- | --- | --- | --- |
| v1 | Deep-green lacquer shader over the whole page, studio-light reflections, Archivo Expanded. | Murky greens, shader everywhere, weird motion. | Pure black, vivid green, the shader in specific places only. |
| v2 | Vercel-style layout; dark-chrome CD shader on a 3D-bevelled wordmark; a black CD at the end; small spheres for the process. | 3D text, gradient not vivid enough, a random disc, light moving away from the cursor, generic scroll animation, no "wow". | Flat type, never a literal disc, light moves toward the pointer, scroll animation must mean something. |
| Early v3 | Highly saturated conic gradient with a visible spiral centre following the cursor. | Too pale, then too vivid; the spiral centre distracted. | No visible hub. Offer colour as 2–3 live variants. |
| v3 black-and-green | Restrained black, forest, moss and sage field whose bands tilted with the pointer. | "Scratch black"; the interaction felt weird. | A silver base; the "tilt the disc" interaction. |
| v3 colourful mix | A more colourful mix of the current field. | Once the swing flare arrived, too much colour. | More motion, less colour (`reach = 0.45`). |

## 12. Extending the design

### Checklist for anything new

- [ ] It sits inside `main.frame` and inherits the rails, rule and crosshairs.
- [ ] Its type comes from the scale, with tracking that fits its size.
- [ ] It uses only the existing greys and green. A new colour needs the user's OK.
- [ ] Green appears at most once or twice in the new section.
- [ ] If it moves, the motion changes its state and uses the motion vocabulary.
      If it can't say what the motion means, it doesn't move.
- [ ] No shadows, cards, rounded panels or glows.
- [ ] The field is not shown a third time without asking; two appearances keep
      it special.
- [ ] Reduced motion, no-WebGL, a 390px phone and `dpr: 2` all checked.
- [ ] If it is above the journey, ScrollTrigger positions shift; re-check the
      statement hold and the journey.
- [ ] Built as 2–3 variants on a temporary key switch, with screenshots
      (see `AGENTS.md`).

### Where the references point next

These are directions to propose to the user, not decisions. Ask before building
any of them.

- **Founders section** (the next task in `AGENTS.md`). Two patterns from the
  references fit. One is Vercel Ship's "Featured speakers": a hairline-bordered
  list of names and roles in mono, the current person lit and the others dim,
  beside one large black-and-white portrait. The other is a hairline-divided
  row of columns (distrategy's "You …" cards, Vercel's grid): name in white at
  `--t-xl`, role in mono `--t-xs`, a line in muted `--t-lg`. If there are
  photos, they could go through the fidelity stages, appearing as 1-bit dots
  and resolving to full colour, which ties people to the "idea to company"
  story. Keep it a studio: the section introduces the people behind it,
  without casting the company as "two friends".
- **Projects or portfolio** (no content yet). plastic.design's numbered list with
  the current item lit, or its wordwall of names, fits this language better than
  image cards. Each project could carry a mono readout of its stage (Idea,
  Prototype, Product, Company), reusing the journey's vocabulary.
- **Social preview image** (`og:image` is missing). A black 1200×630 with the
  refracted mark or a still of the field inside "ingenieur", made like the
  brand PNGs in `scripts/export-brand.mjs`.
- **Hero spacing on tall screens.** There is empty space between the intro and
  the word. Vercel's font page fills the same space with grid lines and metric
  tags; a faint hairline grid or a mono metric beside the word would fit, as
  long as it stays quieter than the word.

### Questions to ask when unsure

- Would Vercel ship it? If not, it is probably too loud or too decorated.
- Does it push one notch further than Vercel, in type size, in contrast, or in
  what the scroll does?
- How would distrategy stage it on scroll: what is lit, what is dim, what holds?
- Is the CD the light here, or has it turned into an object?

## 13. Do and don't

| Do | Don't |
| --- | --- |
| Pure black page; `#00ff88` as the one accent | Dark greens, gradients on the page, a second accent |
| Silver, green and the CD spectrum inside the field | Black inside the field; RGB blends across the spectrum |
| Flat Geist type, large and tightly tracked | 3D, bevel, chrome, glow or outlined text |
| Hairlines, crosshairs, square panels, pill buttons | Shadows, cards, rounded panels |
| Motion that changes state, eased without overshoot | Bounce, generic fade-ups, motion with no meaning |
| Effects moving toward the pointer | Anything centred on the cursor; a visible spiral or hub |
| The CD as light | A drawn disc, a car, or a tesseract |
| A studio's voice in short sentences | "Two friends", hype words |
| 2–3 live variants for colour and feel | Guessing one option and shipping it |
