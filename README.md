# Sunblock: Shield Your Base From Sun Storms!


Keep a Mars crew safe through eight real Sun storms. Time a shield, protect the
shared battery, and choose between science, rest, and charging.

**[Play Sunblock](https://iamstrix.github.io/storm-waves/)** ·
[Short gameplay demo](https://iamstrix.github.io/storm-waves/demo.html) ·
[Source code](https://github.com/iamstrix/storm-waves)

Copy-ready text for the eight submission fields is in [SUBMISSION.md](SUBMISSION.md).

A browser mission trainer designed for ages 7–12, for the **Build a Junior
Astronaut Mission Trainer** challenge. No account, installation, backend, or
runtime AI service is required. All game assets and the saved storm data are local.

## Play

- **Hold** the big shield button or **Space** as the wave reaches Red Base.
- Let go after the wave. Raising the shield too early wastes power.
- Between storms, choose **Do science**, **Rest the crew**, or **Charge up**.
- Read the next forecast before choosing. Keep all three meters above zero.
- **Tap mode** lets you tap once to raise the shield and again to lower it.
- Cards pause the mission. **Space** cycles choices; **Enter** confirms a focused
  button. Tab navigation also works. **Escape** pauses or resumes an active wave.
- Pip's short lines type onto the screen with soft character blips. Tap a line
  to reveal it immediately. No computer speech or borrowed Undertale audio is used.
- Original ambient music and sound effects start after your first interaction.
  The speaker button mutes everything; the preference stays on this device.

First play includes Pip's four-panel story and a safe practice wave. Practice
does not count toward the eight storms, and supplies reset afterward. Replay
selects a different window of storms. Story and tap preferences are saved on
this device when browser storage is available; no personal data is collected.

## Run locally

Use a current Node.js installation:

```sh
npm start
```

Open **http://127.0.0.1:5371/**. No dependency installation or build step is needed.
Alternatively, serve this directory with any static HTTP server. Opening
`index.html` directly as a `file:` URL will not load the data in some browsers.

```sh
npm test
```

The tests cover data selection, all 18 mission windows, protection and resource
rules, tutorial resets, exhaustion, pause, and early mission endings.

## Rules and accessibility

Power starts at 70; Air and Crew start at 100. Solar panels restore 4 power per
second while the shield is off. A raised shield uses 10 per second. Science
costs 15 power for one star; rest costs 15 to restore 20 crew; charging adds 25.
Meters cap at 100. A depleted shield stays down until the input is released.

**Air needs a 20-power reserve.** Below 20, Air drops by 8 per second; at or above
20 it recovers by 2. This is an intentional correction to the original design:
an exact-zero threshold combined with instant solar charging made the Air
tradeoff ineffective. The reserve is explained in the story, tutorial, meter
warning, forecasts, and science notes. These are fictional game units.

Storm speed maps to a 4–9-second warning. Angular half-width maps to a
2–4.5-second wave. Unshielded crew damage is 12 per second for a modeled direct
encounter and 6 for a glancing one. All tuning is in `src/config.js`.

Large buttons, text and numeric meter labels, scrolling phone cards, visible
keyboard focus, screen-reader text, hold/tap input, reduced-motion support, and
automatic pause on tab switching are included. Pausing always releases the shield.
Reduced motion reveals complete dialogue immediately and freezes ambient motion.

## NASA data and scientific limits

Source: **NASA Community Coordinated Modeling Center (CCMC), DONKI**
([Space Weather Database Of Notifications, Knowledge, Information](https://ccmc.gsfc.nasa.gov/tools/DONKI/)).
The archive was **saved 15 Nov 2026**. It is not live and is not a forecast service.

`data/cme-snapshot.json` contains 177 processed CME records from the supplied
September–November 2026 archive. The game uses the 25 records with Mars arrival
model predictions, dated 24 September–9 November. Each mission selects eight
consecutive records from one of 18 possible windows. The original event links
are available on the report card. Dates are displayed in UTC.

- Storm dates, analyzed speeds and angular half-widths come from DONKI records.
- Mars arrival times and direct/glancing classifications are **WSA–ENLIL model
  predictions**, not measurements of an actual impact at Mars. Some source
  events have several model runs; the supplied snapshot retains one prediction.
- Model travel times of days are compressed into seconds. Width affects wave
  duration for gameplay; it is not a physical calculation of local exposure.
- The powered shield is imaginary. Real astronauts use shielding and sheltered
  parts of a spacecraft or habitat against radiation from energetic particles.
  See [NASA's crew systems overview](https://www.nasa.gov/reference/crew-systems/).
- Air, Power and Crew are teaching meters, not physical units or safety advice.

The archived values were compared with the supplied raw DONKI export during
development. No NASA logo or endorsement is used.

## Implementation and AI assistance

Original vanilla JavaScript ES modules, Canvas 2D artwork, HTML and CSS. Web Audio
synthesizes an original ambient chord progression, bell melody, character blips,
shield hum, wave sounds, and feedback chimes. No framework, analytics, external
art pack, or runtime API dependency. The sun's corona, dust, reflections, robot
expressions, and shield impacts are drawn procedurally.

The locally bundled **Nunito** font is by the Nunito Project Authors, distributed
under the SIL Open Font License in `assets/Nunito-OFL.txt`.
[Font source](https://github.com/google/fonts/tree/main/ofl/nunito).

**Claude Code assisted the concept, design specification and visual mockups.
OpenAI Codex assisted implementation, original procedural artwork,
audio composition, documentation and testing.** AI was used during development; the delivered game
does not call an AI model. NASA remains the source of the archived storm data.
People publishing or submitting this project should review the work and disclose
this assistance in the submission form.

Original game code, artwork and audio: MIT license. Nunito retains its OFL license.
NASA source data is credited above.
The public repository is restricted to this game folder; private idea-bank files,
planning references, research outputs and raw exports are excluded.
