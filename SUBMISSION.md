# Storm Waves — submission copy

The eight sections below follow the supplied 2026 project-submission guide.
Review the SI disclosure and your team details before copying them into the form.

## 1. Project Name

Storm Waves

## 2. High-Level Project Summary

Storm Waves is a one-button browser mission trainer for ages 7–12. Players protect
a Mars outpost through eight solar storms drawn from archived NASA DONKI records.
The shield and air machine share one battery: protecting too early wastes power,
while spending too much on science can leave too little for the next wave. A robot
guide, safe practice round, next-storm forecast, and three simple choices turn
resource budgeting into something children can try, observe, and improve. No
account, installation, or live API connection is required.

## 3. Link to Project Demo

https://iamstrix.github.io/storm-waves/demo.html

A screen-recorded video under 30 seconds. The visible SI disclosure identifies
the assisted game code and visuals. No person appears in the demo.

## 4. Link to Final Project

Play: https://iamstrix.github.io/storm-waves/

Source and instructions: https://github.com/iamstrix/storm-waves

## 5. Detailed Project Description

**Challenge: Build a Junior Astronaut Mission Trainer.**

At Red Base, three astronauts depend on a shared battery. Players hold a shield
button as a solar wave passes, then choose a science job, crew rest, or charging.
Science earns a star but consumes power. Rest repairs crew health and also costs
power. Charging earns no star, so it uses one of the mission's eight research
opportunities. When power falls below the air machine's reserve, Air begins to
drop. A successful mission balances protection, life support, and research.

The game uses real eruption dates, analyzed speeds, angular widths, and modeled
Mars encounter information from NASA DONKI. Faster recorded storms give less
warning; wider ones create longer game waves. The next forecast shows the
estimated shield cost and air reserve, so the choice between spending and
charging has an understandable consequence. Debriefs explain timing and power
use. A report links back to the eight NASA event records.

Pip, an original robot character, introduces the mission in four short panels.
A safe practice round teaches the meters and shield timing before supplies reset
for the real mission. Tap mode provides an alternative to holding; Space and
Enter support keyboard play. Cards pause time, short dialogue types with soft
letter sounds, and phone cards scroll when needed. Original ambient music and
effects bring the world to life. Replay selects a different eight-event window.

The prototype uses original JavaScript ES modules, Canvas 2D artwork, HTML and
CSS, hosted statically on GitHub Pages. Its archive loads locally with the game:
there are no accounts, analytics, runtime AI calls, or remote data dependencies.
Automated checks cover all 18 mission windows and desktop/phone browser flows.
The educational goal is to make resource tradeoffs tangible; learning outcomes
have not yet been measured with children.

**Scientific limits:** Mars arrival times are WSA–ENLIL model predictions, not
observed impacts or radiation doses. The powered shield is imaginary. Real
crews use shielding and sheltered areas. Time is compressed from days to
seconds, width is mapped to game duration, and meter values are fictional game
units. These distinctions appear inside the game and in the README.

## 6. Use of Super Intelligence (SI)

Yes. Claude Code assisted brainstorming/concept development, the design
specification, and visual mockups. OpenAI Codex assisted the original game
implementation, procedural Canvas artwork, original synthesized music and sound
effects, documentation, and automated tests. The music and effects are generated
by game code; no borrowed soundtrack or computer-spoken dialogue is used.
Development assistance is disclosed in source comments, the README, the game's
Science & Data panel, and the demo watermark. The delivered game does not call
an SI model. NASA storm values are supplied archived source records, not
SI-generated measurements. No NASA logos or other NASA branding were generated.

## 7. NASA Data

NASA CCMC's Space Weather Database Of Notifications, Knowledge, Information
(DONKI): https://ccmc.gsfc.nasa.gov/tools/DONKI/

Source API: https://api.nasa.gov/DONKI/CME?startDate=2026-09-17&endDate=2026-11-15

The archive was saved **15 November 2026** and is explicitly labeled archived,
not live. The processed snapshot contains 177 CME records. The game selects from
25 records with Mars encounter predictions, dated 24 September–9 November 2026.
There are 18 possible consecutive eight-event missions. It uses eruption start
time, analyzed speed, angular half-width, modeled Mars arrival time, direct/
glancing classification, and each event's NASA source link.

The supplied raw export was compared with the processed values during development.
Some events have multiple model runs; the snapshot retains one Mars prediction.
It should not be used as a live space-weather or astronaut-safety service.

NASA crew systems information informed the explanation of real radiation
shelters: https://www.nasa.gov/reference/crew-systems/

## 8. Space Agency Partner Data and Other References

No additional space-agency partner dataset was used. Original game code, writing,
and procedural visuals were developed for this project with the SI assistance
described above. No stock art, human likenesses, third-party game engine, or NASA
logo is included.

Development tools: vanilla JavaScript, HTML, CSS, browser Canvas 2D and Web Audio
APIs, Node.js's built-in HTTP server and test runner, Playwright/Chromium for
automated browser checks and screen capture, Git, and GitHub Pages hosting.
The delivered application has no third-party runtime library dependency.

Nunito font: the Nunito Project Authors, SIL Open Font License 1.1. Bundled
locally with its license. Source: https://github.com/google/fonts/tree/main/ofl/nunito

Original code and artwork use the MIT license; NASA source data remains
separately attributed. Source files, license, instructions, and scientific
limitations are in the public repository.
