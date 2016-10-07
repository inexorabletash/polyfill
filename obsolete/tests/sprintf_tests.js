/*global QUnit, sprintf*/

QUnit.test("Basic substitutions", function(assert) {
  assert.expect(52);

  // Basic substitution: %s (string)
  assert.deepEqual(sprintf("%s", "Hello world"), "Hello world");
  assert.deepEqual(sprintf("%s", 65.432), "65.432");
  assert.deepEqual(sprintf("%s", 69), "69");
  assert.deepEqual(sprintf("%s", true), "true");

  // Basic substitution: %f (float)
  assert.deepEqual(sprintf("%f", "Hello world"), "NaN");
  assert.deepEqual(sprintf("%f", 65.432), "65.432");
  assert.deepEqual(sprintf("%f", 69), "69");
  assert.deepEqual(sprintf("%f", true), "1");

  // Basic substitution: %d (decimal integer)
  assert.deepEqual(sprintf("%d", "Hello world"), "NaN");
  assert.deepEqual(sprintf("%d", 65.432), "65");
  assert.deepEqual(sprintf("%d", 69), "69");
  assert.deepEqual(sprintf("%d", true), "1");

  // Basic substitution: %c (character)
  assert.deepEqual(sprintf("%c", "Hello world"), "H");
  assert.deepEqual(sprintf("%c", 65.432), "A");
  assert.deepEqual(sprintf("%c", 69), "E");
  assert.deepEqual(sprintf("%c", true), "t");

  // Floating point
  assert.deepEqual(sprintf("%f", 0), "0");
  assert.deepEqual(sprintf("%f", 1), "1");
  assert.deepEqual(sprintf("%f", 10), "10");
  assert.deepEqual(sprintf("%f", 123.456), "123.456");
  assert.deepEqual(sprintf("%f", -1), "-1");
  assert.deepEqual(sprintf("%f", -123.456), "-123.456");

  // Decimal integer
  assert.deepEqual(sprintf("%d", 0), "0");
  assert.deepEqual(sprintf("%d", 1), "1");
  assert.deepEqual(sprintf("%d", 10), "10");
  assert.deepEqual(sprintf("%d", 123.456), "123");
  assert.deepEqual(sprintf("%d", -1), "-1");
  assert.deepEqual(sprintf("%d", -123.456), "-123");

  // Octal
  assert.deepEqual(sprintf("%o", 0), "0");
  assert.deepEqual(sprintf("%o", 1), "1");
  assert.deepEqual(sprintf("%o", 10), "12");
  assert.deepEqual(sprintf("%o", 123.456), "173");
  assert.deepEqual(sprintf("%o", -1), "-1");
  assert.deepEqual(sprintf("%o", -123.456), "-173");

  // Binary
  assert.deepEqual(sprintf("%b", 0), "0");
  assert.deepEqual(sprintf("%b", 1), "1");
  assert.deepEqual(sprintf("%b", 10), "1010");
  assert.deepEqual(sprintf("%b", 123.456), "1111011");
  assert.deepEqual(sprintf("%b", -1), "-1");
  assert.deepEqual(sprintf("%b", -123.456), "-1111011");

  // Lower Hex
  assert.deepEqual(sprintf("%x", 0), "0");
  assert.deepEqual(sprintf("%x", 1), "1");
  assert.deepEqual(sprintf("%x", 10), "a");
  assert.deepEqual(sprintf("%x", 123.456), "7b");
  assert.deepEqual(sprintf("%x", -1), "-1");
  assert.deepEqual(sprintf("%x", -123.456), "-7b");

  // Upper Hex
  assert.deepEqual(sprintf("%X", 0), "0");
  assert.deepEqual(sprintf("%X", 1), "1");
  assert.deepEqual(sprintf("%X", 10), "A");
  assert.deepEqual(sprintf("%X", 123.456), "7B");
  assert.deepEqual(sprintf("%X", -1), "-1");
  assert.deepEqual(sprintf("%X", -123.456), "-7B");
});

QUnit.test("Floating point precision", function(assert) {
  assert.expect(72);

  // Floating point precision (0)
  assert.deepEqual(sprintf("%.0f", 0), "0");
  assert.deepEqual(sprintf("%.0f", 1), "1");
  assert.deepEqual(sprintf("%.0f", 10), "10");
  assert.deepEqual(sprintf("%.0f", 123.456), "123");
  assert.deepEqual(sprintf("%.0f", -1), "-1");
  assert.deepEqual(sprintf("%.0f", -123.456), "-123");

  // Floating point precision (1)
  assert.deepEqual(sprintf("%.1f", 0), "0.0");
  assert.deepEqual(sprintf("%.1f", 1), "1.0");
  assert.deepEqual(sprintf("%.1f", 10), "10.0");
  assert.deepEqual(sprintf("%.1f", 123.456), "123.5");
  assert.deepEqual(sprintf("%.1f", -1), "-1.0");
  assert.deepEqual(sprintf("%.1f", -123.456), "-123.5");

  // Floating point precision (2)
  assert.deepEqual(sprintf("%.2f", 0), "0.00");
  assert.deepEqual(sprintf("%.2f", 1), "1.00");
  assert.deepEqual(sprintf("%.2f", 10), "10.00");
  assert.deepEqual(sprintf("%.2f", 123.456), "123.46");
  assert.deepEqual(sprintf("%.2f", -1), "-1.00");
  assert.deepEqual(sprintf("%.2f", -123.456), "-123.46");

  // Floating point precision (6)
  assert.deepEqual(sprintf("%.6f", 0), "0.000000");
  assert.deepEqual(sprintf("%.6f", 1), "1.000000");
  assert.deepEqual(sprintf("%.6f", 10), "10.000000");
  assert.deepEqual(sprintf("%.6f", 123.456), "123.456000");
  assert.deepEqual(sprintf("%.6f", -1), "-1.000000");
  assert.deepEqual(sprintf("%.6f", -123.456), "-123.456000");

  // Floating point width (2)
  assert.deepEqual(sprintf("%2f", 0), " 0");
  assert.deepEqual(sprintf("%2f", 1), " 1");
  assert.deepEqual(sprintf("%2f", 10), "10");
  assert.deepEqual(sprintf("%2f", 123.456), "123.456");
  assert.deepEqual(sprintf("%2f", -1), "-1");
  assert.deepEqual(sprintf("%2f", -123.456), "-123.456");

  // Floating point width (5)
  assert.deepEqual(sprintf("%5f", 0), "    0");
  assert.deepEqual(sprintf("%5f", 1), "    1");
  assert.deepEqual(sprintf("%5f", 10), "   10");
  assert.deepEqual(sprintf("%5f", 123.456), "123.456");
  assert.deepEqual(sprintf("%5f", -1), "   -1");
  assert.deepEqual(sprintf("%5f", -123.456), "-123.456");

  // Floating point width (2), left-align
  assert.deepEqual(sprintf("%-2f", 0), "0 ");
  assert.deepEqual(sprintf("%-2f", 1), "1 ");
  assert.deepEqual(sprintf("%-2f", 10), "10");
  assert.deepEqual(sprintf("%-2f", 123.456), "123.456");
  assert.deepEqual(sprintf("%-2f", -1), "-1");
  assert.deepEqual(sprintf("%-2f", -123.456), "-123.456");

  // Floating point width (5), left-align
  assert.deepEqual(sprintf("%-5f", 0), "0    ");
  assert.deepEqual(sprintf("%-5f", 1), "1    ");
  assert.deepEqual(sprintf("%-5f", 10), "10   ");
  assert.deepEqual(sprintf("%-5f", 123.456), "123.456");
  assert.deepEqual(sprintf("%-5f", -1), "-1   ");
  assert.deepEqual(sprintf("%-5f", -123.456), "-123.456");

  // Floating point width (2), zero-pad
  assert.deepEqual(sprintf("%02f", 0), "00");
  assert.deepEqual(sprintf("%02f", 1), "01");
  assert.deepEqual(sprintf("%02f", 10), "10");
  assert.deepEqual(sprintf("%02f", 123.456), "123.456");
  assert.deepEqual(sprintf("%02f", -1), "-1");
  assert.deepEqual(sprintf("%02f", -123.456), "-123.456");

  // Floating point width (5), zero-pad
  assert.deepEqual(sprintf("%05f", 0), "00000");
  assert.deepEqual(sprintf("%05f", 1), "00001");
  assert.deepEqual(sprintf("%05f", 10), "00010");
  assert.deepEqual(sprintf("%05f", 123.456), "123.456");
  assert.deepEqual(sprintf("%05f", -1), "-0001");
  assert.deepEqual(sprintf("%05f", -123.456), "-123.456");

  // Floating point width (2), zero-pad, left-align
  assert.deepEqual(sprintf("%-02f", 0), "0 ");
  assert.deepEqual(sprintf("%-02f", 1), "1 ");
  assert.deepEqual(sprintf("%-02f", 10), "10");
  assert.deepEqual(sprintf("%-02f", 123.456), "123.456");
  assert.deepEqual(sprintf("%-02f", -1), "-1");
  assert.deepEqual(sprintf("%-02f", -123.456), "-123.456");

  // Floating point width (5), zero-pad, left-align
  assert.deepEqual(sprintf("%-05f", 0), "0    ");
  assert.deepEqual(sprintf("%-05f", 1), "1    ");
  assert.deepEqual(sprintf("%-05f", 10), "10   ");
  assert.deepEqual(sprintf("%-05f", 123.456), "123.456");
  assert.deepEqual(sprintf("%-05f", -1), "-1   ");
  assert.deepEqual(sprintf("%-05f", -123.456), "-123.456");
});

QUnit.test("Integer flags (align, padding, sign)", function(assert) {
  assert.expect(24);

  // Flags (align, padding, sign)
  assert.deepEqual(sprintf("%3d", 0), "  0");
  assert.deepEqual(sprintf("%3d", 1), "  1");
  assert.deepEqual(sprintf("%3d", -1), " -1");
  assert.deepEqual(sprintf("%03d", 0), "000");
  assert.deepEqual(sprintf("%03d", 1), "001");
  assert.deepEqual(sprintf("%03d", -1), "-01");
  assert.deepEqual(sprintf("%-3d", 0), "0  ");
  assert.deepEqual(sprintf("%-3d", 1), "1  ");
  assert.deepEqual(sprintf("%-3d", -1), "-1 ");
  assert.deepEqual(sprintf("%-03d", 0), "0  ");
  assert.deepEqual(sprintf("%-03d", 1), "1  ");
  assert.deepEqual(sprintf("%-03d", -1), "-1 ");
  assert.deepEqual(sprintf("%+3d", 0), " +0");
  assert.deepEqual(sprintf("%+3d", 1), " +1");
  assert.deepEqual(sprintf("%+3d", -1), " -1");
  assert.deepEqual(sprintf("%+03d", 0), "+00");
  assert.deepEqual(sprintf("%+03d", 1), "+01");
  assert.deepEqual(sprintf("%+03d", -1), "-01");
  assert.deepEqual(sprintf("%-+3d", 0), "+0 ");
  assert.deepEqual(sprintf("%-+3d", 1), "+1 ");
  assert.deepEqual(sprintf("%-+3d", -1), "-1 ");
  assert.deepEqual(sprintf("%-+03d", 0), "+0 ");
  assert.deepEqual(sprintf("%-+03d", 1), "+1 ");
  assert.deepEqual(sprintf("%-+03d", -1), "-1 ");
});

QUnit.test("Floating point flags (align, padding, sign)", function(assert) {
  assert.expect(12);

  // Floating point, width, padding, precision
  assert.deepEqual(sprintf("%7.2f", 12.34), "  12.34");
  assert.deepEqual(sprintf("%7.2f", -12.34), " -12.34");
  assert.deepEqual(sprintf("%7.2f", 12), "  12.00");
  assert.deepEqual(sprintf("%7.2f", 0.34), "   0.34");
  assert.deepEqual(sprintf("%7.0f", 12.34), "     12");
  assert.deepEqual(sprintf("%7.0f", -12.34), "    -12");
  assert.deepEqual(sprintf("%7.0f", 12), "     12");
  assert.deepEqual(sprintf("%7.0f", 0.34), "      0");
  assert.deepEqual(sprintf("%07.2f", 12.34), "0012.34");
  assert.deepEqual(sprintf("%07.2f", -12.34), "-012.34");
  assert.deepEqual(sprintf("%07.2f", 12), "0012.00");
  assert.deepEqual(sprintf("%07.2f", 0.34), "0000.34");
  // TODO: need more here
});

QUnit.test("String flags (align, padding)", function(assert) {
  assert.expect(18);

  // String width
  assert.deepEqual(sprintf("|%s|\n", "test"), "|test|\n");
  assert.deepEqual(sprintf("|%s|\n", "test but longer"), "|test but longer|\n");
  assert.deepEqual(sprintf("|%2s|\n", "test"), "|test|\n");
  assert.deepEqual(sprintf("|%2s|\n", "test but longer"), "|test but longer|\n");
  assert.deepEqual(sprintf("|%-2s|\n", "test"), "|test|\n");
  assert.deepEqual(sprintf("|%-2s|\n", "test but longer"), "|test but longer|\n");
  assert.deepEqual(sprintf("|%20s|\n", "test"), "|                test|\n");
  assert.deepEqual(sprintf("|%20s|\n", "test but longer"), "|     test but longer|\n");
  assert.deepEqual(sprintf("|%-20s|\n", "test"), "|test                |\n");
  assert.deepEqual(sprintf("|%-20s|\n", "test but longer"), "|test but longer     |\n");

  // String width and precision
  assert.deepEqual(sprintf("|%2.2s|\n", "test"), "|te|\n");
  assert.deepEqual(sprintf("|%2.2s|\n", "test but longer"), "|te|\n");
  assert.deepEqual(sprintf("|%-2.2s|\n", "test"), "|te|\n");
  assert.deepEqual(sprintf("|%-2.2s|\n", "test but longer"), "|te|\n");
  assert.deepEqual(sprintf("|%20.2s|\n", "test"), "|                  te|\n");
  assert.deepEqual(sprintf("|%20.2s|\n", "test but longer"), "|                  te|\n");
  assert.deepEqual(sprintf("|%-20.2s|\n", "test"), "|te                  |\n");
  assert.deepEqual(sprintf("|%-20.2s|\n", "test but longer"), "|te                  |\n");
});

QUnit.test("Regression tests", function(assert) {
  assert.deepEqual(sprintf("%.0f", 123.456), "123");
});
