"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import styles from "./SnakeGame.module.css";

const CELL = 16;
const COLS = 40;
const ROWS = 24;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;

const COLORS = [
  "#22c55e", // green
  "#06b6d4", // cyan
  "#d946ef", // magenta
  "#eab308", // yellow
  "#ef4444", // red
  "#3b82f6", // blue
];

const FOOD_NORMAL = 0;
const FOOD_BONUS = 1;
const FOOD_SUPER = 2;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const gameRef = useRef(null);
  const animRef = useRef(null);

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [mode, setMode] = useState("infinity"); // "classic" | "infinity"
  const [gameState, setGameState] = useState("idle"); // "idle" | "playing" | "paused" | "dead"

  const initGame = useCallback(() => {
    const startX = Math.floor(COLS / 2);
    const startY = Math.floor(ROWS / 2);
    gameRef.current = {
      snake: [{ x: startX, y: startY }],
      dir: { x: 1, y: 0 },
      nextDir: { x: 1, y: 0 },
      food: null,
      bonus: null,
      bonusTimer: 0,
      frameCount: 0,
      score: 0,
      level: 1,
      lastTick: 0,
      dead: false,
      deathFlash: 0,
    };
    placeFood(gameRef.current, FOOD_NORMAL);
    setScore(0);
    setLevel(1);
  }, []);

  function placeFood(game, kind) {
    const occupied = new Set(game.snake.map((s) => `${s.x},${s.y}`));
    let tries = 0;
    while (tries < 1000) {
      const x = randomInt(0, COLS - 1);
      const y = randomInt(0, ROWS - 1);
      if (!occupied.has(`${x},${y}`)) {
        if (kind === FOOD_NORMAL) {
          game.food = { x, y, kind };
        } else {
          game.bonus = { x, y, kind };
          game.bonusTimer = kind === FOOD_SUPER ? 120 : 200;
        }
        return;
      }
      tries++;
    }
  }

  function getSpeed(level) {
    const base = 120;
    const speed = base - (level - 1) * 8;
    return Math.max(speed, 50);
  }

  const gameLoop = useCallback(
    (timestamp) => {
      const game = gameRef.current;
      if (!game || game.dead) return;

      const speed = getSpeed(game.level);
      if (timestamp - game.lastTick < speed) {
        animRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      game.lastTick = timestamp;
      game.frameCount++;

      // Apply direction
      game.dir = { ...game.nextDir };

      // Move head
      const head = game.snake[0];
      let nx = head.x + game.dir.x;
      let ny = head.y + game.dir.y;

      if (mode === "classic") {
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
          game.dead = true;
          game.deathFlash = 12;
          handleDeath();
          return;
        }
      } else {
        if (nx < 0) nx = COLS - 1;
        if (nx >= COLS) nx = 0;
        if (ny < 0) ny = ROWS - 1;
        if (ny >= ROWS) ny = 0;
      }

      // Self-collision
      for (let i = 0; i < game.snake.length; i++) {
        if (game.snake[i].x === nx && game.snake[i].y === ny) {
          game.dead = true;
          game.deathFlash = 12;
          handleDeath();
          return;
        }
      }

      game.snake.unshift({ x: nx, y: ny });

      // Check food
      let ate = false;
      let pts = 0;

      if (game.food && nx === game.food.x && ny === game.food.y) {
        pts += 1;
        ate = true;
        placeFood(game, FOOD_NORMAL);
      }

      if (
        game.bonus &&
        game.bonusTimer > 0 &&
        nx === game.bonus.x &&
        ny === game.bonus.y
      ) {
        pts += game.bonus.kind === FOOD_BONUS ? 3 : 5;
        ate = true;
        game.bonus = null;
        game.bonusTimer = 0;
      }

      if (pts > 0) {
        game.score += pts;
        game.level = Math.floor(game.score / 5) + 1;
        setScore(game.score);
        setLevel(game.level);
      }

      if (!ate) {
        game.snake.pop();
      }

      // Bonus timer
      if (game.bonusTimer > 0) {
        game.bonusTimer--;
        if (game.bonusTimer <= 0) {
          game.bonus = null;
        }
      }

      // Spawn bonus
      if (
        !game.bonus &&
        game.frameCount > 0 &&
        game.frameCount % 60 === 0
      ) {
        const kind = Math.random() < 0.3 ? FOOD_SUPER : FOOD_BONUS;
        placeFood(game, kind);
      }

      draw();
      animRef.current = requestAnimationFrame(gameLoop);
    },
    [mode]
  );

  function handleDeath() {
    const game = gameRef.current;
    if (game.score > highScore) {
      setHighScore(game.score);
    }
    setGameState("dead");

    // Death flash animation
    let flash = 0;
    const flashInterval = setInterval(() => {
      draw(flash % 2 === 0);
      flash++;
      if (flash >= 10) {
        clearInterval(flashInterval);
        draw(false);
      }
    }, 150);
  }

  function draw(deathFlash = false) {
    const canvas = canvasRef.current;
    const game = gameRef.current;
    if (!canvas || !game) return;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid lines (subtle)
    ctx.strokeStyle = "rgba(34, 197, 94, 0.04)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= WIDTH; x += CELL) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= HEIGHT; y += CELL) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
      ctx.stroke();
    }

    // Snake
    const colorIdx = (game.level - 1) % COLORS.length;
    const baseColor = COLORS[colorIdx];

    game.snake.forEach((seg, i) => {
      const alpha = Math.max(0.3, 1 - i * 0.06);

      if (deathFlash) {
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
      } else {
        ctx.fillStyle = baseColor;
        ctx.globalAlpha = alpha;
      }

      const padding = 1;
      const radius = 3;
      const x = seg.x * CELL + padding;
      const y = seg.y * CELL + padding;
      const size = CELL - padding * 2;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Head direction indicator
    if (game.snake.length > 0 && !deathFlash) {
      const head = game.snake[0];
      ctx.fillStyle = "#ffffff";
      const cx = head.x * CELL + CELL / 2;
      const cy = head.y * CELL + CELL / 2;
      const eyeSize = 2;

      if (game.dir.x === 1) {
        ctx.fillRect(cx + 3, cy - 3, eyeSize, eyeSize);
        ctx.fillRect(cx + 3, cy + 1, eyeSize, eyeSize);
      } else if (game.dir.x === -1) {
        ctx.fillRect(cx - 5, cy - 3, eyeSize, eyeSize);
        ctx.fillRect(cx - 5, cy + 1, eyeSize, eyeSize);
      } else if (game.dir.y === -1) {
        ctx.fillRect(cx - 3, cy - 5, eyeSize, eyeSize);
        ctx.fillRect(cx + 1, cy - 5, eyeSize, eyeSize);
      } else {
        ctx.fillRect(cx - 3, cy + 3, eyeSize, eyeSize);
        ctx.fillRect(cx + 1, cy + 3, eyeSize, eyeSize);
      }
    }

    // Normal food
    if (game.food) {
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(
        game.food.x * CELL + CELL / 2,
        game.food.y * CELL + CELL / 2,
        CELL / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Bonus food
    if (game.bonus && game.bonusTimer > 0) {
      const flickering = game.bonusTimer < 40 && game.frameCount % 4 < 2;
      if (!flickering) {
        ctx.fillStyle = game.bonus.kind === FOOD_SUPER ? "#eab308" : "#d946ef";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 12;

        const bx = game.bonus.x * CELL + CELL / 2;
        const by = game.bonus.y * CELL + CELL / 2;

        if (game.bonus.kind === FOOD_SUPER) {
          // Diamond shape for super
          ctx.beginPath();
          ctx.moveTo(bx, by - CELL / 3);
          ctx.lineTo(bx + CELL / 3, by);
          ctx.lineTo(bx, by + CELL / 3);
          ctx.lineTo(bx - CELL / 3, by);
          ctx.closePath();
          ctx.fill();
        } else {
          // Square for bonus
          const s = CELL / 3;
          ctx.fillRect(bx - s, by - s, s * 2, s * 2);
        }
        ctx.shadowBlur = 0;
      }
    }

    // Border for classic mode
    if (mode === "classic") {
      ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2);
    }
  }

  function handleKeyDown(e) {
    const game = gameRef.current;

    if (gameState === "idle" || gameState === "dead") {
      if (
        ["w", "a", "s", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          e.key
        )
      ) {
        e.preventDefault();
        initGame();
        setGameState("playing");
        return;
      }
    }

    if (!game) return;

    if ((e.key === "p" || e.key === "P") && gameState === "playing") {
      e.preventDefault();
      setGameState("paused");
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    if ((e.key === "p" || e.key === "P") && gameState === "paused") {
      e.preventDefault();
      setGameState("playing");
      game.lastTick = performance.now();
      animRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    if (gameState !== "playing") return;

    e.preventDefault();
    const dir = game.dir;

    switch (e.key) {
      case "w":
      case "W":
      case "ArrowUp":
        if (dir.y !== 1) game.nextDir = { x: 0, y: -1 };
        break;
      case "s":
      case "S":
      case "ArrowDown":
        if (dir.y !== -1) game.nextDir = { x: 0, y: 1 };
        break;
      case "a":
      case "A":
      case "ArrowLeft":
        if (dir.x !== 1) game.nextDir = { x: -1, y: 0 };
        break;
      case "d":
      case "D":
      case "ArrowRight":
        if (dir.x !== -1) game.nextDir = { x: 1, y: 0 };
        break;
    }
  }

  // Start/stop game loop
  useEffect(() => {
    if (gameState === "playing") {
      const game = gameRef.current;
      if (game) {
        game.lastTick = performance.now();
        animRef.current = requestAnimationFrame(gameLoop);
      }
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameState, gameLoop]);

  // Initial draw
  useEffect(() => {
    initGame();
    draw();
  }, [initGame]);

  // Re-draw on mode change when idle
  useEffect(() => {
    if (gameState === "idle") {
      initGame();
      draw();
    }
  }, [mode, gameState, initGame]);

  return (
    <section className={styles.section} id="demo">
      <div className={`${styles.header} fade-in`}>
        <p className="section-label">Interactive</p>
        <h2 className="section-title">Play Snake-OS</h2>
        <p className="section-subtitle" style={{ margin: "0 auto" }}>
          A faithful JavaScript recreation of the original game mechanics.
          Click the game area and use WASD or arrow keys.
        </p>
      </div>

      <div className={`${styles.gameContainer} fade-in`}>
        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            className={
              mode === "infinity" ? styles.modeBtnActive : styles.modeBtn
            }
            onClick={() => {
              setMode("infinity");
              if (gameState !== "playing") {
                initGame();
                setGameState("idle");
              }
            }}
          >
            ∞ Infinity
          </button>
          <button
            className={
              mode === "classic" ? styles.modeBtnActive : styles.modeBtn
            }
            onClick={() => {
              setMode("classic");
              if (gameState !== "playing") {
                initGame();
                setGameState("idle");
              }
            }}
          >
            ⊞ Classic
          </button>
        </div>

        {/* HUD */}
        <div className={styles.hud}>
          <div className={styles.hudItem}>
            <span className={styles.hudLabel}>Score</span>
            <span className={styles.hudValue}>{score}</span>
          </div>
          <div className={styles.hudItem}>
            <span className={styles.hudLabel}>Level</span>
            <span className={styles.hudValue}>{level}</span>
          </div>
          <div className={styles.hudItem}>
            <span className={styles.hudLabel}>Best</span>
            <span className={styles.hudValue}>{highScore}</span>
          </div>
        </div>

        {/* Terminal wrapper */}
        <div className={styles.terminalWrap}>
          <div className={styles.termBar}>
            <span className={`${styles.termDot} ${styles.termDotRed}`} />
            <span className={`${styles.termDot} ${styles.termDotYellow}`} />
            <span className={`${styles.termDot} ${styles.termDotGreen}`} />
            <span className={styles.termTitle}>
              snake — {mode} mode{" "}
              {gameState === "paused" && "· PAUSED"}
              {gameState === "dead" && "· GAME OVER"}
            </span>
          </div>
          <div
            className={styles.canvasWrap}
            ref={wrapRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <canvas
              ref={canvasRef}
              width={WIDTH}
              height={HEIGHT}
              className={styles.canvas}
            />
          </div>
        </div>

        {/* State hints */}
        {(gameState === "idle" || gameState === "dead") && (
          <p className={styles.startHint}>
            {gameState === "dead"
              ? `Game Over — Score: ${score} · Press any direction key to restart`
              : "Press any direction key to start"}
          </p>
        )}

        {gameState === "paused" && (
          <p className={styles.startHint}>Press P to resume</p>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <span className={styles.keyBadge}>W</span>
            <span className={styles.keyBadge}>A</span>
            <span className={styles.keyBadge}>S</span>
            <span className={styles.keyBadge}>D</span>
            <span className={styles.controlLabel}>Move</span>
          </div>
          <span className={styles.controlSep} />
          <div className={styles.controlGroup}>
            <span className={styles.keyBadge}>↑</span>
            <span className={styles.keyBadge}>←</span>
            <span className={styles.keyBadge}>↓</span>
            <span className={styles.keyBadge}>→</span>
            <span className={styles.controlLabel}>Move</span>
          </div>
          <span className={styles.controlSep} />
          <div className={styles.controlGroup}>
            <span className={styles.keyBadge}>P</span>
            <span className={styles.controlLabel}>Pause</span>
          </div>
        </div>
      </div>
    </section>
  );
}
