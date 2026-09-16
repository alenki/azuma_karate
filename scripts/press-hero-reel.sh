#!/usr/bin/env bash
# ------------------------------------------------------------------
# Chapter 一's plate.
#
#   ./scripts/press-hero-reel.sh [source.mp4]
#
# With no argument it fetches the source itself; pass a path to press a
# local copy instead. Everything the chapter shows — the wide plate, the
# upright plate and the reel — comes out of this one file.
#
# WHAT CHANGED, AND WHY THE SCRIPT GOT SHORTER.
#
# This used to bake a two-ink press into the video: a luma matrix, a
# dodge, and a lookup ramp evaluated by hand so the mp4 matched the
# `url(#duotone-paper-ink)` the CSS put on the still. All of that existed
# because an SVG REFERENCE filter is a per-frame pass, and a full-screen
# one over 30fps forces the compositor off the fast path.
#
# The chapter is graded now, not pressed — `saturate() contrast()
# brightness()`, which are plain colour-matrix operations the compositor
# does for free. So the CSS can grade the video and the still with the
# SAME declaration (hero.css, `.hero__plate img, .hero__reel`), nothing is
# baked, and the plate stays retunable without re-encoding anything. The
# dodge is gone too: it existed to lift one near-black seam in a gi that
# ink type had to be legible on, and the type is bone on black now.
#
# The files therefore carry the photograph AS SHOT, in colour. Do not
# grade them here; hero.css owns the grade.
# ------------------------------------------------------------------
set -euo pipefail

DIR=public/media/hero
# Mixkit 49632, "A young man practicing karate moves" — 1920x1080, 23.976fps,
# 10.8s. Mixkit Free License: commercial use, no attribution required, and no
# redistribution as stock. See public/media/placeholders/CREDITS.md.
URL=https://assets.mixkit.co/videos/49632/49632-1080.mp4
SRC=${1:-}

if [ -z "$SRC" ]; then
  SRC=$(mktemp -t hero-src-XXXXXX).mp4
  echo "fetching $URL"
  curl -fsSL -A "Mozilla/5.0" -o "$SRC" "$URL"
fi

# ---- the cut ------------------------------------------------------
# One figure in a black room, and the room is genuinely black: YAVG sits
# flat at 20.5/255 for all 10.8s, with no fade at either end, so the cut
# can be taken anywhere and the ground needs no help from a scrim.
#
# Read at 5fps the clip is a kata with one real event in it. 0.0-8.2 is
# preparation and held stances — handsome, and nothing happens. At 8.2 he
# is in a back stance with the arm folded; over the next second and a half
# he steps through into a deep front stance and drives a straight punch
# out; at 9.6 it is fully extended and HELD; by 9.8 he has already drawn
# back for a second one.
#
# So the cut is that single gesture: guard, step, strike, hold. It runs
# ONCE and it settles, which is the rule this sheet states about itself —
# hero.css: "Nothing on this sheet moves again: no loop, no breathing
# hairline, no scroll-linked transform, no pointer lean."
#
# It is also the chapter's own sentence. 一 reads «Сначала поклон. / Потом
# удар.» and the reel is the second half of it.
IN=8.20
OUT=9.72
# 0.70x. The gesture is 1.52s as shot and 2.17s here, which is close to
# the 2.05s the sheet's load front takes to cross it (Hero.tsx): the punch
# lands about when the sentence finishes printing. The source is 23.976fps
# and the output is 24, so 0.70x means about one frame in three is a
# duplicate — invisible on a movement this slow, and cheaper than asking a
# phone to interpolate.
SPEED=0.70
FPS=24

PLAY=$(awk "BEGIN{printf \"%.2f\", ($OUT-$IN)/$SPEED}")

# ---- the field ----------------------------------------------------
# THE FIGURE IS MOVED OFF CENTRE BY PADDING, not by `object-position`.
#
# He stands dead centre of the source frame — tracked across the cut he
# occupies x 0.38-0.69, y 0.15-0.93 — and dead centre is the one place he
# cannot be: «Потом удар.» is set across the left 62% of the trim and
# would cross his legs. `object-position` cannot fix that, because a 16:9
# plate covering a 1512x900 sheet has 88px of horizontal slack in total.
#
# The ground is #000, so the frame can simply be made wider. 640px of
# black on the binding side takes the plate to 2560x1080 (2.37:1) and puts
# him at x 0.54-0.77 — clear of the strike's column, and with enough slack
# left over that `object-position` becomes a real control again.
PAD_W=2560
PAD_X=640

CUT="trim=start=$IN:end=$OUT,setpts=(PTS-STARTPTS)/$SPEED,fps=$FPS"
FIELD="pad=$PAD_W:1080:$PAD_X:0:black"

echo "cut ${IN}-${OUT}s at ${SPEED}x -> ${PLAY}s, one gesture, ${FPS}fps, ${PAD_W}x1080"

# ---- the reel -----------------------------------------------------
# VP9 first and H.264 behind it; ui/Reel lists them in that order and a
# browser that cannot read the first falls through to the second.
ffmpeg -v error -y -i "$SRC" -vf "$CUT,$FIELD,format=yuv420p" -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 21 -preset veryslow \
  -g $((FPS * 2)) -movflags +faststart \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv \
  "$DIR/kata-reel.mp4"

ffmpeg -v error -y -i "$SRC" -vf "$CUT,$FIELD,format=yuv420p" -an \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -deadline good -cpu-used 1 \
  "$DIR/kata-reel.webm"

# ---- the wide plate -----------------------------------------------
# THE REEL'S OWN FRAME 0, selected by the identical rule — `trim=start=$IN`
# and not `-ss`, so the two cannot land a frame apart. The <img> under the
# video and the video's first frame are then one image and the handover is
# invisible: a photograph that starts moving, never a cut.
ffmpeg -v error -y -i "$SRC" -vf "trim=start=$IN,$FIELD" -frames:v 1 -q:v 3 \
  "$DIR/kata-plate.jpg"

# ---- the upright plate --------------------------------------------
# A DIFFERENT FRAME, and that is deliberate. The wide still has to be the
# reel's frame 0 because the reel lies over it; the upright still has no
# reel over it at all — ui/Reel declines to mount below 4:5 — so it is
# free to be the best frame in the cut rather than the first, and the best
# frame is the punch itself at 9.45.
#
# It is also the WHOLE hero on a phone, and a phone does not show this cut
# — it shows a 0.46:1 STRIP of it, x 0.27-0.73, because 390x844 is far
# taller than 4:5 and `cover` takes the difference out of the width. A
# figure at full height loses the punching fist and the rear foot to that
# strip. So he is set in a black field rather than filling one: scaled to
# 0.49 of the source frame and placed at x 0.31-0.69, y 0.18-0.57, which
# survives the strip with room either side and leaves the foot of the
# sheet black for «Потом удар.» and the offer stacked under it.
PUNCH=9.45
ffmpeg -v error -y -i "$SRC" \
  -vf "trim=start=$PUNCH,crop=864:1080:595:0,scale=424:529,pad=864:1080:208:121:black" \
  -frames:v 1 -q:v 3 "$DIR/kata-plate-portrait.jpg"

ls -l "$DIR"
