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

#define FOOD_CHAR '*'

/* Cap board dimensions so it stays playable */
#define MAX_BOARD_W 50
#define MAX_BOARD_H 18
#define MIN_BOARD_W 20
#define MIN_BOARD_H 8

static int g_board_width = 40;
static int g_board_height = 18;
static int g_play_max_x = 39;
static int g_play_max_y = 17;
static int g_level = 1;

/*
 * Tail linked-list implementation (no arrays):
 * Each Segment node is allocated from VRAM via my_alloc() and freed via my_dealloc().
 */
typedef struct Segment {
    int x;
    int y;
    struct Segment *next;
} Segment;

/* Required globals */
Segment *snake_head = 0;
int snake_length = 0;

void tail_push_front(int x, int y)
{
    Segment *node;

    node = (Segment *)my_alloc((int)sizeof(Segment));
    if (node == 0) {
        return;
    }

    node->x = x;
    node->y = y;
    node->next = snake_head;
    snake_head = node;
    snake_length += 1;
}

void tail_pop_back(void)
{
    Segment *prev;
    Segment *cur;

    if (snake_head == 0) {
        return;
    }

    if (snake_head->next == 0) {
        screen_draw_char(snake_head->x, snake_head->y, ' ');
        my_dealloc((void *)snake_head);
        snake_head = 0;
        snake_length = 0;
        return;
    }

    prev = snake_head;
    cur = snake_head->next;
    while (cur->next != 0) {
        prev = cur;
        cur = cur->next;
    }

    prev->next = 0;
    screen_draw_char(cur->x, cur->y, ' ');
    my_dealloc((void *)cur);
    snake_length -= 1;
}

void tail_draw(void)
{
    Segment *cur;

    cur = snake_head;
    while (cur != 0) {
        screen_draw_string(cur->x, cur->y, "\033[1;32mo\033[0m");
        cur = cur->next;
    }
}

int tail_collides(int x, int y)
{
    Segment *cur;

    cur = snake_head;
    while (cur != 0) {
        if (cur->x == x && cur->y == y) {
            return 1;
        }
        cur = cur->next;
    }

    return 0;
}

typedef struct Snake {
    int x;
    int y;
    char direction;
} Snake;

typedef struct Food {
    int x;
    int y;
} Food;

static unsigned int g_rng_state = 1U;

static unsigned int next_rand(void)
{
    g_rng_state = g_rng_state * 1103515245U + 12345U;
    return g_rng_state;
}

static void seed_rng(void)
{
    unsigned int seed;

    seed = ((unsigned int)time(0)) ^ ((unsigned int)(uintptr_t)&seed);
    if (seed == 0U) {
        seed = 1U;
    }
    g_rng_state = seed;
}

static void draw_score_row(int width, int score, int level)
{
    int x;
    char score_num[16];
    char level_num[16];
    char buf[64];
    int pos;

    /* Clear score row */
    x = 2;
    while (x <= width - 1) {
        screen_draw_char(x, SCORE_ROW, ' ');
        x++;
    }

    /* Side borders */
    screen_draw_string(1, SCORE_ROW, "\033[1;36m|\033[0m");
    screen_draw_string(width, SCORE_ROW, "\033[1;36m|\033[0m");

    /* Build HUD text */
    my_int_to_str(score, score_num);
    my_int_to_str(level, level_num);

    pos = 0;
    my_strcpy(buf + pos, " SCORE: ");
    pos += 8;
    my_strcpy(buf + pos, score_num);
    pos += my_strlen(score_num);
    my_strcpy(buf + pos, "  |  LEVEL: ");
    pos += 12;
    my_strcpy(buf + pos, level_num);
    pos += my_strlen(level_num);
    buf[pos] = '\0';

    screen_draw_string(2, SCORE_ROW, "\033[1;33m");
    screen_draw_string(2, SCORE_ROW, buf);
    screen_draw_string(2 + pos, SCORE_ROW, "\033[0m");
}

static int place_food(Food *food, const Snake *snake)
{
    int x;
    int y;
    int tries;
    int total;
    int range_x;
    int range_y;

    range_x = g_play_max_x - PLAY_MIN_X + 1;
    range_y = g_play_max_y - PLAY_MIN_Y + 1;
    if (range_x < 1 || range_y < 1) {
        return 0;
    }
    total = my_mul(range_x, range_y);

    tries = 0;
    while (tries < total) {
        tries += 1;
        x = my_mod(my_abs((int)next_rand()), range_x) + PLAY_MIN_X;
        y = my_mod(my_abs((int)next_rand()), range_y) + PLAY_MIN_Y;

        if ((x == snake->x && y == snake->y) || tail_collides(x, y)) {
            continue;
        }

        food->x = x;
        food->y = y;
        return 1;
    }

    y = PLAY_MIN_Y;
    while (y <= g_play_max_y) {
        x = PLAY_MIN_X;
        while (x <= g_play_max_x) {
            if ((x != snake->x || y != snake->y) && !tail_collides(x, y)) {
                food->x = x;
                food->y = y;
                return 1;
            }
            x += 1;
        }
        y += 1;
    }

    return 0;
}

static void delay_one_tick(char direction)
{
    int base_delay;
    int delay;
    int min_delay;

    if (direction == 'W' || direction == 'S') {
        base_delay = 180000;
    } else {
        base_delay = 90000;
    }

    delay = base_delay - my_mul(g_level - 1, my_div(base_delay, 10));
    min_delay = my_div(base_delay, 4);

    if (delay < min_delay) {
        delay = min_delay;
    }

    usleep(delay);
}

static void update_direction(Snake *snake, char key)
{
    if ((key == 'w' || key == 'W') && snake->direction != 'S') {
        snake->direction = 'W';
    }

    if ((key == 'a' || key == 'A') && snake->direction != 'D') {
        snake->direction = 'A';
    }

    if ((key == 's' || key == 'S') && snake->direction != 'W') {
        snake->direction = 'S';
    }

    if ((key == 'd' || key == 'D') && snake->direction != 'A') {
        snake->direction = 'D';
    }
}

static int move_snake(Snake *snake)
{
    int nx;
    int ny;

    nx = snake->x;
    ny = snake->y;

    if (snake->direction == 'W') {
        ny -= 1;
    }

    if (snake->direction == 'A') {
        nx -= 1;
    }

    if (snake->direction == 'S') {
        ny += 1;
    }

    if (snake->direction == 'D') {
        nx += 1;
    }

    if (nx < PLAY_MIN_X || nx > g_play_max_x || ny < PLAY_MIN_Y || ny > g_play_max_y) {
        return 0;
    }

    snake->x = nx;
    snake->y = ny;
    return 1;
}

int main(void)
{
    int quit_game;
    int term_w;
    int term_h;

    quit_game = 0;

    memory_init();
    keyboard_init();
    seed_rng();

    while (!quit_game) {
        Snake *snake;
        Food food;
        int running;
        int old_x;
        int old_y;
        int score;

        screen_get_size(&term_w, &term_h);

        /*
         * Responsive sizing: use terminal size but cap to keep it playable.
         * Subtract 1 from width to avoid last-column wrapping artifacts.
         * Subtract 1 from height to leave cursor parking row.
         */
        if (term_w - 1 < MAX_BOARD_W) {
            g_board_width = term_w - 1;
        } else {
            g_board_width = MAX_BOARD_W;
        }

        if (term_h - 1 < MAX_BOARD_H) {
            g_board_height = term_h - 1;
        } else {
            g_board_height = MAX_BOARD_H;
        }

        if (g_board_width < MIN_BOARD_W || g_board_height < MIN_BOARD_H) {
            screen_clear();
            screen_draw_string(1, 1, "\033[1;31mTerminal too small! Resize.\033[0m");
            screen_present();
            while (!key_pressed()) {
                usleep(100000);
            }
            read_key();
            continue;
        }

        /*
         * Layout:
         *   Row 1:              top border   (+---+)
         *   Row 2:              score bar    (|   |)
         *   Row 3:              separator    (+---+)
         *   Row 4 .. height-1:  play area    (|   |)
         *   Row height:         bot border   (+---+)
         */
        g_play_max_x = g_board_width - 1;
        g_play_max_y = g_board_height - 1;

        snake = (Snake *)my_alloc((int)sizeof(Snake));
        if (snake == 0) {
            keyboard_restore();
            return 1;
        }

        snake->x = my_div(g_board_width, 2);
        snake->y = my_div(PLAY_MIN_Y + g_play_max_y, 2);
        snake->direction = 'D';
        running = 1;
        old_x = snake->x;
        old_y = snake->y;
        score = 0;
        g_level = 1;

        if (!place_food(&food, snake)) {
            my_dealloc((void *)snake);
            keyboard_restore();
            return 1;
        }

        screen_clear();
        screen_draw_string(1, 1, "\033[?25l");
        screen_draw_border(g_board_width, g_board_height);
        draw_score_row(g_board_width, score, g_level);
        screen_draw_string(snake->x, snake->y, "\033[1;32m@\033[0m");
        screen_draw_string(food.x, food.y, "\033[1;31m*\033[0m");
        screen_move_cursor(1, g_board_height + 1);
        screen_present();

        while (running) {
            char key;

            if (key_pressed()) {
                key = read_key();
                if (key == 'q' || key == 'Q') {
                    running = 0;
                    quit_game = 1;
                }
                update_direction(snake, key);
            }

            if (!running) {
                break;
            }

            old_x = snake->x;
            old_y = snake->y;
            if (!move_snake(snake)) {
                running = 0;
            }

            if (old_x != snake->x || old_y != snake->y) {
                int ate;

                ate = 0;
                if (snake->x == food.x && snake->y == food.y) {
                    score += 1;
                    g_level = my_div(score, 3) + 1;
                    ate = 1;
                    draw_score_row(g_board_width, score, g_level);
                    if (!place_food(&food, snake)) {
                        running = 0;
                    } else {
                        screen_draw_string(food.x, food.y, "\033[1;31m*\033[0m");
                    }
                }

                tail_push_front(old_x, old_y);

                if (!ate) {
                    while (snake_length > score) {
                        tail_pop_back();
                    }
                }

                if (tail_collides(snake->x, snake->y)) {
                    running = 0;
                }
            }

            tail_draw();
            screen_draw_string(snake->x, snake->y, "\033[1;32m@\033[0m");
            screen_move_cursor(1, g_board_height + 1);
            screen_present();

            if (!running) {
                break;
            }

            delay_one_tick(snake->direction);
        }

        /* Free remaining tail */
        while (snake_head != 0) {
            tail_pop_back();
        }
        my_dealloc((void *)snake);

        /* ---- Simple Game Over screen ---- */
        if (!quit_game) {
            int rx;
            int ry;
            int cy;
            int cx;
            char sbuf[16];

            cy = my_div(PLAY_MIN_Y + g_play_max_y, 2);
            cx = my_div(g_board_width, 2);

            /* Clear center rows */
            for (ry = cy - 1; ry <= cy + 3; ry++) {
                if (ry >= PLAY_MIN_Y && ry <= g_play_max_y) {
                    for (rx = 2; rx < g_board_width; rx++) {
                        screen_draw_char(rx, ry, ' ');
                    }
                }
            }

            /* GAME OVER */
            screen_draw_string(cx - 5, cy, "\033[1;31m GAME OVER \033[0m");

            /* Final Score */
            my_int_to_str(score, sbuf);
            screen_draw_string(cx - 5, cy + 1, " Score: \033[1;33m");
            screen_draw_string(cx + 3, cy + 1, sbuf);
            screen_draw_string(cx + 3 + my_strlen(sbuf), cy + 1, "\033[0m");

            /* Options */
            screen_draw_string(cx - 10, cy + 3, " \033[1;32m[R]\033[0m Restart  \033[1;31m[Q]\033[0m Quit");

            /* Fix side borders */
            for (ry = cy - 1; ry <= cy + 3; ry++) {
                if (ry >= PLAY_MIN_Y && ry <= g_play_max_y) {
                    screen_draw_string(1, ry, "\033[1;36m|\033[0m");
                    screen_draw_string(g_board_width, ry, "\033[1;36m|\033[0m");
                }
            }

            screen_move_cursor(1, g_board_height + 1);
            screen_present();

            /* Wait for R or Q */
            while (1) {
                char k;
                if (key_pressed()) {
                    k = read_key();
                    if (k == 'q' || k == 'Q') {
                        quit_game = 1;
                        break;
                    }
                    if (k == 'r' || k == 'R') {
                        break;
                    }
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
