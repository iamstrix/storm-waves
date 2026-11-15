# Sunblock — submission copy

Final text for the Space Apps project form.

## Project Name

Sunblock - Shield Your Base From Sun Storms!

## Summary

Sunblock: shield your base from sun storms! Sunblock is a one-button browser game for ages 7–12, built for the Junior Astronaut Mission Trainer challenge. Players run Red Base, a Mars outpost, through eight solar storms taken from real NASA DONKI records from September to November 2026. Each storm's real speed sets how much warning players get, and its real width sets how long it hits. The shield and the air machine share one battery. Shield too long and the air runs low; spend too much on science and the next storm may catch the base short. Between storms, players read a forecast of the next real storm, then pick one job: do science for a star, rest the crew, or charge the battery. A robot guide, a safe practice storm, tap mode and keyboard play help young players learn. It runs in any browser with no account, install or live connection, and every storm is dated and credited to NASA inside the game.

## Project Demonstration

https://iamstrix.github.io/storm-waves/demo.html

## Project

https://iamstrix.github.io/storm-waves/

## Project Details

Sunblock is our entry for Build a Junior Astronaut Mission Trainer. Play it at https://iamstrix.github.io/storm-waves/ (source: https://github.com/iamstrix/storm-waves).

How it works: three astronauts live at Red Base on Mars, and solar storms (coronal mass ejections) race toward the base. The player holds one big button, or the space bar, to raise a shield while each storm passes. The shield and the air machine run on the same battery, and air needs at least 20 power, so shielding longer than needed puts the crew's air at risk. Between storms, the player reads a forecast of the next storm and picks one job: do science (earns a star, costs power), rest the crew (heals the crew, costs power), or charge up (gains power, earns no star). The goal is to get through 8 storms with as many stars as possible.

Real NASA data: every storm is a real event from NASA's DONKI database, saved on 15 Nov 2026 and labeled as an archive, not live. The game uses the 25 storms from 24 Sep to 9 Nov 2026 that have a modeled Mars arrival. A faster real storm gives less warning, a wider real storm hits for longer, and DONKI's model decides whether a storm hits Mars head-on or brushes past. Each run plays 8 storms in a row from a different starting point, so replays differ. The final report links each storm to its NASA record.

For young players: a robot guide named Pip tells the story in four short panels, and a practice storm can't hurt the crew. Cards pause the game and text is large. There's tap mode, keyboard play and reduced-motion support. No account, install or tracking is needed.

Built with vanilla JavaScript, HTML, CSS, Canvas 2D and Web Audio, hosted on GitHub Pages. The art is drawn in code and the music is generated in code. Automated tests cover the rules and all 18 possible storm runs.

Honest science: Mars arrival times are model predictions, not measured impacts, and days are squeezed into seconds. The powered shield is imaginary; real crews use shielding and sheltered areas. Meter values are game units. The game says all of this in its data and credits panel.

## Use of Super Intelligence (SI)

Claude Code (Anthropic) helped research the challenge and NASA data, suggested ways to combine the team's earlier project ideas into a concept for this challenge, and wrote the design spec and visual mockups. The team chose the concept and directed the design. OpenAI Codex wrote the game code, code-drawn art, code-generated music and sound, tests and docs. The demo video has a visible SI watermark, and the source comments, README and in-game credits disclose SI use. The finished game does not call any AI. The storm values are NASA records, not AI output.

## NASA Data

| Link Text | Link Url |
|---|---|
| NASA CCMC DONKI – Space Weather Database Of Notifications, Knowledge, Information | https://ccmc.gsfc.nasa.gov/tools/DONKI/ |
| NASA Open APIs – DONKI CME data (archive saved 15 Nov 2026) | https://api.nasa.gov/ |
| NASA Crew Systems reference (radiation shelters) | https://www.nasa.gov/reference/crew-systems/ |

## Space Agency Partner & Other Data

| Link Text | Link Url |
|---|---|
| Sunblock source code (MIT) | https://github.com/iamstrix/storm-waves |
| Nunito font, SIL Open Font License 1.1 | https://github.com/google/fonts/tree/main/ofl/nunito |
| Claude Code (Anthropic), design and spec assistance | https://claude.com/claude-code |
| OpenAI Codex, implementation assistance | https://openai.com/codex/ |
| Playwright, automated tests and demo capture | https://playwright.dev/ |
| GitHub Pages, hosting | https://pages.github.com/ |
