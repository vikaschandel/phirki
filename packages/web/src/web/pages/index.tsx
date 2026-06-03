import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TOTAL_FRAMES = 281;

function padFrame(n: number) { return String(n).padStart(4, "0"); }
function frameUrl(n: number) { return `/frames/frame${padFrame(n)}.jpg`; }

const CHAPTERS = [
  {
    id: "reveal",
    label: "01 — THE REVEAL",
    title: ["Unwrap the", "extraordinary."],
    accentLine: 1,
    desc: "Engineered for those who demand precision in every drop. PHIRKI isn't just a sprayer — it's a statement.",
    align: "left" as const,
  },
  {
    id: "emerge",
    label: "02 — BORN FROM PRESSURE",
    title: ["Power", "unleashed."],
    accentLine: 1,
    desc: "A professional-grade pressure system built for gardeners, detailers, and artisans who refuse to compromise.",
    align: "right" as const,
  },
  {
    id: "detail",
    label: "03 — DETAIL MASTERY",
    title: ["Precision", "redefined."],
    accentLine: 1,
    desc: "Every component machined to perfection. The dual-mode nozzle delivers atomized control you can feel.",
    align: "left" as const,
  },
  {
    id: "beauty",
    label: "04 — BORN FOR THE WILD",
    title: ["Tough.", "Refined."],
    accentLine: 1,
    desc: "From the garden to the workshop floor. PHIRKI thrives wherever control matters most.",
    align: "right" as const,
  },
];

const SCROLL_PER_CHAPTER = 400; // vh per chapter
const TOTAL_SCRUB_VH = CHAPTERS.length * SCROLL_PER_CHAPTER; // 1600vh

const FEATURES = [
  { icon: "◎", title: "Dual Spray Modes", desc: "Mist or jet — precision atomization for every surface" },
  { icon: "⬡", title: "2L Capacity", desc: "Professional-grade tank engineered for extended sessions" },
  { icon: "↑", title: "40 PSI Pressure", desc: "Ergonomic pump delivers consistent high-pressure output" },
  { icon: "◈", title: "Anti-Clog Nozzle", desc: "Stainless steel tip maintains pristine flow every time" },
  { icon: "⬤", title: "360° Spray", desc: "Inverted use capability for total coverage control" },
  { icon: "◇", title: "Chemical Safe", desc: "HDPE-grade tank withstands harsh cleaning solutions" },
];

const SPECS = [
  { label: "Capacity", value: 2, unit: "Liters" },
  { label: "Pressure", value: 40, unit: "PSI Max" },
  { label: "Nozzle Modes", value: 3, unit: "Settings" },
  { label: "Accessories", value: 8, unit: "Included" },
];

export default function IndexPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrolling = useRef(false);

  // ── draw one frame ──
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const i = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
    const img = imagesRef.current[i];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const { naturalWidth: iw, naturalHeight: ih } = img;
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / iw, ch / ih);
    const dx = (cw - iw * scale) / 2;
    const dy = (ch - ih * scale) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, iw * scale, ih * scale);
  }, []);

  // ── smooth RAF interpolation ──
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.3) {
        currentFrameRef.current += diff * 0.15;
        drawFrame(currentFrameRef.current);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { active = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [drawFrame]);

  // ── preload frames ──
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    let done = 0;
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameUrl(i + 1);
      img.onload = img.onerror = () => {
        done++;
        setLoadProgress(Math.round((done / TOTAL_FRAMES) * 100));
        if (done === TOTAL_FRAMES) setIsLoaded(true);
        if (i === 0) drawFrame(0);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, [drawFrame]);

  // ── canvas resize ──
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      drawFrame(Math.round(currentFrameRef.current));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawFrame]);

  // ── PURE SCROLL LISTENER: canvas is position:fixed, shown only while scrub section is in view ──
  useEffect(() => {
    if (!isLoaded) return;
    const canvas = canvasRef.current;
    const scrub = scrubRef.current;
    if (!canvas || !scrub) return;

    const onScroll = () => {
      const rect = scrub.getBoundingClientRect();
      const scrubH = scrub.offsetHeight;
      const vh = window.innerHeight;

      // Is the scrub section covering the viewport?
      const inView = rect.top <= 0 && rect.bottom >= vh;

      canvas.style.display = inView ? "block" : "none";

      // Show/hide chapter overlays container when in scrub
      const overlayEl = document.getElementById("scrub-overlays");
      if (overlayEl) overlayEl.style.display = inView ? "block" : "none";

      // Hide chapter text while scrolling, reveal on idle
      if (inView) {
        isScrolling.current = true;
        const overlayText = document.getElementById("scrub-text");
        if (overlayText) overlayText.classList.add("scrolling");
        if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
        scrollIdleTimer.current = setTimeout(() => {
          isScrolling.current = false;
          const t = document.getElementById("scrub-text");
          if (t) t.classList.remove("scrolling");
        }, 600);
      }

      if (inView) {
        // progress: 0 when scrub top hits viewport top → 1 when scrub bottom hits viewport bottom
        const scrolled = Math.abs(rect.top); // px scrolled into section
        const maxScroll = scrubH - vh;       // total scrollable px
        const p = Math.min(1, Math.max(0, scrolled / maxScroll));

        targetFrameRef.current = p * (TOTAL_FRAMES - 1);

        // progress bar
        const pb = document.getElementById("prog");
        if (pb) pb.style.transform = `scaleX(${p})`;

        // chapter opacities
        const chunkSize = 1 / CHAPTERS.length;
        CHAPTERS.forEach((ch, idx) => {
          const el = document.getElementById(`ch-${ch.id}`);
          if (!el) return;
          const chStart = idx * chunkSize;
          const chEnd = (idx + 1) * chunkSize;
          const ramp = chunkSize * 0.12;
          let op = 0;
          if (p >= chStart && p < chStart + ramp) {
            op = (p - chStart) / ramp;
          } else if (p >= chStart + ramp && p < chEnd - ramp) {
            op = 1;
          } else if (p >= chEnd - ramp && p <= chEnd) {
            op = (chEnd - p) / ramp;
          }
          el.style.opacity = String(Math.max(0, Math.min(1, op)));
        });
      }
    };

    // Initial call
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollIdleTimer.current) clearTimeout(scrollIdleTimer.current);
    };
  }, [isLoaded]);

  // ── GSAP for hero/feature/spec animations only (no pin) ──
  useGSAP(() => {
    if (!isLoaded) return;

    gsap.fromTo(navRef.current,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 1.2, delay: 0.3, ease: "power3.out" }
    );
    gsap.fromTo(".hero-char",
      { opacity: 0, y: 100 },
      { opacity: 1, y: 0, duration: 1.4, stagger: 0.07, ease: "power4.out", delay: 0.4 }
    );
    gsap.fromTo(".hero-sub",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: "power3.out" }
    );
    gsap.fromTo(".scroll-cue",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, delay: 1.8, ease: "power3.out" }
    );
    gsap.fromTo(".feat-title",
      { opacity: 0, y: 50 },
      { scrollTrigger: { trigger: featuresRef.current, start: "top 75%" }, opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    gsap.fromTo(".feat-card",
      { opacity: 0, y: 60 },
      { scrollTrigger: { trigger: featuresRef.current, start: "top 68%" }, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
    );
    gsap.fromTo(".spec-head",
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: specsRef.current, start: "top 75%" }, opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
    gsap.fromTo(".spec-num",
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: specsRef.current, start: "top 68%" }, opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }
    );
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.getAttribute("data-count") || "0");
      ScrollTrigger.create({
        trigger: el, start: "top 80%", once: true,
        onEnter() {
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 1.8, ease: "power2.out",
            onUpdate() { el.textContent = Math.round(obj.val).toString(); }
          });
        },
      });
    });
    gsap.fromTo(".cta-inner",
      { opacity: 0, y: 60 },
      { scrollTrigger: { trigger: ctaRef.current, start: "top 70%" }, opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );
  }, [isLoaded]);

  return (
    <div style={{ background: "#050810", overflowX: "hidden" }}>

      {/* LOADING */}
      {!isLoaded && (
        <div style={{
          position: "fixed", inset: 0, background: "#050810", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2.5rem"
        }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,8vw,5rem)", color: "#C9A84C", letterSpacing: "0.5em", fontWeight: 300 }}>PHIRKI</div>
          <div style={{ width: 240, height: 1, background: "#0d1d30", position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", width: `${loadProgress}%`,
              background: "linear-gradient(90deg,#6B4F1A,#C9A84C,#E8C86A)",
              transition: "width 0.1s ease", boxShadow: "0 0 12px rgba(201,168,76,0.6)"
            }} />
          </div>
          <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "rgba(138,155,176,0.7)", letterSpacing: "0.35em" }}>
            LOADING — {loadProgress}%
          </div>
        </div>
      )}

      {/* NAV */}
      <nav ref={navRef} style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, opacity: 0,
        padding: "1.8rem 4rem", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(180deg,rgba(5,8,16,0.95) 0%,transparent 100%)",
      }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: "1.5rem", color: "#C9A84C", letterSpacing: "0.45em", fontWeight: 600 }}>PHIRKI</div>
        <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#8A9BB0", letterSpacing: "0.3em" }}>PREMIUM FOAM SPRAYER</div>
        <a href="#cta" style={{
          fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#C9A84C",
          letterSpacing: "0.25em", textDecoration: "none",
          border: "1px solid rgba(201,168,76,0.35)", padding: "0.55rem 1.4rem",
          transition: "all 0.3s ease"
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.1)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >GET YOURS</a>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 300, background: "rgba(201,168,76,0.08)" }}>
        <div id="prog" style={{
          height: "100%", background: "linear-gradient(90deg,#6B4F1A,#C9A84C)",
          transformOrigin: "left", transform: "scaleX(0)"
        }} />
      </div>

      {/* ── CANVAS: position:fixed, shown only during scrub section ── */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: "100vw", height: "100vh",
          display: "none",   // shown by scroll listener when scrub is active
          zIndex: 10,
          pointerEvents: "none",
        }}
      />

      {/* ── CHAPTER OVERLAYS: position:fixed, shown during scrub ── */}
      <div id="scrub-overlays" style={{ display: "none", position: "fixed", inset: 0, zIndex: 20, pointerEvents: "none" }}>
        {/* scrub-text: fades out while scrolling, back in on idle */}
        <div id="scrub-text" style={{ position: "absolute", inset: 0 }}>
          {CHAPTERS.map((ch) => (
            <div
              key={ch.id}
              id={`ch-${ch.id}`}
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                justifyContent: ch.align === "left" ? "flex-end" : "center",
                alignItems: ch.align === "right" ? "flex-end" : "flex-start",
                padding: ch.align === "left" ? "0 5vw 8vh" : "0 5vw",
                opacity: 0,
                transition: "opacity 0.1s linear",
              }}
            >
              <div style={{
                maxWidth: 520, padding: "2.5rem",
                background: ch.align === "left"
                  ? "linear-gradient(to right,rgba(5,8,16,0.8),transparent)"
                  : "linear-gradient(to left,rgba(5,8,16,0.8),transparent)",
              }}>
                <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#C9A84C", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "1.2rem" }}>
                  {ch.label}
                </div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,6vw,4.5rem)", fontWeight: 300, lineHeight: 1.05, marginBottom: "1.5rem" }}>
                  {ch.title.map((line, li) => (
                    <div key={li} style={{
                      color: li === ch.accentLine ? "#C9A84C" : "#F5F5F0",
                      fontStyle: li === ch.accentLine ? "italic" : "normal"
                    }}>{line}</div>
                  ))}
                </div>
                <div style={{ fontFamily: "var(--fb)", fontSize: "clamp(0.8rem,1.4vw,0.95rem)", color: "#8A9BB0", lineHeight: 1.8 }}>
                  {ch.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section ref={heroRef} style={{
        position: "relative", height: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        overflow: "hidden"
      }}>
        <img src={frameUrl(1)} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: isLoaded ? 0 : 0.7, transition: "opacity 0.8s"
        }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%,rgba(5,8,16,0.15) 0%,rgba(5,8,16,0.9) 100%)" }} />
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{
            display: "flex", justifyContent: "center",
            fontFamily: "var(--fd)", fontSize: "clamp(5rem,18vw,13rem)",
            fontWeight: 300, lineHeight: 1, letterSpacing: "0.12em", marginBottom: "2rem"
          }}>
            {"PHIRKI".split("").map((c, i) => (
              <span key={i} className="hero-char" style={{
                display: "inline-block", opacity: 0,
                color: i === 0 || i === 3 ? "#C9A84C" : "#F5F5F0"
              }}>{c}</span>
            ))}
          </div>
          <div className="hero-sub" style={{
            fontFamily: "var(--fb)", fontSize: "clamp(0.6rem,1.2vw,0.75rem)",
            color: "#8A9BB0", letterSpacing: "0.4em", textTransform: "uppercase",
            marginBottom: "4rem", opacity: 0
          }}>
            Multi-Purpose 2 Liter Pressure Sprayer
          </div>
          <div className="scroll-cue" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", opacity: 0 }}>
            <span style={{ fontFamily: "var(--fb)", fontSize: "0.6rem", color: "rgba(201,168,76,0.6)", letterSpacing: "0.35em" }}>SCROLL TO EXPERIENCE</span>
            <div style={{ width: 1, height: 60, background: "linear-gradient(to bottom,#C9A84C,transparent)", animation: "drip 1.8s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SCRUB SECTION — 1600vh tall spacer
          Canvas is fixed; scroll listener shows it while
          this div is covering the viewport.
      ══════════════════════════════════════════════════ */}
      <div
        ref={scrubRef}
        style={{ position: "relative", height: `${TOTAL_SCRUB_VH}vh` }}
      />

      {/* FEATURES */}
      <section ref={featuresRef} style={{
        padding: "10rem 0 8rem",
        background: "linear-gradient(180deg,#050810 0%,#060e1d 50%,#050810 100%)",
        position: "relative"
      }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 1, height: 100, background: "linear-gradient(to bottom,transparent,rgba(201,168,76,0.5),transparent)" }} />
        <div className="feat-title" style={{ textAlign: "center", marginBottom: "5rem", padding: "0 2rem", opacity: 0 }}>
          <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#C9A84C", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "1.5rem" }}>05 — The Arsenal</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,7vw,4.5rem)", color: "#F5F5F0", fontWeight: 300, lineHeight: 1.1 }}>
            Built for the{" "}<span style={{ color: "#C9A84C", fontStyle: "italic" }}>obsessive professional.</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 1, maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card" style={{
              padding: "3rem 2.5rem", border: "1px solid rgba(201,168,76,0.08)",
              background: "rgba(10,22,40,0.3)", position: "relative",
              opacity: 0, transition: "all 0.4s ease", cursor: "default"
            }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = "rgba(201,168,76,0.05)"; el.style.borderColor = "rgba(201,168,76,0.25)"; el.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = "rgba(10,22,40,0.3)"; el.style.borderColor = "rgba(201,168,76,0.08)"; el.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, width: 40, height: 1, background: "#C9A84C" }} />
              <div style={{ fontSize: "1.4rem", color: "#C9A84C", marginBottom: "1.8rem", opacity: 0.7 }}>{f.icon}</div>
              <div style={{ fontFamily: "var(--fd)", fontSize: "1.4rem", color: "#F5F5F0", marginBottom: "0.8rem", fontWeight: 500 }}>{f.title}</div>
              <div style={{ fontFamily: "var(--fb)", fontSize: "0.875rem", color: "#8A9BB0", lineHeight: 1.75 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MID BEAUTY SHOT */}
      <div style={{ height: "70vh", position: "relative", overflow: "hidden" }}>
        <img src={frameUrl(200)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(5,8,16,0.85),rgba(5,8,16,0.15) 50%,rgba(5,8,16,0.85))" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 2rem" }}>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(1.5rem,4vw,3.5rem)", color: "#F5F5F0", fontWeight: 300, lineHeight: 1.3 }}>
            Tough enough for the task.<br />
            <span style={{ color: "#C9A84C", fontStyle: "italic" }}>Refined enough for the master.</span>
          </div>
        </div>
      </div>

      {/* SPECS */}
      <section ref={specsRef} style={{ padding: "10rem 2rem", background: "#050810" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="spec-head" style={{ textAlign: "center", marginBottom: "5rem", opacity: 0 }}>
            <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#C9A84C", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "1.5rem" }}>06 — By the Numbers</div>
            <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(2.5rem,6vw,4rem)", color: "#F5F5F0", fontWeight: 300 }}>
              Engineered to <span style={{ color: "#C9A84C" }}>perfection.</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "3rem" }}>
            {SPECS.map((s, i) => (
              <div key={i} className="spec-num" style={{ textAlign: "center", position: "relative", padding: "2.5rem 1rem", opacity: 0 }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 60, height: 1, background: "linear-gradient(to right,transparent,#C9A84C,transparent)" }} />
                <div data-count={s.value} style={{ fontFamily: "var(--fd)", fontSize: "clamp(4rem,10vw,6rem)", color: "#C9A84C", fontWeight: 300, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#8A9BB0", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "0.4rem", marginBottom: "0.8rem" }}>{s.unit}</div>
                <div style={{ fontFamily: "var(--fd)", fontSize: "1.1rem", color: "#F5F5F0" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL BEAUTY */}
      <div style={{ height: "80vh", position: "relative", overflow: "hidden" }}>
        <img src={frameUrl(281)} alt="PHIRKI" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(5,8,16,1) 0%,rgba(5,8,16,0.1) 60%,transparent 100%)" }} />
      </div>

      {/* CTA */}
      <section ref={ctaRef} id="cta" style={{ padding: "10rem 2rem 12rem", background: "#050810", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, maxWidth: "100vw", background: "radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div className="cta-inner" style={{ position: "relative", opacity: 0 }}>
          <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#C9A84C", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: "2.5rem" }}>07 — Own the Experience</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(4rem,12vw,8rem)", color: "#F5F5F0", fontWeight: 300, lineHeight: 1 }}>Experience</div>
          <div style={{ fontFamily: "var(--fd)", fontSize: "clamp(4rem,12vw,8rem)", color: "#C9A84C", fontWeight: 300, fontStyle: "italic", lineHeight: 1, marginBottom: "3.5rem" }}>Control.</div>
          <div style={{ fontFamily: "var(--fb)", fontSize: "clamp(0.875rem,1.5vw,1rem)", color: "#8A9BB0", maxWidth: 480, margin: "0 auto 4rem", lineHeight: 1.8 }}>
            The PHIRKI Premium Foam Sprayer. For gardeners, detailers, and craftspeople who refuse to compromise on precision.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <a href="#" style={{
              fontFamily: "var(--fb)", fontSize: "0.72rem", letterSpacing: "0.25em",
              color: "#050810", background: "#C9A84C", padding: "1.1rem 3rem",
              textDecoration: "none", transition: "all 0.3s ease", display: "inline-block",
              boxShadow: "0 0 30px rgba(201,168,76,0.2)"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E8C86A"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#C9A84C"; }}
            >BUY PHIRKI</a>
            <a href="#" style={{
              fontFamily: "var(--fb)", fontSize: "0.72rem", letterSpacing: "0.25em",
              color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)",
              padding: "1.1rem 3rem", textDecoration: "none",
              transition: "all 0.3s ease", display: "inline-block"
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#C9A84C"; (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.07)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.35)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >EXPLORE FEATURES</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(201,168,76,0.1)", padding: "3rem 4rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#050810", flexWrap: "wrap", gap: "1rem"
      }}>
        <div style={{ fontFamily: "var(--fd)", fontSize: "1.3rem", color: "#C9A84C", letterSpacing: "0.45em" }}>PHIRKI</div>
        <div style={{ fontFamily: "var(--fb)", fontSize: "0.65rem", color: "#8A9BB0", letterSpacing: "0.2em", textTransform: "uppercase" }}>By Trumart — Precision Tools for Modern Craftsmen</div>
        <div style={{ fontFamily: "var(--fb)", fontSize: "0.6rem", color: "rgba(138,155,176,0.4)" }}>© 2025 PHIRKI. All rights reserved.</div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
        :root { --fd:'Cormorant Garamond',Georgia,serif; --fb:'Inter',-apple-system,sans-serif; }
        *,*::before,*::after{box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{margin:0;padding:0;background:#050810;overflow-x:hidden;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-track{background:#050810;}
        ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.25);border-radius:2px;}
        #scrub-text{
          transition: opacity 0.25s ease;
          opacity: 1;
        }
        #scrub-text.scrolling{
          opacity: 0;
          transition: opacity 0.1s ease;
        }
        @keyframes drip{
          0%{opacity:0;transform:translateY(-10px) scaleY(0.5);}
          50%{opacity:1;transform:translateY(0) scaleY(1);}
          100%{opacity:0;transform:translateY(10px) scaleY(0.5);}
        }
      `}</style>
    </div>
  );
}
