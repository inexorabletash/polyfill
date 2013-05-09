test("Basic substitutions", 52, function () {
  // Basic substitution: %s (string)
  strictEqual(sprintf("%s", "Hello world"), "Hello world");
  strictEqual(sprintf("%s", 65.432), "65.432");
  strictEqual(sprintf("%s", 69), "69");
  strictEqual(sprintf("%s", true), "true");

  // Basic substitution: %f (float)
  strictEqual(sprintf("%f", "Hello world"), "NaN");
  strictEqual(sprintf("%f", 65.432), "65.432");
  strictEqual(sprintf("%f", 69), "69");
  strictEqual(sprintf("%f", true), "1");

  // Basic substitution: %d (decimal integer)
  strictEqual(sprintf("%d", "Hello world"), "NaN");
  strictEqual(sprintf("%d", 65.432), "65");
  strictEqual(sprintf("%d", 69), "69");
  strictEqual(sprintf("%d", true), "1");

  // Basic substitution: %c (character)
  strictEqual(sprintf("%c", "Hello world"), "H");
  strictEqual(sprintf("%c", 65.432), "A");
  strictEqual(sprintf("%c", 69), "E");
  strictEqual(sprintf("%c", true), "t");

  // Floating point
  strictEqual(sprintf("%f", 0), "0");
  strictEqual(sprintf("%f", 1), "1");
  strictEqual(sprintf("%f", 10), "10");
  strictEqual(sprintf("%f", 123.456), "123.456");
  strictEqual(sprintf("%f", -1), "-1");
  strictEqual(sprintf("%f", -123.456), "-123.456");

  // Decimal integer
  strictEqual(sprintf("%d", 0), "0");
  strictEqual(sprintf("%d", 1), "1");
  strictEqual(sprintf("%d", 10), "10");
  strictEqual(sprintf("%d", 123.456), "123");
  strictEqual(sprintf("%d", -1), "-1");
  strictEqual(sprintf("%d", -123.456), "-123");

  // Octal
  strictEqual(sprintf("%o", 0), "0");
  strictEqual(sprintf("%o", 1), "1");
  strictEqual(sprintf("%o", 10), "12");
  strictEqual(sprintf("%o", 123.456), "173");
  strictEqual(sprintf("%o", -1), "-1");
  strictEqual(sprintf("%o", -123.456), "-173");

  // Binary
  strictEqual(sprintf("%b", 0), "0");
  strictEqual(sprintf("%b", 1), "1");
  strictEqual(sprintf("%b", 10), "1010");
  strictEqual(sprintf("%b", 123.456), "1111011");
  strictEqual(sprintf("%b", -1), "-1");
  strictEqual(sprintf("%b", -123.456), "-1111011");

  // Lower Hex
  strictEqual(sprintf("%x", 0), "0");
  strictEqual(sprintf("%x", 1), "1");
  strictEqual(sprintf("%x", 10), "a");
  strictEqual(sprintf("%x", 123.456), "7b");
  strictEqual(sprintf("%x", -1), "-1");
  strictEqual(sprintf("%x", -123.456), "-7b");

  // Upper Hex
  strictEqual(sprintf("%X", 0), "0");
  strictEqual(sprintf("%X", 1), "1");
  strictEqual(sprintf("%X", 10), "A");
  strictEqual(sprintf("%X", 123.456), "7B");
  strictEqual(sprintf("%X", -1), "-1");
  strictEqual(sprintf("%X", -123.456), "-7B");
});

test("Floating point precision", 72, function () {
  // Floating point precision (0)
  strictEqual(sprintf("%.0f", 0), "0");
  strictEqual(sprintf("%.0f", 1), "1");
  strictEqual(sprintf("%.0f", 10), "10");
  strictEqual(sprintf("%.0f", 123.456), "123");
  strictEqual(sprintf("%.0f", -1), "-1");
  strictEqual(sprintf("%.0f", -123.456), "-123");

  // Floating point precision (1)
  strictEqual(sprintf("%.1f", 0), "0.0");
  strictEqual(sprintf("%.1f", 1), "1.0");
  strictEqual(sprintf("%.1f", 10), "10.0");
  strictEqual(sprintf("%.1f", 123.456), "123.5");
  strictEqual(sprintf("%.1f", -1), "-1.0");
  strictEqual(sprintf("%.1f", -123.456), "-123.5");

  // Floating point precision (2)
  strictEqual(sprintf("%.2f", 0), "0.00");
  strictEqual(sprintf("%.2f", 1), "1.00");
  strictEqual(sprintf("%.2f", 10), "10.00");
  strictEqual(sprintf("%.2f", 123.456), "123.46");
  strictEqual(sprintf("%.2f", -1), "-1.00");
  strictEqual(sprintf("%.2f", -123.456), "-123.46");

  // Floating point precision (6)
  strictEqual(sprintf("%.6f", 0), "0.000000");
  strictEqual(sprintf("%.6f", 1), "1.000000");
  strictEqual(sprintf("%.6f", 10), "10.000000");
  strictEqual(sprintf("%.6f", 123.456), "123.456000");
  strictEqual(sprintf("%.6f", -1), "-1.000000");
  strictEqual(sprintf("%.6f", -123.456), "-123.456000");

  // Floating point width (2)
  strictEqual(sprintf("%2f", 0), " 0");
  strictEqual(sprintf("%2f", 1), " 1");
  strictEqual(sprintf("%2f", 10), "10");
  strictEqual(sprintf("%2f", 123.456), "123.456");
  strictEqual(sprintf("%2f", -1), "-1");
  strictEqual(sprintf("%2f", -123.456), "-123.456");

  // Floating point width (5)
  strictEqual(sprintf("%5f", 0), "    0");
  strictEqual(sprintf("%5f", 1), "    1");
  strictEqual(sprintf("%5f", 10), "   10");
  strictEqual(sprintf("%5f", 123.456), "123.456");
  strictEqual(sprintf("%5f", -1), "   -1");
  strictEqual(sprintf("%5f", -123.456), "-123.456");

  // Floating point width (2), left-align
  strictEqual(sprintf("%-2f", 0), "0 ");
  strictEqual(sprintf("%-2f", 1), "1 ");
  strictEqual(sprintf("%-2f", 10), "10");
  strictEqual(sprintf("%-2f", 123.456), "123.456");
  strictEqual(sprintf("%-2f", -1), "-1");
  strictEqual(sprintf("%-2f", -123.456), "-123.456");

  // Floating point width (5), left-align
  strictEqual(sprintf("%-5f", 0), "0    ");
  strictEqual(sprintf("%-5f", 1), "1    ");
  strictEqual(sprintf("%-5f", 10), "10   ");
  strictEqual(sprintf("%-5f", 123.456), "123.456");
  strictEqual(sprintf("%-5f", -1), "-1   ");
  strictEqual(sprintf("%-5f", -123.456), "-123.456");

  // Floating point width (2), zero-pad
  strictEqual(sprintf("%02f", 0), "00");
  strictEqual(sprintf("%02f", 1), "01");
  strictEqual(sprintf("%02f", 10), "10");
  strictEqual(sprintf("%02f", 123.456), "123.456");
  strictEqual(sprintf("%02f", -1), "-1");
  strictEqual(sprintf("%02f", -123.456), "-123.456");

  // Floating point width (5), zero-pad
  strictEqual(sprintf("%05f", 0), "00000");
  strictEqual(sprintf("%05f", 1), "00001");
  strictEqual(sprintf("%05f", 10), "00010");
  strictEqual(sprintf("%05f", 123.456), "123.456");
  strictEqual(sprintf("%05f", -1), "-0001");
  strictEqual(sprintf("%05f", -123.456), "-123.456");

  // Floating point width (2), zero-pad, left-align
  strictEqual(sprintf("%-02f", 0), "0 ");
  strictEqual(sprintf("%-02f", 1), "1 ");
  strictEqual(sprintf("%-02f", 10), "10");
  strictEqual(sprintf("%-02f", 123.456), "123.456");
  strictEqual(sprintf("%-02f", -1), "-1");
  strictEqual(sprintf("%-02f", -123.456), "-123.456");

  // Floating point width (5), zero-pad, left-align
  strictEqual(sprintf("%-05f", 0), "0    ");
  strictEqual(sprintf("%-05f", 1), "1    ");
  strictEqual(sprintf("%-05f", 10), "10   ");
  strictEqual(sprintf("%-05f", 123.456), "123.456");
  strictEqual(sprintf("%-05f", -1), "-1   ");
  strictEqual(sprintf("%-05f", -123.456), "-123.456");
});

test("Integer flags (align, padding, sign)", 24, function () {
  // Flags (align, padding, sign)
  strictEqual(sprintf("%3d", 0), "  0");
  strictEqual(sprintf("%3d", 1), "  1");
  strictEqual(sprintf("%3d", -1), " -1");
  strictEqual(sprintf("%03d", 0), "000");
  strictEqual(sprintf("%03d", 1), "001");
  strictEqual(sprintf("%03d", -1), "-01");
  strictEqual(sprintf("%-3d", 0), "0  ");
  strictEqual(sprintf("%-3d", 1), "1  ");
  strictEqual(sprintf("%-3d", -1), "-1 ");
  strictEqual(sprintf("%-03d", 0), "0  ");
  strictEqual(sprintf("%-03d", 1), "1  ");
  strictEqual(sprintf("%-03d", -1), "-1 ");
  strictEqual(sprintf("%+3d", 0), " +0");
  strictEqual(sprintf("%+3d", 1), " +1");
  strictEqual(sprintf("%+3d", -1), " -1");
  strictEqual(sprintf("%+03d", 0), "+00");
  strictEqual(sprintf("%+03d", 1), "+01");
  strictEqual(sprintf("%+03d", -1), "-01");
  strictEqual(sprintf("%-+3d", 0), "+0 ");
  strictEqual(sprintf("%-+3d", 1), "+1 ");
  strictEqual(sprintf("%-+3d", -1), "-1 ");
  strictEqual(sprintf("%-+03d", 0), "+0 ");
  strictEqual(sprintf("%-+03d", 1), "+1 ");
  strictEqual(sprintf("%-+03d", -1), "-1 ");
});

test("Floating point flags (align, padding, sign)", 12, function () {
  // Floating point, width, padding, precision
  strictEqual(sprintf("%7.2f", 12.34), "  12.34");
  strictEqual(sprintf("%7.2f", -12.34), " -12.34");
  strictEqual(sprintf("%7.2f", 12), "  12.00");
  strictEqual(sprintf("%7.2f", 0.34), "   0.34");
  strictEqual(sprintf("%7.0f", 12.34), "     12");
  strictEqual(sprintf("%7.0f", -12.34), "    -12");
  strictEqual(sprintf("%7.0f", 12), "     12");
  strictEqual(sprintf("%7.0f", 0.34), "      0");
  strictEqual(sprintf("%07.2f", 12.34), "0012.34");
  strictEqual(sprintf("%07.2f", -12.34), "-012.34");
  strictEqual(sprintf("%07.2f", 12), "0012.00");
  strictEqual(sprintf("%07.2f", 0.34), "0000.34");
  // TODO: need more here
});

test("String flags (align, padding)", 18, function () {
  // String width
  strictEqual(sprintf("|%s|\n", "test"), "|test|\n");
  strictEqual(sprintf("|%s|\n", "test but longer"), "|test but longer|\n");
  strictEqual(sprintf("|%2s|\n", "test"), "|test|\n");
  strictEqual(sprintf("|%2s|\n", "test but longer"), "|test but longer|\n");
  strictEqual(sprintf("|%-2s|\n", "test"), "|test|\n");
  strictEqual(sprintf("|%-2s|\n", "test but longer"), "|test but longer|\n");
  strictEqual(sprintf("|%20s|\n", "test"), "|                test|\n");
  strictEqual(sprintf("|%20s|\n", "test but longer"), "|     test but longer|\n");
  strictEqual(sprintf("|%-20s|\n", "test"), "|test                |\n");
  strictEqual(sprintf("|%-20s|\n", "test but longer"), "|test but longer     |\n");

  // String width and precision
  strictEqual(sprintf("|%2.2s|\n", "test"), "|te|\n");
  strictEqual(sprintf("|%2.2s|\n", "test but longer"), "|te|\n");
  strictEqual(sprintf("|%-2.2s|\n", "test"), "|te|\n");
  strictEqual(sprintf("|%-2.2s|\n", "test but longer"), "|te|\n");
  strictEqual(sprintf("|%20.2s|\n", "test"), "|                  te|\n");
  strictEqual(sprintf("|%20.2s|\n", "test but longer"), "|                  te|\n");
  strictEqual(sprintf("|%-20.2s|\n", "test"), "|te                  |\n");
  strictEqual(sprintf("|%-20.2s|\n", "test but longer"), "|te                  |\n");
});

test("Regression tests", function() {
  strictEqual(sprintf("%.0f", 123.456), "123");
});

