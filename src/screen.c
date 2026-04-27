#include "../include/screen.h"
#include "../include/string.h"

#include <stdio.h>
#include <sys/ioctl.h>
#include <unistd.h>

/* Writes a null-terminated string to stdout using character output only. */
static void write_text(const char *s)
{
    while (*s != '\0') {
        putchar(*s);
        s++;
    }
}

/* Clears terminal screen, scrollback buffer, and places cursor at top-left. */
void screen_clear(void)
{
	write_text("\033[2J");
	write_text("\033[3J");
	write_text("\033[1;1H");
	fflush(stdout);
}

/* Moves the cursor to column x and row y. */
void screen_move_cursor(int x, int y)
{
	char xbuf[12];
	char ybuf[12];

	if (x < 1) {
		x = 1;
	}

	if (y < 1) {
		y = 1;
	}

	my_int_to_str(y, ybuf);
	my_int_to_str(x, xbuf);

	write_text("\033[");
	write_text(ybuf);
	putchar(';');
	write_text(xbuf);
	putchar('H');
}

/* Draws a single character at the given coordinate. */
void screen_draw_char(int x, int y, char c)
{
	screen_move_cursor(x, y);
	putchar(c);
}

/* Draws a string at the given coordinate. */
void screen_draw_string(int x, int y, const char *s)
{
	screen_move_cursor(x, y);
	while (*s != '\0') {
		putchar(*s);
		s++;
	}
}

/* Helper: draw a full horizontal line at row y. */
static void draw_hline(int width, int y)
{
	int i;

	screen_move_cursor(1, y);
	putchar('+');
	for (i = 2; i < width; i++) {
		putchar('-');
	}
	putchar('+');
}

/* Draws a vibrant border box with +, -, | characters. */
void screen_draw_border(int width, int height)
{
	int i;

	if (width < 2 || height < 2) {
		return;
	}

	write_text("\033[1;36m"); /* Bold Cyan borders */

	/* Top border (row 1) */
	draw_hline(width, 1);

	/* Score separator (row 3) */
	draw_hline(width, 3);

	/* Bottom border (row height) */
	draw_hline(width, height);

	/* Score row side bars */
	screen_draw_char(1, 2, '|');
	screen_draw_char(width, 2, '|');

	/* Play area side bars (row 4 to row height-1) */
	for (i = 4; i < height; i++) {
		screen_draw_char(1, i, '|');
		screen_draw_char(width, i, '|');
	}

	write_text("\033[0m"); /* Reset */
}

/* Flushes pending terminal output for the current frame. */
void screen_present(void)
{
	fflush(stdout);
}

/* Gets the current terminal dimensions dynamically. */
void screen_get_size(int *width, int *height)
{
	struct winsize w;
	if (ioctl(STDOUT_FILENO, TIOCGWINSZ, &w) == 0) {
		*width = w.ws_col;
		*height = w.ws_row;
	} else {
		*width = 40; /* Fallback */
		*height = 20;
	}
}

/* No-op kept for API compat. */
void screen_set_offset(int x, int y)
{
	(void)x;
	(void)y;
}
