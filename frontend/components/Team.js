import styles from "./Team.module.css";

const members = [
  {
    name: "Pintu Singh",
    roll: "230105",
    initials: "PS",
    contribution:
      "Memory allocator, game engine, level system, linked-list snake body.",
  },
  {
    name: "Pranay Sarkar",
    roll: "230047",
    initials: "PK",
    contribution:
      "Screen rendering, keyboard input, HUD display, ANSI escape codes.",
  },
  {
    name: "Shah Fathal",
    roll: "230043",
    initials: "SF",
    contribution:
      "Math & string modules, food system, LCG random number generator.",
  },
];

export default function Team() {
  return (
    <section className={styles.section} id="team">
      <div className={`${styles.header} fade-in`}>
        <p className="section-label">Contributors</p>
        <h2 className="section-title">The Team</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          Three developers, zero shortcuts.
        </p>
      </div>

      <div className={`${styles.grid} stagger`}>
        {members.map((m, i) => (
          <div key={i} className={`${styles.card} fade-in`}>
            <div className={styles.avatar}>{m.initials}</div>
            <h3 className={styles.name}>{m.name}</h3>
            <span className={styles.roll}>{m.roll}</span>
            <p className={styles.contribution}>{m.contribution}</p>
          </div>
        ))}
      </div>

      <div className={`${styles.institution} fade-in`}>
        <p className={styles.instName}>Newton School of Technology</p>
        <p className={styles.instDept}>
          B.Tech Computer Science &amp; Artificial Intelligence
        </p>
        <p className={styles.instDate}>Sonipat, India · April 2026</p>
      </div>
    </section>
  );
}
