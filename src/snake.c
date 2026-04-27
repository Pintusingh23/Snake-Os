#include "../include/keyboard.h"
#include "../include/memory.h"
#include "../include/screen.h"
#include "../include/string.h"
#include "../include/math.h"

#include <unistd.h>
#include <time.h>
#include <stdint.h>

#define SCORE_ROW 2
#define PLAY_MIN_X 2
#define PLAY_MIN_Y 4
#define MAX_BOARD_W 50
#define MAX_BOARD_H 18
#define MIN_BOARD_W 20
#define MIN_BOARD_H 8

static int g_board_width = 40;
static int g_board_height = 18;
static int g_play_max_x = 39;
static int g_play_max_y = 17;
static int g_level = 1;
static int g_high_score = 0;
static int g_snake_color = 0; /* 0=green 1=cyan 2=magenta 3=yellow 4=red 5=blue */

typedef struct Segment { int x; int y; struct Segment *next; } Segment;
Segment *snake_head = 0;
int snake_length = 0;

void tail_push_front(int x, int y)
{
    Segment *node;
    node = (Segment *)my_alloc((int)sizeof(Segment));
    if (node == 0) return;
    node->x = x; node->y = y; node->next = snake_head;
    snake_head = node; snake_length += 1;
}

void tail_pop_back(void)
{
    Segment *prev; Segment *cur;
    if (snake_head == 0) return;
    if (snake_head->next == 0) {
        screen_draw_char(snake_head->x, snake_head->y, ' ');
        my_dealloc((void *)snake_head);
        snake_head = 0; snake_length = 0; return;
    }
    prev = snake_head; cur = snake_head->next;
    while (cur->next != 0) { prev = cur; cur = cur->next; }
    prev->next = 0;
    screen_draw_char(cur->x, cur->y, ' ');
    my_dealloc((void *)cur); snake_length -= 1;
}

/* Color table: bold, normal, dim variants per color */
static const char *color_bold[] = {
    "\033[1;32mo\033[0m", /* green */
    "\033[1;36mo\033[0m", /* cyan */
    "\033[1;35mo\033[0m", /* magenta */
    "\033[1;33mo\033[0m", /* yellow */
    "\033[1;31mo\033[0m", /* red */
    "\033[1;34mo\033[0m"  /* blue */
};
static const char *color_norm[] = {
    "\033[32mo\033[0m",
    "\033[36mo\033[0m",
    "\033[35mo\033[0m",
    "\033[33mo\033[0m",
    "\033[31mo\033[0m",
    "\033[34mo\033[0m"
};
static const char *color_dim[] = {
    "\033[2;32mo\033[0m",
    "\033[2;36mo\033[0m",
    "\033[2;35mo\033[0m",
    "\033[2;33mo\033[0m",
    "\033[2;31mo\033[0m",
    "\033[2;34mo\033[0m"
};

/* Gradient tail with color cycling */
void tail_draw(void)
{
    Segment *cur;
    int idx;
    int c;
    c = g_snake_color;
    cur = snake_head; idx = 0;
    while (cur != 0) {
        if (idx < 2) {
            screen_draw_string(cur->x, cur->y, color_bold[c]);
        } else if (idx < 5) {
            screen_draw_string(cur->x, cur->y, color_norm[c]);
        } else {
            screen_draw_string(cur->x, cur->y, color_dim[c]);
        }
        cur = cur->next; idx++;
    }
}

int tail_collides(int x, int y)
{
    Segment *cur = snake_head;
    while (cur != 0) {
        if (cur->x == x && cur->y == y) return 1;
        cur = cur->next;
    }
    return 0;
}

typedef struct Snake { int x; int y; char direction; } Snake;
typedef struct Food { int x; int y; int kind; int timer; } Food;
/* kind: 0=regular(*,1pt), 1=bonus($,3pt), 2=super(#,5pt) */

static unsigned int g_rng_state = 1U;
static unsigned int next_rand(void)
{ g_rng_state = g_rng_state * 1103515245U + 12345U; return g_rng_state; }

static void seed_rng(void)
{
    unsigned int seed;
    seed = ((unsigned int)time(0)) ^ ((unsigned int)(uintptr_t)&seed);
    if (seed == 0U) seed = 1U;
    g_rng_state = seed;
}

/* Head colors matching snake body color */
static const char *head_chars[][4] = {
    { "\033[1;32m^\033[0m", "\033[1;32mv\033[0m", "\033[1;32m<\033[0m", "\033[1;32m>\033[0m" },
    { "\033[1;36m^\033[0m", "\033[1;36mv\033[0m", "\033[1;36m<\033[0m", "\033[1;36m>\033[0m" },
    { "\033[1;35m^\033[0m", "\033[1;35mv\033[0m", "\033[1;35m<\033[0m", "\033[1;35m>\033[0m" },
    { "\033[1;33m^\033[0m", "\033[1;33mv\033[0m", "\033[1;33m<\033[0m", "\033[1;33m>\033[0m" },
    { "\033[1;31m^\033[0m", "\033[1;31mv\033[0m", "\033[1;31m<\033[0m", "\033[1;31m>\033[0m" },
    { "\033[1;34m^\033[0m", "\033[1;34mv\033[0m", "\033[1;34m<\033[0m", "\033[1;34m>\033[0m" }
};

static void draw_head(int x, int y, char dir)
{
    int c;
    int d;
    c = g_snake_color;
    if (dir == 'W') d = 0;
    else if (dir == 'S') d = 1;
    else if (dir == 'A') d = 2;
    else d = 3;
    screen_draw_string(x, y, head_chars[c][d]);
}

static void draw_food(Food *f)
{
    if (f->kind == 0) screen_draw_string(f->x, f->y, "\033[1;31m*\033[0m");
    else if (f->kind == 1) screen_draw_string(f->x, f->y, "\033[1;35m$\033[0m");
    else screen_draw_string(f->x, f->y, "\033[1;33m#\033[0m");
}

static void draw_score_row(int width, int score, int level)
{
    int x; char buf[80]; char num[16]; int pos;
    x = 2;
    while (x <= width - 1) { screen_draw_char(x, SCORE_ROW, ' '); x++; }
    screen_draw_string(1, SCORE_ROW, "\033[1;36m|\033[0m");
    screen_draw_string(width, SCORE_ROW, "\033[1;36m|\033[0m");
    pos = 0;
    my_strcpy(buf + pos, " SCORE: "); pos += 8;
    my_int_to_str(score, num); my_strcpy(buf + pos, num); pos += my_strlen(num);
    my_strcpy(buf + pos, "  |  LVL: "); pos += 10;
    my_int_to_str(level, num); my_strcpy(buf + pos, num); pos += my_strlen(num);
    my_strcpy(buf + pos, "  |  BEST: "); pos += 11;
    my_int_to_str(g_high_score, num); my_strcpy(buf + pos, num); pos += my_strlen(num);
    buf[pos] = '\0';
    screen_draw_string(2, SCORE_ROW, "\033[1;33m");
    screen_draw_string(2, SCORE_ROW, buf);
    screen_draw_string(2 + pos, SCORE_ROW, "\033[0m");
}

static int place_food_at(Food *food, const Snake *snake, int kind)
{
    int x, y, tries, range_x, range_y, total;
    range_x = g_play_max_x - PLAY_MIN_X + 1;
    range_y = g_play_max_y - PLAY_MIN_Y + 1;
    if (range_x < 1 || range_y < 1) return 0;
    total = my_mul(range_x, range_y);
    tries = 0;
    while (tries < total) {
        tries++;
        x = my_mod((int)(next_rand() & 0x7FFF), range_x) + PLAY_MIN_X;
        y = my_mod((int)(next_rand() & 0x7FFF), range_y) + PLAY_MIN_Y;
        if ((x == snake->x && y == snake->y) || tail_collides(x, y)) continue;
        food->x = x; food->y = y; food->kind = kind; return 1;
    }
    y = PLAY_MIN_Y;
    while (y <= g_play_max_y) {
        x = PLAY_MIN_X;
        while (x <= g_play_max_x) {
            if ((x != snake->x || y != snake->y) && !tail_collides(x, y)) {
                food->x = x; food->y = y; food->kind = kind; return 1;
            }
            x++;
        }
        y++;
    }
    return 0;
}

static void delay_one_tick(char direction)
{
    int base, d, m;
    if (direction == 'W' || direction == 'S') base = 180000;
    else base = 90000;
    /* 5% speed increase per level, floor at 40% of base */
    d = base - my_mul(g_level - 1, my_div(base, 20));
    m = my_div(my_mul(base, 2), 5);
    if (d < m) d = m;
    usleep(d);
}

static void update_direction(Snake *snake, char key)
{
    if ((key == 'w' || key == 'W') && snake->direction != 'S') snake->direction = 'W';
    if ((key == 'a' || key == 'A') && snake->direction != 'D') snake->direction = 'A';
    if ((key == 's' || key == 'S') && snake->direction != 'W') snake->direction = 'S';
    if ((key == 'd' || key == 'D') && snake->direction != 'A') snake->direction = 'D';
}

static int move_snake(Snake *snake)
{
    int nx, ny;
    nx = snake->x; ny = snake->y;
    if (snake->direction == 'W') ny--;
    if (snake->direction == 'A') nx--;
    if (snake->direction == 'S') ny++;
    if (snake->direction == 'D') nx++;
    /* Wrap around borders instead of dying */
    if (nx < PLAY_MIN_X) nx = g_play_max_x;
    if (nx > g_play_max_x) nx = PLAY_MIN_X;
    if (ny < PLAY_MIN_Y) ny = g_play_max_y;
    if (ny > g_play_max_y) ny = PLAY_MIN_Y;
    snake->x = nx; snake->y = ny; return 1;
}

static void calc_board(int tw, int th)
{
    g_board_width = (tw - 1 < MAX_BOARD_W) ? tw - 1 : MAX_BOARD_W;
    g_board_height = (th - 2 < MAX_BOARD_H) ? th - 2 : MAX_BOARD_H;
    g_play_max_x = g_board_width - 1;
    g_play_max_y = g_board_height - 1;
}

static void full_redraw(int width, int height, int score, int level, Snake *s, Food *f, Food *bonus)
{
    screen_clear();
    screen_draw_string(1, 1, "\033[?25l");
    screen_draw_border(width, height);
    draw_score_row(width, score, level);
    if (f->x >= PLAY_MIN_X && f->x <= g_play_max_x && f->y >= PLAY_MIN_Y && f->y <= g_play_max_y)
        draw_food(f);
    if (bonus->timer > 0 && bonus->x >= PLAY_MIN_X && bonus->x <= g_play_max_x)
        draw_food(bonus);
    tail_draw();
    draw_head(s->x, s->y, s->direction);
    screen_draw_string(2, height + 1, "\033[2;37m WASD/Arrows: Move | Q: Quit\033[0m");
    screen_move_cursor(1, height + 2);
    screen_present();
}

static void show_title(void)
{
    int cx, cy;
    cx = my_div(g_board_width, 2);
    cy = my_div(PLAY_MIN_Y + g_play_max_y, 2);
    screen_clear();
    screen_draw_string(1, 1, "\033[?25l");
    screen_draw_border(g_board_width, g_board_height);

    screen_draw_string(cx - 10, cy - 3, "\033[1;32m  ____  _   _    _    _  _____\033[0m");
    screen_draw_string(cx - 10, cy - 2, "\033[1;32m / ___|| \\ | |  / \\  | |/ / __|\033[0m");
    screen_draw_string(cx - 10, cy - 1, "\033[1;32m \\___ \\|  \\| | / _ \\ |   (| _| \033[0m");
    screen_draw_string(cx - 10, cy,     "\033[1;32m  ___) | |\\  |/ ___ \\| |\\ \\ |__\033[0m");
    screen_draw_string(cx - 10, cy + 1, "\033[1;32m |____/|_| \\_/_/   \\_\\_| \\_\\___|\033[0m");
    screen_draw_string(cx - 4, cy + 3, "\033[1;36m~ O S ~\033[0m");
    screen_draw_string(cx - 10, cy + 5, "\033[33m WASD / Arrow Keys to move\033[0m");

    if (g_high_score > 0) {
        char hbuf[32]; char num[16];
        my_int_to_str(g_high_score, num);
        my_strcpy(hbuf, " High Score: ");
        my_strcpy(hbuf + 13, num);
        hbuf[13 + my_strlen(num)] = '\0';
        screen_draw_string(cx - 7, cy + 7, "\033[1;33m");
        screen_draw_string(cx - 7, cy + 7, hbuf);
        screen_draw_string(cx - 7 + 13 + my_strlen(num), cy + 7, "\033[0m");
    }

    screen_draw_string(cx - 10, cy + 9, "\033[1;37m Press any key to start...\033[0m");

    { int ry;
      for (ry = PLAY_MIN_Y; ry < g_board_height; ry++) {
          screen_draw_string(1, ry, "\033[1;36m|\033[0m");
          screen_draw_string(g_board_width, ry, "\033[1;36m|\033[0m");
      }
    }
    screen_move_cursor(1, g_board_height + 1);
    screen_present();
    while (!key_pressed()) { usleep(50000); }
    read_key();
}

int main(void)
{
    int quit_game;
    int term_w, term_h;

    quit_game = 0;
    memory_init();
    keyboard_init();
    seed_rng();

    while (!quit_game) {
        Snake *snake;
        Food food;
        Food bonus;
        int running, old_x, old_y, score;
        int frame_count;
        int prev_tw, prev_th;

        screen_get_size(&term_w, &term_h);
        calc_board(term_w, term_h);
        prev_tw = term_w; prev_th = term_h;

        if (g_board_width < MIN_BOARD_W || g_board_height < MIN_BOARD_H) {
            screen_clear();
            screen_draw_string(1, 1, "\033[1;31mTerminal too small! Resize.\033[0m");
            screen_present();
            while (!key_pressed()) { usleep(100000); }
            read_key(); continue;
        }

        show_title();

        snake = (Snake *)my_alloc((int)sizeof(Snake));
        if (snake == 0) { keyboard_restore(); return 1; }

        snake->x = my_div(g_board_width, 2);
        snake->y = my_div(PLAY_MIN_Y + g_play_max_y, 2);
        snake->direction = 'D';
        running = 1; old_x = snake->x; old_y = snake->y;
        score = 0; g_level = 1; frame_count = 0;

        food.kind = 0; food.timer = 0;
        bonus.kind = 1; bonus.timer = 0; bonus.x = 0; bonus.y = 0;

        if (!place_food_at(&food, snake, 0)) {
            my_dealloc((void *)snake); keyboard_restore(); return 1;
        }

        full_redraw(g_board_width, g_board_height, score, g_level, snake, &food, &bonus);

        while (running) {
            char key;
            int new_tw, new_th;

            /* --- LIVE RESIZE CHECK --- */
            screen_get_size(&new_tw, &new_th);
            if (new_tw != prev_tw || new_th != prev_th) {
                prev_tw = new_tw; prev_th = new_th;
                calc_board(new_tw, new_th);
                if (g_board_width < MIN_BOARD_W || g_board_height < MIN_BOARD_H) {
                    running = 0; break;
                }
                /* Clamp snake into new bounds */
                if (snake->x > g_play_max_x) snake->x = g_play_max_x;
                if (snake->y > g_play_max_y) snake->y = g_play_max_y;
                /* Relocate food if out of bounds */
                if (food.x > g_play_max_x || food.y > g_play_max_y)
                    place_food_at(&food, snake, 0);
                if (bonus.timer > 0 && (bonus.x > g_play_max_x || bonus.y > g_play_max_y))
                    bonus.timer = 0; /* despawn bonus */
                /* Full redraw at new size */
                full_redraw(g_board_width, g_board_height, score, g_level, snake, &food, &bonus);
            }

            if (key_pressed()) {
                key = read_key();
                if (key == 'q' || key == 'Q') { running = 0; quit_game = 1; }
                update_direction(snake, key);
            }
            if (!running) break;

            old_x = snake->x; old_y = snake->y;
            if (!move_snake(snake)) running = 0;

            if (old_x != snake->x || old_y != snake->y) {
                int ate = 0;
                int pts = 0;

                /* Check regular food */
                if (snake->x == food.x && snake->y == food.y) {
                    pts = 1; ate = 1;
                    place_food_at(&food, snake, 0);
                    draw_food(&food);
                }
                /* Check bonus food */
                if (bonus.timer > 0 && snake->x == bonus.x && snake->y == bonus.y) {
                    pts += (bonus.kind == 1) ? 3 : 5;
                    ate = 1;
                    bonus.timer = 0;
                }

                if (pts > 0) {
                    score += pts;
                    g_level = my_div(score, 5) + 1;
                    g_snake_color = my_mod(my_div(score, 5), 6);
                    draw_score_row(g_board_width, score, g_level);
                }

                tail_push_front(old_x, old_y);
                if (!ate) { while (snake_length > score) tail_pop_back(); }
                if (tail_collides(snake->x, snake->y)) running = 0;
            }

            /* --- BONUS FOOD TIMER --- */
            frame_count++;
            if (bonus.timer > 0) {
                bonus.timer--;
                if (bonus.timer == 0) {
                    screen_draw_char(bonus.x, bonus.y, ' '); /* despawn */
                }
            }
            /* Spawn bonus every ~80 frames (~8 sec) */
            if (bonus.timer == 0 && my_mod(frame_count, 80) == 0 && frame_count > 0) {
                int bk;
                bk = (my_mod((int)(next_rand() & 0x7FFF), 3) == 0) ? 2 : 1;
                if (place_food_at(&bonus, snake, bk)) {
                    bonus.timer = 50; /* lasts ~5 sec */
                    draw_food(&bonus);
                }
            }

            tail_draw();
            draw_head(snake->x, snake->y, snake->direction);
            screen_move_cursor(1, g_board_height + 2);
            screen_present();

            if (!running) break;
            delay_one_tick(snake->direction);
        }

        if (score > g_high_score) g_high_score = score;
        while (snake_head != 0) tail_pop_back();
        my_dealloc((void *)snake);

        /* ---- GAME OVER with resize support ---- */
        if (!quit_game) {
            int go_tw, go_th;
            screen_get_size(&go_tw, &go_th);
            calc_board(go_tw, go_th);

            /* Draw initial game over screen */
            {
                int ry, cy, cx;
                char sbuf[16];
                screen_clear();
                screen_draw_string(1, 1, "\033[?25l");
                screen_draw_border(g_board_width, g_board_height);
                cy = my_div(PLAY_MIN_Y + g_play_max_y, 2);
                cx = my_div(g_board_width, 2);

                screen_draw_string(cx - 5, cy, "\033[1;31m GAME  OVER \033[0m");
                my_int_to_str(score, sbuf);
                screen_draw_string(cx - 5, cy + 1, " Score: \033[1;33m");
                screen_draw_string(cx + 3, cy + 1, sbuf);
                screen_draw_string(cx + 3 + my_strlen(sbuf), cy + 1, "\033[0m");
                my_int_to_str(g_high_score, sbuf);
                screen_draw_string(cx - 5, cy + 2, " Best:  \033[1;35m");
                screen_draw_string(cx + 3, cy + 2, sbuf);
                screen_draw_string(cx + 3 + my_strlen(sbuf), cy + 2, "\033[0m");
                screen_draw_string(cx - 11, cy + 4, " \033[1;32m[R]\033[0m Restart  \033[1;31m[Q]\033[0m Quit");

                for (ry = cy - 1; ry <= cy + 4; ry++) {
                    if (ry >= PLAY_MIN_Y && ry <= g_play_max_y) {
                        screen_draw_string(1, ry, "\033[1;36m|\033[0m");
                        screen_draw_string(g_board_width, ry, "\033[1;36m|\033[0m");
                    }
                }
                screen_move_cursor(1, g_board_height + 1);
                screen_present();
            }

            /* Wait loop WITH resize detection */
            while (1) {
                char k;
                int ntw, nth;

                /* Check for terminal resize */
                screen_get_size(&ntw, &nth);
                if (ntw != go_tw || nth != go_th) {
                    int ry, cy, cx;
                    char sbuf[16];
                    go_tw = ntw; go_th = nth;
                    calc_board(ntw, nth);

                    screen_clear();
                    screen_draw_string(1, 1, "\033[?25l");

                    if (g_board_width < MIN_BOARD_W || g_board_height < MIN_BOARD_H) {
                        screen_draw_string(1, 1, "\033[1;31mToo small! Resize.\033[0m");
                        screen_present();
                    } else {
                        screen_draw_border(g_board_width, g_board_height);
                        cy = my_div(PLAY_MIN_Y + g_play_max_y, 2);
                        cx = my_div(g_board_width, 2);
                        screen_draw_string(cx - 5, cy, "\033[1;31m GAME  OVER \033[0m");
                        my_int_to_str(score, sbuf);
                        screen_draw_string(cx - 5, cy + 1, " Score: \033[1;33m");
                        screen_draw_string(cx + 3, cy + 1, sbuf);
                        screen_draw_string(cx + 3 + my_strlen(sbuf), cy + 1, "\033[0m");
                        my_int_to_str(g_high_score, sbuf);
                        screen_draw_string(cx - 5, cy + 2, " Best:  \033[1;35m");
                        screen_draw_string(cx + 3, cy + 2, sbuf);
                        screen_draw_string(cx + 3 + my_strlen(sbuf), cy + 2, "\033[0m");
                        screen_draw_string(cx - 11, cy + 4, " \033[1;32m[R]\033[0m Restart  \033[1;31m[Q]\033[0m Quit");
                        for (ry = cy - 1; ry <= cy + 4; ry++) {
                            if (ry >= PLAY_MIN_Y && ry <= g_play_max_y) {
                                screen_draw_string(1, ry, "\033[1;36m|\033[0m");
                                screen_draw_string(g_board_width, ry, "\033[1;36m|\033[0m");
                            }
                        }
                        screen_move_cursor(1, g_board_height + 1);
                        screen_present();
                    }
                }

                if (key_pressed()) {
                    k = read_key();
                    if (k == 'q' || k == 'Q') { quit_game = 1; break; }
                    if (k == 'r' || k == 'R') break;
                }
                usleep(50000);
            }
        }
    }

    screen_clear();
    screen_move_cursor(1, 1);
    screen_draw_string(1, 1, "\033[?25h");
    screen_present();
    keyboard_restore();
    return 0;
}

