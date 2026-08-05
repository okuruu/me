<?php
/**
 * Generates the QRIS placeholder printed on the UD84 nota.
 *
 * Run from the repo root:  php scripts/generate-qris-placeholder.php
 * Output:                  static/images/qris.png
 *
 * The image is deliberately overprinted with "QRIS PLACEHOLDER" and
 * "BUKAN KODE ASLI" so it cannot be mistaken for a scannable code if it
 * reaches production before the real merchant QRIS is issued.
 *
 * To install the real QRIS: overwrite static/images/qris.png. No code change.
 *
 * This file lives outside static/ on purpose — anything under static/ is
 * served verbatim, and a .php file there would be published as source.
 */

$size    = 600;
$modules = 25;
$font    = __DIR__.'/../static/fonts/Inter-Bold.ttf';
$output  = __DIR__.'/../static/images/qris.png';

if (!extension_loaded('gd')) {
    fwrite(STDERR, "GD extension is required\n");
    exit(1);
}
if (!is_file($font)) {
    fwrite(STDERR, "Font not found: $font\n");
    exit(1);
}

$img   = imagecreatetruecolor($size, $size);
$white = imagecolorallocate($img, 255, 255, 255);
$black = imagecolorallocate($img, 0, 0, 0);
imagefilledrectangle($img, 0, 0, $size, $size, $white);

$cell   = intdiv($size, $modules + 2);
$offset = $cell;

// Deterministic module grid, so regenerating produces an identical file.
mt_srand(8484);
for ($y = 0; $y < $modules; $y++) {
    for ($x = 0; $x < $modules; $x++) {
        if (mt_rand(0, 1) === 1) {
            imagefilledrectangle(
                $img,
                $offset + $x * $cell,
                $offset + $y * $cell,
                $offset + ($x + 1) * $cell - 1,
                $offset + ($y + 1) * $cell - 1,
                $black
            );
        }
    }
}

// Position markers, as on a real QR code.
$marker = function (int $px, int $py) use ($img, $cell, $black, $white): void {
    imagefilledrectangle($img, $px, $py, $px + 7 * $cell, $py + 7 * $cell, $black);
    imagefilledrectangle($img, $px + $cell, $py + $cell, $px + 6 * $cell, $py + 6 * $cell, $white);
    imagefilledrectangle($img, $px + 2 * $cell, $py + 2 * $cell, $px + 5 * $cell, $py + 5 * $cell, $black);
};
$marker($offset, $offset);
$marker($offset + ($modules - 7) * $cell, $offset);
$marker($offset, $offset + ($modules - 7) * $cell);

// Warning band across the middle.
$bandTop    = intdiv($size, 2) - 60;
$bandBottom = $bandTop + 120;
imagefilledrectangle($img, 0, $bandTop, $size, $bandBottom, $white);
imagefilledrectangle($img, 0, $bandTop, $size, $bandTop + 4, $black);
imagefilledrectangle($img, 0, $bandBottom - 4, $size, $bandBottom, $black);

$centre = function (string $text, int $pt, int $baseline) use ($img, $font, $black, $size): void {
    $box   = imagettfbbox($pt, 0, $font, $text);
    $width = $box[2] - $box[0];
    imagettftext($img, $pt, 0, intdiv($size - $width, 2), $baseline, $black, $font, $text);
};
$centre('QRIS PLACEHOLDER', 30, $bandTop + 52);
$centre('BUKAN KODE ASLI', 22, $bandTop + 96);

// Thermal heads are 1-bit. Snap everything to pure black or white so no
// driver-specific dithering decides how legible the warning text is.
// Thresholding after anti-aliased rendering keeps truer glyph shapes than
// drawing with anti-aliasing disabled.
for ($y = 0; $y < $size; $y++) {
    for ($x = 0; $x < $size; $x++) {
        $rgb = imagecolorat($img, $x, $y);
        $r   = ($rgb >> 16) & 0xFF;
        $g   = ($rgb >> 8) & 0xFF;
        $b   = $rgb & 0xFF;
        // Rec. 601 luma
        $luma = (0.299 * $r) + (0.587 * $g) + (0.114 * $b);
        imagesetpixel($img, $x, $y, $luma < 128 ? $black : $white);
    }
}

imagepng($img, $output);
imagedestroy($img);

echo "written: $output\n";
