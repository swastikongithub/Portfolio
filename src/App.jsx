import { useState, useEffect, useRef, useLayoutEffect, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import heroImg from "./assets/portfoliopic.jpeg";

gsap.registerPlugin(ScrollTrigger, TextPlugin, useGSAP);

/* ─── Palette ──────────────────────────────────────────────────────── */
const C = {
  bg: "#000000",
  bgCard: "#111111",
  bgDark: "#000000",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  accent: "#FF00FF",
  accentLight: "#FF66FF",
  accentSoft: "#330033",
  border: "#FFFFFF",
  tag: "#FFFF00",
  tagText: "#000000",
  green: "#00FF66",
  greenLight: "#003314",
  blue: "#00FFFF",
  blueLight: "#003333",
};

const skills = [
  { name: "HTML", level: 90 },
  { name: "CSS", level: 85 },
  { name: "JavaScript", level: 80 },
  { name: "PHP", level: 72 },
  { name: "Laravel", level: 65 },
  { name: "Python", level: 70 },
  { name: "Java", level: 60 },
  { name: "C++", level: 58 },
  { name: "MySQL", level: 68 },
  { name: "Git", level: 75 },
];

const certs = [
  { title: "Web Development Fundamentals", issuer: "Coursera", year: "2024", bg: C.accentSoft, icon: "🌐" },
  { title: "Python for Everybody", issuer: "University of Michigan", year: "2024", bg: C.greenLight, icon: "🐍" },
  { title: "Organizational Behavior", issuer: "Coursera", year: "2024", bg: C.blueLight, icon: "🏢" },
  { title: "Cross-Cultural Communication", issuer: "Online Learning", year: "2025", bg: "#333300", icon: "🌏" },
];

const projects = [
  { emoji: "📝", title: "Laravel Blog Engine", tags: ["Laravel", "PHP", "MySQL"], desc: "Full-featured blog with auth, CRUD ops, and clean routing built in Laravel & MySQL." },
  { emoji: "🛡️", title: "Crisis Communication Toolkit", tags: ["Research", "Communication"], desc: "Structured framework and review rubric for crisis comms, inspired by J&J Tylenol case." },
  { emoji: "🌿", title: "Portfolio Website", tags: ["React", "CSS", "GSAP"], desc: "This very portfolio — bold dark neo-brutalist aesthetic, GSAP animations, fully responsive." },
];

const navItems = ["About", "Skills", "Certificates", "Projects", "Socials", "Contact"];

/* ─── Helpers ──────────────────────────────────────────────────────── */
function Tag({ label }) {
  return (
    <span className="brutal-border brutal-shadow-static" style={{ background: C.tag, color: C.tagText, fontSize: 13, padding: "4px 12px", fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--sans)", textTransform: "uppercase" }}>
      {label}
    </span>
  );
}

/* ─── Magnetic Button ───────────────────────────────────────────────── */
function MagBtn({ children, style, onClick }) {
  const ref = useRef(null);
  const { contextSafe } = useGSAP({ scope: ref });

  const onMove = contextSafe((e) => {
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
    gsap.to(ref.current, { x: dx, y: dy, duration: 0.2, ease: "power2.out" });
  });

  const onLeave = contextSafe(() => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
  });

  return (
    <button className="brutal-border brutal-shadow" ref={ref} style={{ ...style, transition: "transform 0.1s, box-shadow 0.1s", borderRadius: 0 }} onClick={onClick} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </button>
  );
}

/* ─── Animated Skill Bar ─────────────────────────────────────────────── */
function SkillBar({ name, level, idx }) {
  const container = useRef(null);
  const barRef = useRef(null);
  const pctRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: container.current, start: "top 88%", once: true },
    });
    tl.fromTo(container.current,
      { opacity: 0, x: -25 },
      { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.2)", delay: idx * 0.04 }
    ).fromTo(barRef.current,
      { width: "0%" },
      { width: `${level}%`, duration: 1.2, ease: "power3.out" },
      "<0.1"
    ).fromTo(pctRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3 },
      "<0.4"
    );
  }, { scope: container });

  return (
    <div ref={container} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, opacity: 0 }}>
      <span style={{ width: 96, fontSize: 13, fontFamily: "var(--sans)", color: C.text, fontWeight: 700, flexShrink: 0, textTransform: "uppercase" }}>{name}</span>
      <div className="brutal-border" style={{ flex: 1, height: 16, background: C.bg, overflow: "hidden" }}>
        <div ref={barRef} style={{ height: "100%", background: C.accent, width: 0, borderRight: `2px solid ${C.border}` }} />
      </div>
      <span ref={pctRef} style={{ fontSize: 13, color: C.text, fontFamily: "var(--mono)", width: 44, textAlign: "right", opacity: 0, fontWeight: 700 }}>{level}%</span>
    </div>
  );
}

/* ─── Counter ────────────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }) {
  const ref = useRef(null);
  useGSAP(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: parseFloat(target), duration: 1.5, ease: "power2.out",
      onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix; },
      scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
    });
  });
  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Scroll-reveal section ──────────────────────────────────────────── */
function Reveal({ children, bg, id }) {
  const secRef = useRef(null);

  useGSAP(() => {
    const els = secRef.current.querySelectorAll("[data-anim]");
    ScrollTrigger.batch(els, {
      onEnter: (batch) => {
        batch.forEach((el) => {
          const type = el.dataset.anim;
          const delay = parseFloat(el.dataset.delay || 0);
          const from =
            type === "up" ? { opacity: 0, y: 50, filter: "brightness(0.5)" } :
              type === "left" ? { opacity: 0, x: -60, skewX: 5 } :
                type === "right" ? { opacity: 0, x: 60, skewX: -5 } :
                  type === "scale" ? { opacity: 0, scale: 0.8, filter: "brightness(0.5)" } :
                    { opacity: 0 };
          const to =
            type === "scale"
              ? { opacity: 1, scale: 1, filter: "brightness(1)", duration: 0.6, delay, ease: "back.out(2)" }
              : { opacity: 1, y: 0, x: 0, skewX: 0, filter: "brightness(1)", duration: 0.6, delay, ease: "back.out(1.5)" };
          gsap.fromTo(el, from, to);
        });
      },
      start: "top 88%",
      once: true,
    });
  }, { scope: secRef });

  return (
    <section id={id} ref={secRef} style={{ position: "relative", overflow: "hidden", background: bg || C.bg, borderBottom: `4px solid ${C.border}` }}>
      <SectionShapes />
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}

/* ─── Section Background Shapes ──────────────────────────────────────── */
const SHAPE_TYPES = ["square", "circle", "triangle", "plus"];

function SectionShapes({ count = 6, colors = [C.accent, C.green, C.blue, C.tag] }) {
  const container = useRef(null);
  const shapes = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
    size: 15 + Math.random() * 25,
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    dur: 6 + Math.random() * 12,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  })), [count, colors]);

  useGSAP(() => {
    const wrappers = container.current.querySelectorAll(".shape-wrapper");
    wrappers.forEach((el, i) => {
      const s = shapes[i];
      gsap.to(el, {
        y: `+=${30 + Math.random() * 60}`,
        x: `+=${(Math.random() - 0.5) * 60}`,
        rotation: (Math.random() - 0.5) * 360,
        duration: s.dur, delay: s.delay,
        repeat: -1, yoyo: true, ease: "sine.inOut",
      });
    });

    const onMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const inner = wrapper.querySelector(".shape-inner");
        const wrapperX = rect.left + rect.width / 2;
        const wrapperY = rect.top + rect.height / 2;

        const dx = wrapperX - mouseX;
        const dy = wrapperY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 250;
        if (dist < maxDist && dist > 1) {
          const force = (maxDist - dist) / maxDist;
          const moveX = (dx / dist) * force * 150;
          const moveY = (dy / dist) * force * 150;

          gsap.to(inner, {
            x: moveX,
            y: moveY,
            rotation: force * 90 * (dx > 0 ? 1 : -1),
            scale: 1.3,
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          gsap.to(inner, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, { scope: container, dependencies: [shapes] });

  return (
    <div ref={container} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {shapes.map((s) => (
        <div key={s.id} className="shape-wrapper" style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
        }}>
          <div className="shape-inner brutal-border brutal-shadow-static" style={{
            width: "100%", height: "100%",
            background: s.type === "triangle" || s.type === "plus" ? "transparent" : s.color,
            borderRadius: s.type === "circle" ? "50%" : 0,
            border: s.type === "triangle" || s.type === "plus" ? "none" : undefined,
            boxShadow: s.type === "triangle" || s.type === "plus" ? "none" : undefined,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {s.type === "triangle" && (
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                <polygon points="50,10 90,90 10,90" fill={s.color} stroke={C.border} strokeWidth="6" style={{ filter: `drop-shadow(6px 6px 0px ${C.border})` }} />
              </svg>
            )}
            {s.type === "plus" && (
              <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
                <path d="M40 10 H60 V40 H90 V60 H60 V90 H40 V60 H10 V40 H40 Z" fill={s.color} stroke={C.border} strokeWidth="6" style={{ filter: `drop-shadow(6px 6px 0px ${C.border})` }} />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Floating Particles ─────────────────────────────────────────────── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  size: 10 + Math.random() * 20,
  x: Math.random() * 100,
  y: Math.random() * 100,
  dur: 3 + Math.random() * 5,
  delay: Math.random() * 2,
  opacity: 1,
}));

function Particles() {
  const container = useRef(null);

  useGSAP(() => {
    // 1. Slow continuous background drift
    const wrappers = container.current.querySelectorAll(".particle-wrapper");
    wrappers.forEach((el, i) => {
      const p = PARTICLES[i];
      gsap.to(el, {
        y: `+=${30 + Math.random() * 50}`,
        x: `+=${(Math.random() - 0.5) * 50}`,
        rotation: (Math.random() - 0.5) * 180,
        duration: p.dur, delay: p.delay,
        repeat: -1, yoyo: true, ease: "power1.inOut",
      });
    });

    // 2. Cursor repulsion physics
    const onMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const inner = wrapper.querySelector(".particle-inner");

        const wrapperX = rect.left + rect.width / 2;
        const wrapperY = rect.top + rect.height / 2;

        const dx = wrapperX - mouseX;
        const dy = wrapperY - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 200; // Activation radius
        if (dist < maxDist && dist > 1) {
          const force = (maxDist - dist) / maxDist;
          const moveX = (dx / dist) * force * 150; // Severity of repulsion
          const moveY = (dy / dist) * force * 150;

          gsap.to(inner, {
            x: moveX,
            y: moveY,
            rotation: force * 60 * (dx > 0 ? 1 : -1),
            scale: 1 + force * 0.5, // slightly bulge out
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto"
          });
        } else {
          gsap.to(inner, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, { scope: container });

  return (
    <div ref={container} style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {PARTICLES.map((p, i) => (
        <div key={p.id} className="particle-wrapper" style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
        }}>
          <div className="particle-inner brutal-border" style={{
            width: "100%", height: "100%",
            background: i % 2 === 0 ? C.accent : C.blue, opacity: p.opacity,
          }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Custom Cursor (quickTo) ────────────────────────────────────────── */
function Cursor() {
  const animal = useRef(null);

  useLayoutEffect(() => {
    const xAnim = gsap.quickTo(animal.current, "x", { duration: 0.08, ease: "power2.out" });
    const yAnim = gsap.quickTo(animal.current, "y", { duration: 0.08, ease: "power2.out" });

    const scaleUp = () => gsap.to(animal.current, { scale: 1.4, rotation: -15, filter: "drop-shadow(6px 6px 0px #FFF)", duration: 0.3, ease: "back.out(2)" });
    const scaleDown = () => gsap.to(animal.current, { scale: 1, rotation: 0, filter: "drop-shadow(3px 3px 0px #FFF)", duration: 0.2, ease: "power2.out" });

    const move = (e) => { xAnim(e.clientX); yAnim(e.clientY); };

    window.addEventListener("mousemove", move);
    document.querySelectorAll("a, button, .nl").forEach(el => {
      el.addEventListener("mouseenter", scaleUp);
      el.addEventListener("mouseleave", scaleDown);
    });
    return () => {
      window.removeEventListener("mousemove", move);
      document.querySelectorAll("a, button, .nl").forEach(el => {
        el.removeEventListener("mouseenter", scaleUp);
        el.removeEventListener("mouseleave", scaleDown);
      });
    };
  }, []);

  return (
    <div ref={animal} style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 9999, transform: "translate(-50%,-50%)", filter: "drop-shadow(3px 3px 0px #FFF)", transition: "filter 0.2s" }}>
      <img src="/minecraftsword.png" width="48" height="48" alt="Minecraft Sword Cursor" style={{ pointerEvents: "none", display: "block" }} />
    </div>
  );
}

/* ─── Typewriter (TextPlugin) ────────────────────────────────────────── */
function Typewriter() {
  const ref = useRef(null);
  const [done, setDone] = useState(false);

  useGSAP(() => {
    gsap.to(ref.current, {
      duration: 1.5, text: { value: "CS Student & Tech Enthusiast", delimiter: "" },
      ease: "none", delay: 0.5, onComplete: () => setDone(true),
    });
  });

  return (
    <>
      <span ref={ref} />
      {!done && <span style={{ display: "inline-block", width: 10, height: "1em", background: C.accent, verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />}
    </>
  );
}

/* ─── Social Widgets ─────────────────────────────────────────────────── */
function InstagramFeed() {
  return (
    <div style={{ /* opacity:1 (fallback) */ opacity: 1, background: "transparent", padding: 0, overflow: "hidden", height: 600, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
      <div className="elfsight-app-cdda7a54-77f5-49a0-a6ea-6952faa1f10a" data-elfsight-app-lazy style={{ width: "100%", maxWidth: "100%" }}></div>
    </div>
  );
}

function LinkedInWidget() {
  return (
    <div style={{ /* opacity:1 (fallback) */ opacity: 1, background: "transparent", padding: 0, overflow: "hidden", height: 600, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
       <div className="elfsight-app-7d57c602-fc49-44e2-8e19-8a84b8211002" data-elfsight-app-lazy style={{ width: "100%", maxWidth: "100%" }}></div>
    </div>
  );
}

function GitHubWidget() {
  return (
    <div style={{ /* opacity:1 (fallback) */ opacity: 1, background: "transparent", padding: "10px", height: 600, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, width: "100%" }}>
      <h3 style={{ fontFamily: "var(--mono)", color: C.accent, fontSize: 24, fontWeight: 900, textTransform: "uppercase", margin: 0, textAlign: "center", width: "100%" }}>
        // System.Github
      </h3>
      <a href="https://github.com/swastikongithub" target="_blank" rel="noreferrer" className="brutal-shadow" style={{ display: "block", textDecoration: "none", width: "100%", maxWidth: 480, outline: `3px solid ${C.border}` }}>
        <img width="100%" src="https://github-readme-stats-eight-theta.vercel.app/api?username=swastikongithub&show_icons=true&bg_color=111111&title_color=ff00ff&text_color=ffffff&icon_color=00ffff&border_radius=0&hide_border=true" alt="GitHub Stats" style={{ display: "block" }} />
      </a>

      <a href="https://github.com/swastikongithub" target="_blank" rel="noreferrer" className="brutal-shadow" style={{ display: "block", textDecoration: "none", width: "100%", maxWidth: 480, outline: `3px solid ${C.border}` }}>
        <img width="100%" src="https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=swastikongithub&layout=compact&bg_color=111111&title_color=00ff66&text_color=ffffff&border_radius=0&hide_border=true" alt="Top Languages" style={{ display: "block" }} />
      </a>
    </div>
  );
}

/* ─── Social GSAP Infinite Marquee ─────────────────────────────────────── */
function SocialSlider() {
  const trackRef = useRef(null);

  useEffect(() => {
    // Safely initialize external Elfsight widgets without blocking React
    const timer = setTimeout(() => {
      try {
        if (window.eapps) requestAnimationFrame(() => window.eapps.init());
      } catch (e) {}
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useGSAP(() => {
    if (!trackRef.current) return;
    
    // Smooth infinite loop exactly like the featured banner
    gsap.to(trackRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 30, // Adjust speed (higher is slower)
      repeat: -1
    });
  }, { scope: trackRef });

  return (
    <div style={{ width: "100%", overflow: "hidden", position: "relative" }}>
      <div 
        ref={trackRef}
        style={{ 
          display: "flex", width: "max-content", alignItems: "center",
          gap: "5vw", paddingLeft: "5vw", paddingRight: "5vw"
        }}
      >
        {/* SET 1 */}
        <div style={{ display: "flex", gap: "5vw", paddingRight: "5vw", paddingLeft: "5vw" }}>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <InstagramFeed />
          </div>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <LinkedInWidget />
          </div>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <GitHubWidget />
          </div>
        </div>
        {/* SET 2 (Duplicate for Seamless Loop) */}
        <div style={{ display: "flex", gap: "5vw", paddingRight: "5vw" }}>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <InstagramFeed />
          </div>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <LinkedInWidget />
          </div>
          <div style={{ width: "90vw", maxWidth: 640, flexShrink: 0 }}>
            <GitHubWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
export default function Portfolio() {
  const [active, setActive] = useState("About");
  const navRef = useRef(null);
  const app = useRef(null);
  const heroRef = useRef(null);

  /* Hero Portrait Parallax */
  useGSAP(() => {
    const huds = heroRef.current?.querySelectorAll(".hud");
    const face = heroRef.current?.querySelector(".face-img");
    if (!huds || !huds.length || !face) return;

    const xSetters = Array.from(huds).map(el => gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }));
    const ySetters = Array.from(huds).map(el => gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }));

    const faceX = gsap.quickTo(face, "rotationY", { duration: 0.8, ease: "power2.out" });
    const faceY = gsap.quickTo(face, "rotationX", { duration: 0.8, ease: "power2.out" });

    const onMove = (e) => {
      const rect = heroRef.current.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      huds.forEach((el, i) => {
        const depth = parseFloat(el.dataset.depth || 1);
        xSetters[i](nx * 60 * depth);
        ySetters[i](ny * 60 * depth);
      });
      faceX(nx * 10);
      faceY(-ny * 10);
    };

    heroRef.current.addEventListener("mousemove", onMove);
    const heroEl = heroRef.current;
    return () => heroEl.removeEventListener("mousemove", onMove);
  }, { scope: heroRef });

  /* Hero entrance */
  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "back.out(1.5)" } })
      .fromTo(".h-badge", { opacity: 0, y: -40, scale: 0.5 }, { opacity: 1, y: 0, scale: 1, duration: 0.6 })
      .fromTo(".h-name", { opacity: 0, y: 100, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, "-=0.3")
      .fromTo(".h-tag", { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".h-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
      .fromTo(".h-btns", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }, "-=0.4")
      .fromTo(".h-scroll", { opacity: 0 }, { opacity: 1, duration: 0.3 }, "-=0.2");
  }, { scope: app });

  /* Nav hide on scroll down */
  useGSAP(() => {
    let last = 0;
    const fn = () => {
      const y = window.scrollY;
      gsap.to(navRef.current, y > last && y > 90
        ? { y: -80, duration: 0.3, ease: "power2.in" }
        : { y: 0, duration: 0.4, ease: "back.out(1.5)" });
      last = y;
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, { scope: navRef });

  /* Active nav tracking */
  useEffect(() => {
    const fn = () => {
      const y = window.scrollY + 120;
      for (const n of navItems) {
        const el = document.getElementById(n.toLowerCase());
        if (el && el.offsetTop <= y && el.offsetTop + el.offsetHeight > y)
          setActive(n);
      }
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const goto = (id) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });

  const inp = {
    width: "100%", padding: "16px 20px", background: C.bgCard,
    fontSize: 16, fontFamily: "var(--sans)", color: C.text, fontWeight: 600,
    outline: "none", marginBottom: 20,
  };

  return (
    <div ref={app} style={{ fontFamily: "var(--sans)", background: C.bg, color: C.text, minHeight: "100vh" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;cursor:none;}
        a,button{cursor:none;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        ::-webkit-scrollbar{width:8px;}
        ::-webkit-scrollbar-track{background:${C.bg};border-left:3px solid ${C.border};}
        ::-webkit-scrollbar-thumb{background:${C.border};}
        .pcard{transition:transform .1s,box-shadow .1s;}
        .pcard:hover{transform:translate(-4px,-4px);box-shadow:8px 8px 0px 0px ${C.accent};}
        .nl{transition:all .1s; border:3px solid transparent;}
        .nl:hover{background:${C.accent}!important;color:#000!important;border:3px solid ${C.border};box-shadow:4px 4px 0px 0px ${C.border}; transform:translate(-2px,-2px);}
        [data-anim]{will-change:transform,opacity;}
      `}</style>

      <Cursor />

      {/* ── NAV ── */}
      <nav ref={navRef} className="brutal-border" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: C.bg,
        borderBottom: `4px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw", height: 70,
      }}>
        <div onClick={() => goto("about")} className="brutal-border brutal-shadow-static" style={{ fontWeight: 800, fontSize: 28, color: C.bg, background: C.accent, padding: "2px 12px", fontFamily: "var(--sans)" }}>S.</div>
        <div style={{ display: "flex", gap: 10 }}>
          {navItems.map(n => (
            <button key={n} className="nl brutal-border" onClick={() => goto(n)} style={{
              padding: "8px 16px", fontSize: 14,
              background: active === n ? C.accent : C.bgCard,
              color: active === n ? C.bg : C.text,
              fontWeight: 800, fontFamily: "var(--sans)", textTransform: "uppercase",
              boxShadow: active === n ? `4px 4px 0px 0px ${C.border}` : `none`,
              transform: active === n ? `translate(-2px,-2px)` : `none`,
            }}>{n}</button>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div id="about" ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "row", flexWrap: "wrap",
        alignItems: "center", justifyContent: "center", gap: 60,
        textAlign: "center", padding: "120px 5vw 60px",
        position: "relative", overflow: "hidden",
        background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${C.bgCard} 10px, ${C.bgCard} 20px)`,
        perspective: 1000
      }}>
        <Particles />

        {/* Parallax Portrait Area */}
        <div style={{ position: "relative", zIndex: 1, transformStyle: "preserve-3d", margin: "40px 0", flexShrink: 0 }}>
          <div className="hud brutal-border" data-depth="-0.6" style={{ position: "absolute", top: -30, left: -40, width: 220, height: 160, background: "transparent", border: `3px solid ${C.accent}`, zIndex: -1 }}>
            <div style={{ background: C.accent, color: C.bg, fontSize: 12, fontWeight: 900, padding: 4, width: "fit-content" }}>SYS.SCAN // 01</div>
          </div>

          <div className="hud" data-depth="-0.9" style={{ position: "absolute", bottom: -10, right: -50, background: C.tag, padding: "8px 12px", border: `3px solid ${C.border}`, zIndex: -1, fontWeight: 900, color: C.bgDark, textTransform: "uppercase", fontSize: 14 }}>
            TARGET_LOCKED
          </div>

          {/* Main Portrait Base */}
          <div className="face-img brutal-border brutal-shadow-static" style={{ width: 320, height: 420, overflow: "hidden", background: C.bgCard }}>
            <img src={heroImg} alt="Swastik Portrait" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%) contrast(1.2)" }} />
          </div>

          {/* Foreground Overlay HUDs */}
          <div className="hud brutal-border" data-depth="0.7" style={{ position: "absolute", top: 80, right: -70, width: 150, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", padding: 12, zIndex: 2, textAlign: "left", color: C.green }}>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", marginBottom: 4, fontWeight: 600 }}>NAME: SWASTIK</div>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", marginBottom: 4, fontWeight: 600 }}>LOC: DELHI</div>
            <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: C.accent }}>STATUS: ACTIVE</div>
            <div style={{ borderTop: `2px solid ${C.green}`, width: "100%", marginTop: 8 }} />
          </div>

          <div className="hud" data-depth="1.2" style={{ position: "absolute", bottom: 60, left: -40, zIndex: 3 }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke={C.blue} strokeWidth="3">
              <path d="M10 20 V 10 H 20 M40 10 H 50 V 20 M50 40 V 50 H 40 M20 50 H 10 V 40" />
              <circle cx="30" cy="30" r="4" fill={C.blue} />
            </svg>
          </div>

          <div className="hud" data-depth="0.4" style={{ position: "absolute", top: "35%", left: "-10%", width: "120%", height: 3, background: C.accent, zIndex: 4, pointerEvents: "none", mixBlendMode: "difference" }} />
        </div>

        {/* Text Container */}
        <div style={{ position: "relative", zIndex: 1, background: C.bg, padding: "40px", border: `4px solid ${C.border}`, boxShadow: `12px 12px 0px 0px ${C.border}`, maxWidth: 640 }}>
          <div className="h-badge brutal-border" style={{
            display: "inline-block", opacity: 0,
            background: C.green, color: C.bgDark,
            padding: "8px 20px", fontSize: 14,
            fontWeight: 800, fontFamily: "var(--sans)",
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: 30, boxShadow: `4px 4px 0px 0px ${C.border}`
          }}>✦ Open to Opportunities</div>

          <h1 className="h-name" style={{ opacity: 0, display: "inline-block", background: C.accent, color: C.bg, padding: "10px 3vw", border: `4px solid ${C.border}`, fontSize: "clamp(3.5rem,8vw,6.5rem)", fontFamily: '"Anton", sans-serif', fontWeight: 400, lineHeight: 1, letterSpacing: "0.02em", marginBottom: 20, textTransform: "uppercase", boxShadow: `8px 8px 0px ${C.blue}` }}>
            Swastik
          </h1>

          <p className="h-tag" style={{ opacity: 0, fontSize: "clamp(1.1rem,2vw,1.5rem)", color: C.bg, background: C.blue, padding: "4px 16px", border: `3px solid ${C.border}`, display: "inline-block", fontWeight: 800, marginBottom: 30, minHeight: "3rem" }}>
            <Typewriter />
          </p>

          <p className="h-sub" style={{ opacity: 0, color: C.text, lineHeight: 1.6, fontSize: 16, fontWeight: 600, fontFamily: "var(--sans)", margin: "0 auto 30px", border: `2px solid ${C.border}`, padding: "16px", background: C.bgCard, boxShadow: `4px 4px 0px 0px ${C.border}` }}>
            Building bold digital experiences — one line of code at a time. Passionate about technology, design, and continuous learning.
          </p>

          <div className="h-btns" style={{ opacity: 0, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <MagBtn onClick={() => alert("🔗 Replace with your resume URL!")} style={{ padding: "16px 36px", fontWeight: 800, fontSize: 15, background: C.accent, color: C.bg, fontFamily: "var(--sans)", textTransform: "uppercase" }}>
              ↓ Resume
            </MagBtn>
            <MagBtn onClick={() => goto("Contact")} style={{ padding: "16px 36px", fontWeight: 800, fontSize: 15, background: C.blue, color: C.bg, fontFamily: "var(--sans)", textTransform: "uppercase" }}>
              Get In Touch
            </MagBtn>
          </div>
        </div>

        <div className="h-scroll brutal-border" style={{ opacity: 0, position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontSize: 12, fontWeight: 800, background: C.bg, padding: "8px", boxShadow: `4px 4px 0px ${C.border}`, zIndex: 10 }}>
          <span>SCROLL</span>
          <div style={{ width: 4, height: 20, background: C.accent, border: `1px solid ${C.border}` }} />
        </div>
      </div>

      {/* ── ABOUT DETAIL ── */}
      <Reveal id="about-detail" bg={C.bgCard}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 5vw" }}>
          <p data-anim="up" style={{ opacity: 0, fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.accent, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase" }}>WHO I AM</p>
          <h2 data-anim="up" data-delay="0.1" style={{ opacity: 0, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textTransform: "uppercase", textShadow: `4px 4px 0px ${C.blue}` }}>About Me</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 50, alignItems: "center" }}>
            <div>
              <div className="brutal-border brutal-shadow-static" data-anim="left" data-delay="0.1" style={{ opacity: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.7, color: C.text, marginBottom: 30, background: C.bg, padding: "24px" }}>
                Hey! I'm <strong style={{ color: C.accent, fontWeight: 900 }}>Swastik</strong> — a curious CS student from Delhi, India. I enjoy building web apps, exploring new frameworks, and bridging technology with communication.
                <br /><br />
                Currently sharpening my skills in Laravel, JavaScript, and Python while exploring organizational behavior and cross-cultural communication. I believe great software is as much about people as code.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[["10", "Technologies", "+"], [4, "Certificates", "+"], [3, "Projects", "+"], [21, "Years Old", ""]].map(([n, l, s], i) => (
                  <div key={l} className="brutal-border brutal-shadow-static" data-anim="scale" data-delay={`${0.12 * i}`} style={{ opacity: 0, background: i % 2 === 0 ? C.accent : C.blue, padding: "20px", textAlign: "center" }}>
                    <div style={{ fontSize: 40, fontWeight: 900, color: C.bg, textShadow: `2px 2px 0px ${C.border}` }}><Counter target={n} suffix={s} /></div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.bg, fontFamily: "var(--sans)", marginTop: 6, textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="brutal-border brutal-shadow-static" data-anim="right" data-delay="0.15" style={{ opacity: 0, background: C.green, padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: 80, marginBottom: 20 }}>🌿</div>
                <div style={{ fontWeight: 900, fontSize: 28, color: C.bg, textTransform: "uppercase", marginBottom: 10 }}>Swastik</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.bgDark, fontFamily: "var(--sans)" }}>CS Student · Builder · Learner</div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
                  {["Delhi", "India"].map(t => <Tag key={t} label={t} />)}
                </div>
              </div>
              <div className="brutal-border brutal-shadow-static" data-anim="right" data-delay="0.25" style={{ opacity: 0, background: C.bg, padding: "24px" }}>
                <p style={{ fontFamily: "var(--sans)", fontSize: 18, fontWeight: 700, color: C.text, lineHeight: 1.6 }}>
                  "The best way to predict the future is to invent it."
                </p>
                <p style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 900, color: C.accent, marginTop: 12, textTransform: "uppercase" }}>— Alan Kay</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── SKILLS ── */}
      <Reveal id="skills">
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 5vw" }}>
          <p data-anim="up" style={{ opacity: 0, fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.green, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase" }}>WHAT I WORK WITH</p>
          <h2 data-anim="up" data-delay="0.1" style={{ opacity: 0, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textTransform: "uppercase", textShadow: `4px 4px 0px ${C.accent}` }}>Skills &amp; Tech</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 40 }}>
            <div className="brutal-border brutal-shadow-static" data-anim="left" data-delay="0.15" style={{ opacity: 0, background: C.bgCard, padding: "34px" }}>
              <h3 style={{ fontFamily: "var(--sans)", fontWeight: 900, marginBottom: 30, color: C.text, fontSize: 20, textTransform: "uppercase", borderBottom: `4px solid ${C.border}`, paddingBottom: "10px" }}>Proficiency</h3>
              {skills.map((sk, i) => <SkillBar key={sk.name} {...sk} idx={i} />)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Frontend", items: ["HTML", "CSS", "JavaScript", "React"], icon: "🖥️", bg: C.accentSoft },
                { label: "Backend", items: ["PHP", "Laravel", "Python", "Java"], icon: "⚙️", bg: C.blueLight },
                { label: "Database & Tools", items: ["MySQL", "Git", "GitHub", "VS Code"], icon: "🗄️", bg: C.greenLight },
                { label: "Soft Skills", items: ["Communication", "Research", "Problem Solving"], icon: "🌱", bg: C.bgCard },
              ].map((cat, i) => (
                <div key={cat.label} className="brutal-border brutal-shadow-static" data-anim="right" data-delay={`${0.1 + i * 0.08}`} style={{ opacity: 0, background: cat.bg, padding: "24px" }}>
                  <div style={{ fontFamily: "var(--sans)", fontWeight: 900, fontSize: 18, marginBottom: 16, color: C.text, textTransform: "uppercase" }}>{cat.icon} {cat.label}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{cat.items.map(t => <Tag key={t} label={t} />)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── CERTIFICATES ── */}
      <Reveal id="certificates" bg={C.bgCard}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 5vw" }}>
          <p data-anim="up" style={{ opacity: 0, fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.blue, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase" }}>CREDENTIALS</p>
          <h2 data-anim="up" data-delay="0.1" style={{ opacity: 0, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textTransform: "uppercase", textShadow: `4px 4px 0px ${C.green}` }}>Certificates</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, marginBottom: 40 }}>
            {certs.map((c, i) => (
              <div key={c.title} className="brutal-border brutal-shadow-static" data-anim="scale" data-delay={`${i * 0.1}`} style={{ opacity: 0, background: c.bg, padding: "30px" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{c.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 18, color: C.text, marginBottom: 10, lineHeight: 1.3 }}>{c.title}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.textMuted, fontFamily: "var(--sans)" }}>{c.issuer}</div>
                <div style={{ fontSize: 14, color: C.bg, background: C.text, display: "inline-block", padding: "2px 8px", border: `2px solid ${C.bg}`, fontFamily: "var(--mono)", marginTop: 12, fontWeight: 800 }}>{c.year}</div>
              </div>
            ))}
          </div>
          <div className="brutal-border brutal-shadow-static" data-anim="up" data-delay="0.25" style={{ opacity: 0, background: C.accent, padding: "32px", display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap" }}>
            <div style={{ fontSize: 50 }}>📄</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 900, fontSize: 24, marginBottom: 8, color: C.bg, textTransform: "uppercase" }}>My Resume</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.bg, fontFamily: "var(--sans)" }}>Full CV with education, experience, and certifications.</div>
            </div>
            <MagBtn onClick={() => alert("🔗 Replace with your resume URL!")} style={{ padding: "16px 32px", background: C.bg, color: C.text, border: `4px solid ${C.border}`, fontWeight: 900, fontFamily: "var(--sans)", fontSize: 16, whiteSpace: "nowrap", textTransform: "uppercase" }}>
              View Resume ↗
            </MagBtn>
          </div>
        </div>
      </Reveal>

      {/* ── PROJECTS ── */}
      <Reveal id="projects">
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 5vw" }}>
          <p data-anim="up" style={{ opacity: 0, fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.tag, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase" }}>WHAT I'VE BUILT</p>
          <h2 data-anim="up" data-delay="0.1" style={{ opacity: 0, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textTransform: "uppercase", textShadow: `4px 4px 0px ${C.accentLight}` }}>Projects</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 30 }}>
            {projects.map((p, i) => (
              <div key={p.title} className="pcard brutal-border brutal-shadow-static" data-anim="up" data-delay={`${i * 0.12}`} style={{ opacity: 0, background: C.bgCard, padding: "34px", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 48, display: "block", marginBottom: 20 }}>{p.emoji}</span>
                <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 14, textTransform: "uppercase" }}>{p.title}</div>
                <p style={{ fontSize: 16, fontWeight: 600, color: C.textMuted, lineHeight: 1.6, marginBottom: 24, fontFamily: "var(--sans)", flex: 1 }}>{p.desc}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{p.tags.map(t => <Tag key={t} label={t} />)}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── SOCIALS ── */}
      <section id="socials" style={{ background: C.bg, borderBottom: `4px solid ${C.border}`, position: "relative", overflowX: "hidden" }}>
        <div id="socials-pin-target" style={{ position: "relative", zIndex: 1, width: "100%", paddingTop: "150px", paddingBottom: "250px", textAlign: "center" }}>
          <SectionShapes />
          <p style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.tag, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase" }}>MY VIBE</p>
          <h2 style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textTransform: "uppercase", textShadow: `4px 4px 0px ${C.accent}` }}>Socials</h2>
          <SocialSlider />
        </div>
      </section>

      {/* ── CONTACT ── */}
      <Reveal id="contact" bg={C.bgCard}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 5vw" }}>
          <p data-anim="up" style={{ opacity: 0, fontFamily: "var(--sans)", fontSize: 16, fontWeight: 900, letterSpacing: "0.15em", color: C.bg, background: C.accent, display: "inline-block", padding: "4px 12px", border: `2px solid ${C.border}`, marginBottom: 20, textTransform: "uppercase", textAlign: "center", width: "100%" }}>SAY HELLO</p>
          <h2 data-anim="up" data-delay="0.1" style={{ opacity: 0, fontSize: "clamp(2.5rem,5vw,3.5rem)", fontWeight: 900, marginBottom: 50, textAlign: "center", textTransform: "uppercase", textShadow: `4px 4px 0px ${C.blue}` }}>Get In Touch</h2>
          <div className="brutal-border brutal-shadow-static" data-anim="scale" data-delay="0.2" style={{ opacity: 0, background: C.bg, padding: "50px 40px", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <p style={{ color: C.text, fontWeight: 700, fontFamily: "var(--sans)", fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
              Open to new opportunities, collaborations, or just a chat about tech. Drop a message!
            </p>
            <input className="brutal-border" placeholder="NAME" style={inp} />
            <input className="brutal-border" placeholder="EMAIL" style={inp} type="email" />
            <textarea className="brutal-border" placeholder="MESSAGE" rows={4} style={{ ...inp, resize: "vertical", minHeight: 140 }} />
            <MagBtn onClick={() => alert("✅ Connect to EmailJS or a backend!")} style={{ width: "100%", padding: "20px", background: C.accent, color: C.bg, fontWeight: 900, fontSize: 18, fontFamily: "var(--sans)", display: "block", textAlign: "center", textTransform: "uppercase" }}>
              Send Message ✦
            </MagBtn>
            <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              {[{ label: "GitHub", url: "https://github.com" }, { label: "LinkedIn", url: "https://linkedin.com" }, { label: "Email", url: "mailto:swastiksingh288@gmail.com" }].map(l => (
                <a key={l.label} className="brutal-shadow-static" href={l.url} target="_blank" rel="noreferrer" style={{ fontFamily: "var(--sans)", fontSize: 14, color: C.bg, background: C.text, fontWeight: 900, textDecoration: "none", padding: "10px 24px", border: `2px solid ${C.border}`, textTransform: "uppercase", transition: "transform 0.1s, box-shadow 0.1s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `4px 4px 0px ${C.accent}` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `var(--shadow-brutal)` }}>
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── FOOTER ── */}
      <footer className="brutal-border" style={{ background: C.accentSoft, color: C.text, textAlign: "center", padding: "50px 20px", fontFamily: "var(--sans)", borderTop: `4px solid ${C.border}` }}>
        <div style={{ fontSize: 32, marginBottom: 16, color: C.accentLight, fontFamily: "var(--sans)", fontWeight: 900, textTransform: "uppercase", textShadow: `2px 2px 0px ${C.border}` }}>S.</div>
        <div style={{ color: C.text, fontWeight: 700, marginBottom: 10, fontSize: 16 }}>CS Student &amp; Tech Enthusiast · Delhi, India</div>
        <div style={{ color: C.textMuted, fontSize: 14, marginTop: 10, fontWeight: 800 }}>Built with React &amp; GSAP · {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
