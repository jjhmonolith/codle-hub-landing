(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const videoSource =
    window.CODLE_INTRO_VIDEO || document.currentScript?.dataset.characterVideo;
  const isReload =
    performance.getEntriesByType("navigation")[0]?.type === "reload";
  const replay = new URLSearchParams(location.search).get("intro") === "replay";
  if (
    reduced.matches ||
    innerWidth < 1400 ||
    innerHeight <= 800 ||
    (location.hash && !isReload && !replay)
  )
    return;
  // Refresh starts at the intro; ordinary section links still land directly.
  if (location.hash)
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
  history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  const root = document.documentElement;
  root.classList.add("hub-entry-pending");
  let overlay,
    video,
    ended = false;
  const animations = [],
    timers = [],
    protectedNodes = [];
  // Timeline values use authored milliseconds, scaled by overallSpeed.
  const timing = Object.freeze({
    overallSpeed: 1.69,
    introSpeed: 2,
    videoSpeed: 2.2,
    transition: 3550,
    handoff: 4650,
    finish: 5450,
    hold: 267,
    typingDelay: 0.25,
    safetyTimeout: 10000,
  });
  const { overallSpeed, introSpeed, videoSpeed } = timing;
  let transitionShift = 0;
  const scheduleTime = (delay) =>
    delay >= timing.transition ? delay + transitionShift : delay;
  const later = (fn, delay) =>
    timers.push(setTimeout(fn, scheduleTime(delay) / overallSpeed));
  const animate = (node, frames, options) => {
    const animation = node.animate(frames, {
      fill: "both",
      ...options,
      duration: options.duration / overallSpeed,
      delay: scheduleTime(options.delay || 0) / overallSpeed,
    });
    animations.push(animation);
    return animation;
  };
  function finish() {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    video?.pause();
    root.classList.remove("hub-entry-pending");
    history.scrollRestoration = "auto";
    const restoreFocus = overlay?.contains(document.activeElement);
    animations.forEach((animation) => animation.cancel());
    protectedNodes.forEach(({ node, inert }) => (node.inert = inert));
    overlay?.remove();
    removeEventListener("resize", finish);
    document.removeEventListener("keydown", escape);
    reduced.removeEventListener("change", finish);
    if (restoreFocus)
      document.querySelector(".hub-brand")?.focus({ preventScroll: true });
  }
  function escape(event) {
    if (event.key === "Escape") finish();
  }
  timers.push(setTimeout(finish, timing.safetyTimeout));
  document.addEventListener(
    "DOMContentLoaded",
    async () => {
      try {
        window.scrollTo(0, 0);
        const mascot = document.querySelector(".mascot-opening-art img");
        const logo = document.querySelector(".hub-brand img");
        await Promise.race([
          Promise.all([
            document.fonts.ready,
            mascot.decode().catch(() => {}),
            logo.decode().catch(() => {}),
          ]),
          new Promise((resolve) => timers.push(setTimeout(resolve, 700))),
        ]);
        if (ended) return;
        if (videoSource) {
          video = document.createElement("video");
          Object.assign(video, {
            muted: true,
            playsInline: true,
            preload: "auto",
            defaultPlaybackRate: videoSpeed,
            playbackRate: videoSpeed,
          });
          video.setAttribute("aria-hidden", "true");
          await new Promise((resolve) => {
            video.addEventListener("loadeddata", resolve, { once: true });
            video.addEventListener("error", resolve, { once: true });
            timers.push(setTimeout(resolve, 1600));
            video.src = videoSource;
            video.load();
          });
          if (ended) return;
        }
        const specs = [
          [".platform-service", "#eaf2ff", 3850, "left"],
          [".jitda-service", "#faf8f1", 3980, "bottom"],
          [".camp-service", "#263b52", 4110, "top"],
          [".cmass-service", "#f5f1fa", 4220, "right"],
          [".info-service", "#edf5f0", 4300, "right"],
        ];
        const targets = specs.map(([selector]) =>
          document.querySelector("#services " + selector),
        );
        const brand = document.querySelector(".brand-hub-card");
        if (targets.some((node) => !node) || !brand || !logo || !mascot)
          return finish();
        const width = innerWidth,
          height = innerHeight;
        // Measure all destinations before applying any animation.
        const boxes = targets.map((node) => node.getBoundingClientRect());
        const imageBox = mascot.getBoundingClientRect();
        const ratio =
          (mascot.naturalWidth || 1536) / (mascot.naturalHeight || 1024);
        const fitWidth = Math.min(imageBox.width, imageBox.height * ratio);
        // Match the painted image, including its responsive object-position.
        // The element box can be wider than the contained image itself.
        const [objectX, objectY] = getComputedStyle(mascot).objectPosition
          .split(" ").map((value) => parseFloat(value) / 100);
        const final = {
          x: imageBox.x + (imageBox.width - fitWidth) * objectX,
          y: imageBox.y + (imageBox.height - fitWidth / ratio) * objectY,
          w: fitWidth,
          h: fitWidth / ratio,
        };
        [
          ...document.querySelectorAll(
            "body > :not(script):not(style):not(link)",
          ),
        ].forEach((node) => {
          protectedNodes.push({ node, inert: node.inert });
          node.inert = true;
        });
        overlay = document.createElement("div");
        overlay.className = "mondrian-entry";
        overlay.setAttribute("role", "region");
        overlay.setAttribute("aria-label", "AI 교육을 찾다, 코들로 들어가다");
        document.body.append(overlay);
        overlay.addEventListener("wheel", (event) => event.preventDefault(), {
          passive: false,
        });
        const create = (tag, className) => {
          const node = document.createElement(tag);
          node.className = className;
          overlay.append(node);
          return node;
        };
        // One continuous image/video element travels to the final image rectangle.
        const character = create("div", "mondrian-entry__mascot");
        Object.assign(character.style, {
          left: final.x + "px",
          top: final.y + "px",
          width: final.w + "px",
          height: final.h + "px",
        });
        const still = mascot.cloneNode();
        still.removeAttribute("fetchpriority");
        still.alt = "";
        character.append(still);
        if (video && video.readyState >= 2) {
          character.append(video);
          try {
            video.playbackRate = videoSpeed;
            await video.play();
            if (ended) {
              video.pause();
              return;
            }
            video.classList.add("is-ready");
          } catch {}
        }
        // Hold the final video frame briefly before moving into the cards.
        transitionShift =
          (Number.isFinite(video?.duration)
            ? (video.duration / videoSpeed) * 1000 * overallSpeed
            : 2000 * overallSpeed) +
          timing.hold -
          timing.transition;
        const bigWidth = Math.min(width * 0.43, height * 0.77 * ratio, 690);
        const startX = width * 0.42,
          startY = (height - bigWidth / ratio) / 2 + height * 0.065;
        const from = `translate(${startX - final.x}px,${startY - final.y}px) scale(${bigWidth / final.w})`;
        animate(
          character,
          [{ transform: from }, { transform: "translate(0,0) scale(1)" }],
          {
            duration: 1100,
            delay: timing.transition,
            easing: "cubic-bezier(.72,0,.18,1)",
          },
        );
        animate(character, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 420,
          easing: "ease-out",
        });
        // The typed headline itself travels into its final position.
        const realTitle = brand.querySelector("h2");
        const titleBox = realTitle.getBoundingClientRect();
        const titleStyle = getComputedStyle(realTitle);
        const title = create("h2", "mondrian-entry__title");
        Object.assign(title.style, {
          left: titleBox.x + "px",
          top: titleBox.y + "px",
          width: titleBox.width + "px",
          fontFamily: titleStyle.fontFamily,
          fontSize: titleStyle.fontSize,
          fontWeight: titleStyle.fontWeight,
          lineHeight: titleStyle.lineHeight,
          letterSpacing: titleStyle.letterSpacing,
          color: titleStyle.color,
        });
        const typedGlyphs = [];
        ["우리 학교의 AI 교육, 어디서?", "코들에서!"].forEach(
          (text, lineIndex) => {
            const line = document.createElement("span");
            line.className =
              "mondrian-entry__title-line " +
              (lineIndex ? "entry-answer" : "entry-question");
            if (lineIndex) {
              Object.assign(line.style, {
                color: "#2877f5",
                fontSize: ".8em",
                fontWeight: "650",
                letterSpacing: "-.035em",
                marginTop: ".65em",
              });
            }
            title.append(line);
            // The question is static: preserve native spacing and kerning exactly
            // as in the destination card instead of splitting it into glyph boxes.
            if (!lineIndex) {
              line.textContent = text;
              return;
            }
            Array.from(text).forEach((letter) => {
              const glyph = document.createElement("span");
              glyph.textContent = letter;
              glyph.style.display = "inline-block";

              line.append(glyph);
              if (lineIndex) {
                typedGlyphs.push(glyph);
                glyph.style.opacity = "0";
              }
            });
          },
        );
        const headlineWidth = Math.max(
          ...Array.from(title.children, (line) => {
            line.style.width = "max-content";
            return line.getBoundingClientRect().width;
          }),
        );
        const titleScale = Math.min(2.1, (width * 0.38) / headlineWidth);
        const answerLine = title.querySelector(".entry-answer");
        // Anchor the reply beside the bird's face, not to a viewport percentage.
        const replyRight = startX + bigWidth * 0.16;
        const replyCenterY = startY + (bigWidth / ratio) * 0.38;
        const titleStartX =
          replyRight -
          (answerLine.offsetLeft + answerLine.offsetWidth) * titleScale;
        const titleStartY =
          replyCenterY -
          (answerLine.offsetTop + answerLine.offsetHeight / 2) * titleScale;
        const titleFrom = `translate(${titleStartX - titleBox.x}px,${titleStartY - titleBox.y}px) scale(${titleScale})`;
        animate(
          title,
          [
            { transform: titleFrom, fontWeight: titleStyle.fontWeight },
            {
              transform: "translate(0,0) scale(1)",
              fontWeight: titleStyle.fontWeight,
            },
          ],
          {
            duration: 1100,
            delay: timing.transition,
            easing: "cubic-bezier(.72,0,.18,1)",
          },
        );
        // Match the selected footage's short typing phrase, in source-video seconds.
        // Reading the media clock keeps text synchronized through buffering and rate changes.
        const typingBeats = [0.24, 0.5, 0.76, 1.02, 1.14].map(
          (beat) => beat + timing.typingDelay * overallSpeed * introSpeed,
        );
        const revealAt = (seconds) => {
          typedGlyphs.forEach((glyph, index) => {
            const visible = seconds >= typingBeats[index];
            glyph.style.opacity = visible ? "1" : "0";
          });
        };
        if (video?.classList.contains("is-ready")) {
          const syncTyping = () => {
            if (ended || !title.isConnected) return;
            revealAt(
              video.currentTime * ((overallSpeed * introSpeed) / videoSpeed),
            );
            if (
              video.currentTime * ((overallSpeed * introSpeed) / videoSpeed) <
              typingBeats[typingBeats.length - 1] + 0.05
            ) {
              if (video.requestVideoFrameCallback)
                video.requestVideoFrameCallback(syncTyping);
              else requestAnimationFrame(syncTyping);
            }
          };
          syncTyping();
        } else {
          typingBeats.forEach((beat) =>
            later(() => revealAt(beat), (beat / introSpeed) * 1000),
          );
          later(() => revealAt(2.9), (2.9 / introSpeed) * 1000);
        }
        // Let the studio surface arrive under the moving character gradually.
        const brandBox = brand.getBoundingClientRect();
        const brandStyle = getComputedStyle(brand);
        const studioSurface = create("div", "mondrian-entry__cell");
        Object.assign(studioSurface.style, {
          left: brandBox.x + "px",
          top: brandBox.y + "px",
          width: brandBox.width + "px",
          height: brandBox.height + "px",
          background: brandStyle.backgroundColor,
          borderRadius: brandStyle.borderRadius,
        });
        animate(studioSurface, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 1000,
          delay: timing.transition,
          easing: "ease-in-out",
        });
        animate(
          studioSurface,
          [{ visibility: "visible" }, { visibility: "hidden" }],
          { duration: 1, delay: timing.handoff, fill: "forwards" },
        );
        // Rectilinear panels grow into their actual final card bounds, never swapping layout.
        specs.forEach(([, fallback, delay, direction], index) => {
          const target = targets[index],
            box = boxes[index],
            style = getComputedStyle(target);
          const cell = create("div", "mondrian-entry__cell");
          const surface =
            style.backgroundColor === "rgba(0, 0, 0, 0)"
              ? fallback
              : style.backgroundColor;
          Object.assign(cell.style, {
            left: box.x + "px",
            top: box.y + "px",
            width: box.width + "px",
            height: box.height + "px",
            background: surface,
          });
          const clip = {
            left: "inset(0 100% 0 0)",
            right: "inset(0 0 0 100%)",
            top: "inset(0 0 100% 0)",
            bottom: "inset(100% 0 0 0)",
          }[direction];
          animate(
            cell,
            [
              { clipPath: clip, borderRadius: "0px" },
              { clipPath: "inset(0 0 0 0)", borderRadius: style.borderRadius },
            ],
            { duration: 700, delay, easing: "cubic-bezier(.65,0,.2,1)" },
          );
          animate(target, [{ opacity: 0 }, { opacity: 1 }], {
            duration: 1,
            delay: delay + 650,
          });
          animate(cell, [{ opacity: 1 }, { opacity: 0 }], {
            duration: 300,
            delay: delay + 650,
            fill: "forwards",
          });
          for (const child of target.children) {
            if (child.classList.contains("tile-actions")) continue;
            animate(child, [{ opacity: 0 }, { opacity: 1 }], {
              duration: 400,
              delay: delay + 680,
            });
          }
        });
        const header = document.querySelector(".hub-header");
        animate(header, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 350,
          delay: 4360,
        });
        animate(logo, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 1,
          delay: timing.handoff,
        });
        const brandReveal = animate(brand, [{ opacity: 0 }, { opacity: 1 }], {
          duration: 1,
          delay: timing.handoff,
        });

        // The video holds its own final frame; the destination uses that exact
        // decoded frame too. Never dissolve between two different poses.
        // Paint the real card before removing the travelling duplicate.
        // Independent 1 ms animations can leave a blank frame at the handoff.
        later(() => {
          brand.style.opacity = "1";
          brandReveal.cancel();
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              if (ended) return;
              character.style.visibility = "hidden";
              title.style.visibility = "hidden";
            }),
          );
        }, timing.handoff);
        const skip = create("button", "mondrian-entry__skip");
        skip.type = "button";
        skip.textContent = "건너뛰기";
        skip.addEventListener("click", finish);
        animate(skip, [{ opacity: 1 }, { opacity: 0 }], {
          duration: 180,
          delay: 5050,
          fill: "forwards",
        });
        later(() => {
          root.classList.remove("hub-entry-pending");
          overlay.style.background = "transparent";
        }, 3850);
        later(finish, timing.finish);
        addEventListener("resize", finish, { once: true });
        document.addEventListener("keydown", escape);
        reduced.addEventListener("change", finish, { once: true });
      } catch (error) {
        console.warn("Hub entry skipped:", error);
        finish();
      }
    },
    { once: true },
  );
})();
