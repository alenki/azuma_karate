#!/usr/bin/env bash
# ------------------------------------------------------------------
# Chapter 一's plate, pressed from the club's own footage.
#
#   ./scripts/press-hero-reel.sh <source.mp4>
#
# The source is a 720x1280 phone clip carrying NO rotation metadata and
# 90 degrees of rotation in the pixels, so `transpose=2` (counter-clockwise)
# is what makes it upright. It comes out 1280x720 and that is all the
# resolution there is — see media.ts for what that costs and who gets it.
#
# WHAT THIS BAKES, AND WHY IT IS BAKED.
#
# Every other plate in the book is pressed in CSS:
#
#     filter: grayscale(1) contrast(1.06) url("#duotone-paper-ink")
#
# An SVG reference filter is a per-frame pass, and a full-screen one over
# 30fps forces the compositor off the fast path on exactly the machines
# least able to afford it. So the video carries the press already applied
# and the CSS filter is NOT declared on it. The arithmetic below is that
# declaration, evaluated by hand:
#
#   L = 0.2126 R + 0.7152 G + 0.0722 B          grayscale(1), and the LUMA
#                                               matrix ui/PressDefs feeds the
#                                               duotone — the same numbers
#   C = clip(1.06 L - 0.03, 0, 1)               contrast(1.06): slope 1.06
#                                               about the 0.5 midpoint
#   R' = 0.082 + 0.871 C                        #duotone-paper-ink's own ramp:
#   G' = 0.075 + 0.862 C                        ink #151311 at L 0 to
#   B' = 0.067 + 0.835 C                        paper #F3EFE6 at L 1
#
# all of it in sRGB, because the filter declares colorInterpolationFilters
# ="sRGB" and CSS filter functions are specified there too.
#
# THE COST OF BAKING is that the file is stale if `--color-paper` or
# `--color-ink` ever move. They are the paper stock and the paper stock is
# one decision (see globals.css); if they do move, re-run this.
#
# The STILLS are deliberately NOT pressed. They go through <Photo
# grade="duotone">, which is the CSS path, so the image half of the plate
# stays retunable and the two halves still agree — this script and that
# filter compute the same thing.
# ------------------------------------------------------------------
set -euo pipefail

SRC=${1:?usage: press-hero-reel.sh <source.mp4>}
DIR=public/media/hero

# ---- the cut ------------------------------------------------------
# The reel opens on a black belt being tied and nothing else: a white gi
# filling the frame, one dark mass across it, no sponsor board anywhere in
# it. The chapter prints on paper and the type is INK, so the plate has to
# be light and EVEN, and this is the only shot in ninety-one seconds that
# is both.
#
# IT IS ONE GESTURE AND IT DOES NOT LOOP, which is the whole shape of this
# cut. Read at 4fps the shot is three movements — the knot is tied (2.2 to
# 2.9, hands busy and blurred), the two ends are pulled taut (2.9 to 4.4,
# slow and symmetric), the hands drop away (4.4 to 5.3). Start and end
# states are therefore nothing like each other, and a tail-onto-head
# dissolve double-exposes the hands: a first pass spent 0.9s of every 4.3
# showing four of them. Reversing it instead prints a man UNTYING his belt.
#
# So the cut is the middle movement only, it runs ONCE, and it settles.
# That is also what the sheet already says of itself — hero.css: "Nothing
# on this sheet moves again: no loop, no breathing hairline, no
# scroll-linked transform, no pointer lean." The belt is pulled tight as
# the page loads and then the plate is a photograph.
#
# IN AND OUT ARE MEASURED, not eyeballed, and BOTH metrics had to be read
# before this cut was right. `signalstats` YAVG climbs out of the opening
# fade until 2.15s and starts falling into the next one at 5.30s, which is
# the widest the shot can be. But `blurdetect` over that window peaks at
# 2.93 — the cinch itself is the most motion-blurred frame in the whole
# shot, and a first pass cut from exactly there, which put a smeared frame
# under the headline as the page's LCP. Blur falls to a flat ~8.2 from 3.33
# and stays there to the fade.
#
# So the cut is the sharp plateau: the two ends drawn taut, and nothing
# else.
IN=3.33
OUT=5.32
# 0.85x. The gesture is 1.99s at speed; this holds it to 2.34s, which is
# also very close to the 2.05s the sheet's own load front takes to cross it
# (Hero.tsx) — the belt finishes being pulled about when the sentence
# finishes being printed. 25.5 unique frames a second into 30 is one
# duplicate in six, and on motion this slow it cannot be seen.
SPEED=0.85
FPS=30

PLAY=$(awk "BEGIN{printf \"%.2f\", ($OUT-$IN)/$SPEED}")

# ---- the press, as one filter string ------------------------------
C='clip(1.06*val/255-0.03,0,1)'
LUMA='colorchannelmixer=rr=0.2126:rg=0.7152:rb=0.0722:gr=0.2126:gg=0.7152:gb=0.0722:br=0.2126:bg=0.7152:bb=0.0722'
# ---- THE DODGE ----------------------------------------------------
# One crevice, lifted, because a ramp cannot lift it.
#
# The gi is even light almost everywhere, but the shadow between the
# sleeve and the body is a near-black seam running from the top of the
# frame down to the belt — measured at the render, sRGB 37 where the bow's
# band crosses it, which the scrim lifts to 89 and cannot lift further
# without veiling the whole head of the plate. «Сначала поклон.» came out
# at 2.51:1 there against 4.9:1 everywhere else along the same line.
#
# hero.css states the rule this runs into: "a ramp can lift a whole
# region, but it cannot lift one bare twig out of a band of type." The
# printer's answer to one bad passage is not a heavier screen over the
# whole plate — it is to DODGE that passage while the plate is being made.
# So it is dodged here, once, and the scrim is left alone.
#
# It is surgical in both axes:
#   · in TONE, `pow(1-v,3)` puts almost all of the lift into the near-
#     blacks — the seam gains ~0.28, a mid-grey fold ~0.03, the lit gi
#     nothing it can be seen in.
#   · in SPACE, the mask is full strength to Y 180 and gone by Y 260,
#     which is above the belt at every frame of the cut. THE BELT MUST
#     STAY INK. It is the only dark mass the composition has and the whole
#     plate is built on its separation from the gi; lift it and this stops
#     being a black belt on white cloth.
#
# It runs AFTER the luma matrix and BEFORE the ramp, where all three
# channels are equal and one expression is the whole correction, and it is
# in the STILL chain too — the still is pressed by CSS at runtime, so a
# dodge applied to only one of them would print two different plates.
LIFT=0.45
V='(r(X,Y)/255)'
MASK='min(1,max(0,(260-Y)/80))'
D="min(1,$V+$LIFT*pow(1-$V,3)*$MASK)"
DODGE="geq=r='255*$D':g='255*$D':b='255*$D'"

DUO="lutrgb=r='255*(0.082+0.871*$C)':g='255*(0.075+0.862*$C)':b='255*(0.067+0.835*$C)'"

# ---- the pass -----------------------------------------------------
# One trim, one press, no loop machinery at all. See the cut above for why
# there is none.
CHAIN="trim=start=$IN:end=$OUT,setpts=(PTS-STARTPTS)/$SPEED,transpose=2,fps=$FPS,format=rgb24,$LUMA,$DODGE,$DUO,format=yuv420p"

echo "cut ${IN}-${OUT}s at ${SPEED}x -> ${PLAY}s, one shot, ${FPS}fps"

ffmpeg -v error -y -i "$SRC" -vf "$CHAIN" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset veryslow \
  -g $((FPS*2)) -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  "$DIR/belt-reel.mp4"

ffmpeg -v error -y -i "$SRC" -vf "$CHAIN" -an \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 \
  "$DIR/belt-reel.webm"

# ---- the stills ---------------------------------------------------
# THE SAME FRAME AS THE VIDEO'S FRAME 0 — `trim=start=$IN` and not `-ss`,
# so it is selected by the identical rule and the two cannot land a frame
# apart. The <img> and the video's first frame are then one image, and the
# handover is invisible: a photograph that starts moving, never a cut.
#
# UNPRESSED, and that is the one thing in this script that is easy to get
# backwards. These go through <Photo grade="duotone">, which applies
# `grayscale(1) contrast(1.06) url(#duotone-paper-ink)` in CSS — so pulling
# them out of the ALREADY PRESSED mp4 would press them twice and the still
# would not match the video it sits under. They come off the raw source
# with the luma matrix and nothing else, and CSS does the press once.
#
# Grayscale on disk because the press discards chroma before it does
# anything else, so the colour planes are weight and nothing else. The same
# reasoning media.ts records for the frames these replace.
STILL="trim=start=$IN,transpose=2,format=rgb24,$LUMA,$DODGE,format=gray"

ffmpeg -v error -y -i "$SRC" -vf "$STILL" -frames:v 1 -q:v 3 "$DIR/belt-plate.jpg"

# The upright cut, 4:5 — the same frame, centred, because the knot is the
# subject and the knot is centred. 576x720 is all a sideways 720p clip can
# give, and it is enough HERE and almost nowhere else: a white gi and a
# black belt have no fine detail for an upscale to lose. See media.ts.
ffmpeg -v error -y -i "$SRC" -vf "$STILL,crop=576:720:352:0" -frames:v 1 -q:v 3 "$DIR/belt-plate-portrait.jpg"

ls -l "$DIR"
