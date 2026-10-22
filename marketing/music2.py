# Pannaipuram promo bed v2 — energetic, original, unencumbered.
# 120 BPM (bar = 2.0s, so 16 bars = exactly 32s), syncopated kuthu-leaning
# groove, hook in Hindolam (S G2 M1 D1 N2 = C Eb F Ab Bb).
# Punchy drums, sub bass, detuned lead through a delay, sidechain duck on the
# tonal bus keyed to the kick — the things that make a bed sound produced
# rather than like a ringtone.
import math, wave, struct, random
from array import array

SR = 44100
BPM = 120.0
STEP = 60.0 / BPM / 4          # 16th = 0.125s
BAR = STEP * 16                # 2.0s
TOTAL = 32.0
N = int(SR * (TOTAL + 1.5))
random.seed(11)

drums  = array('d', bytes(8 * N * 2))   # interleaved L,R
tonal  = array('d', bytes(8 * N * 2))
kickenv = array('d', bytes(8 * N))      # sidechain key

def mix(buf, start, mono, pan=0.5, gain=1.0):
    i = int(start * SR)
    for k in range(len(mono)):
        j = i + k
        if 0 <= j < N:
            v = mono[k] * gain
            buf[2*j]   += v * (1 - pan)
            buf[2*j+1] += v * pan

def midi(n): return 440.0 * (2 ** ((n - 69) / 12.0))

# ── drums ──────────────────────────────────────────────────────────────
def kick(amp=1.0):
    n = int(0.34 * SR); o = [0.0]*n
    for k in range(n):
        t = k / SR
        f = 46 + 105 * math.exp(-t * 42)          # tight pitch drop = punch
        env = math.exp(-t * 9.5)
        click = math.exp(-t * 900) * 0.5
        o[k] = amp * (env * math.sin(2*math.pi*f*t) * 0.95 + click)
    return o

def clap(amp=0.5):
    n = int(0.30 * SR); o = [0.0]*n; prev = 0.0
    bursts = [0, int(0.011*SR), int(0.023*SR)]
    for k in range(n):
        t = k / SR
        w = random.uniform(-1, 1); hp = w - prev; prev = w
        e = 0.0
        for b in bursts:
            if k >= b: e = max(e, math.exp(-(k - b) / SR * 150))
        e += math.exp(-t * 13) * 0.34             # body/tail
        o[k] = amp * hp * e
    return o

def hat(amp=0.24, dec=90.0):
    n = int(0.08 * SR); o = [0.0]*n; prev = 0.0
    for k in range(n):
        w = random.uniform(-1, 1); hp = w - prev; prev = w
        o[k] = amp * hp * math.exp(-k / SR * dec)
    return o

def tom(note, amp=0.55):
    f0 = midi(note); n = int(0.26 * SR); o = [0.0]*n; prev = 0.0
    for k in range(n):
        t = k / SR
        f = f0 * (1 + 0.55 * math.exp(-t * 26))
        w = random.uniform(-1, 1); hp = w - prev; prev = w
        o[k] = amp * math.exp(-t * 12) * (math.sin(2*math.pi*f*t) * 0.88 + hp * 0.12)
    return o

# ── tonal ──────────────────────────────────────────────────────────────
def lp(sig, fc):                                   # one-pole lowpass
    a = 1 - math.exp(-2 * math.pi * fc / SR)
    y = 0.0
    for k in range(len(sig)):
        y += a * (sig[k] - y); sig[k] = y
    return sig

def saw(f, dur, harm=10):
    n = int(dur * SR); o = [0.0]*n
    K = max(2, min(harm, int(17000 / max(f, 1))))
    for k in range(n):
        t = k / SR; s = 0.0
        for h in range(1, K + 1):
            s += math.sin(2*math.pi*f*h*t) / h
        o[k] = s * 0.5
    return o

def lead(note, dur=0.30, amp=0.30):
    f = midi(note)
    a = saw(f, dur); b = saw(f * 1.006, dur)       # detune = width
    n = len(a); o = [0.0]*n
    for k in range(n):
        t = k / SR
        env = min(1.0, k / (0.006 * SR)) * math.exp(-t * 6.0)
        o[k] = (a[k] * 0.6 + b[k] * 0.4) * env
    return lp(o, 3800)

def sub(note, dur, amp=0.55):
    f = midi(note); n = int(dur * SR); o = [0.0]*n
    for k in range(n):
        t = k / SR
        env = min(1.0, k/(0.008*SR)) * min(1.0, (n-k)/(0.03*SR)) * math.exp(-t*1.6)
        o[k] = amp * env * (math.sin(2*math.pi*f*t) + 0.12*math.sin(2*math.pi*f*2*t))
    return o

def stab(notes, dur=0.16, amp=0.16):
    n = int(dur * SR); o = [0.0]*n
    for nt in notes:
        s = saw(midi(nt), dur, harm=8)
        for k in range(n): o[k] += s[k] / len(notes)
    for k in range(n):
        t = k / SR
        o[k] *= amp * min(1.0, k/(0.004*SR)) * math.exp(-t * 11)
    return lp(o, 2600)

def riser(dur, amp=0.20):
    n = int(dur * SR); o = [0.0]*n; y = 0.0; prev = 0.0
    for k in range(n):
        p = k / n
        w = random.uniform(-1, 1); hp = w - prev; prev = w
        fc = 300 + 6500 * (p ** 2)
        a = 1 - math.exp(-2*math.pi*fc/SR)
        y += a * (hp - y)
        o[k] = amp * y * (p ** 1.5)
    return o

def impact(amp=0.75):
    n = int(1.1 * SR); o = [0.0]*n; prev = 0.0
    for k in range(n):
        t = k / SR
        f = 38 + 60 * math.exp(-t * 8)
        w = random.uniform(-1, 1); hp = w - prev; prev = w
        o[k] = amp * math.exp(-t*3.4) * (math.sin(2*math.pi*f*t)*0.85 + hp*0.15*math.exp(-t*22))
    return o

# ── arrangement ────────────────────────────────────────────────────────
# Cm | Cm | Ab | Bb, four times = 16 bars = 32s
PROG = [(48, [48,51,55]), (48, [48,51,55]), (44, [44,48,51]), (46, [46,50,53])] * 4
HOOK = [(0,72),(2,75),(3,77),(4,75),(6,72),(8,70),(10,72),(12,75),(14,72),
        (16,77),(18,80),(19,82),(20,80),(22,77),(24,75),(26,77),(28,75),(30,72)]
KICK  = [0, 6, 8, 14]
CLAP  = [4, 12]

BREAK = 10                      # one bar of air, lands under the doctor scene
for b in range(16):
    t0 = b * BAR
    root, chord = PROG[b]
    drumming = (b >= 1 and b != BREAK and b != 15)

    if drumming:
        for s in KICK:
            mix(drums, t0 + s*STEP, kick(1.0 if s == 0 else 0.85), 0.5, 0.85)
            ke = int((t0 + s*STEP) * SR)
            for k in range(int(0.22*SR)):            # sidechain key
                if ke+k < N: kickenv[ke+k] = max(kickenv[ke+k], math.exp(-k/SR*11))
        if b >= 2:
            for s in CLAP: mix(drums, t0 + s*STEP, clap(), 0.5, 0.8)
        for s in range(0, 16, 2):
            mix(drums, t0 + s*STEP, hat(0.26 if s % 4 == 0 else 0.16), 0.56)
        if b % 4 == 3:                                # 16th fill into the turn
            for s in range(12, 16):
                mix(drums, t0 + s*STEP, hat(0.20, 120), 0.44)
        if b in (7, 13):
            for i, s in enumerate((12, 13, 14, 15)):
                mix(drums, t0 + s*STEP, tom(52 - i*3), 0.5 + (i-1.5)*0.10)

    if b >= 1 and b != 15:
        for s in KICK:
            mix(tonal, t0 + s*STEP, sub(root - 12, 0.30), 0.5, 0.9)
    if b >= 2 and b != BREAK:
        for s in (2, 6, 10, 14):
            mix(tonal, t0 + s*STEP, stab([n + 12 for n in chord]), 0.5)
    if b == BREAK:                                    # sustained pad in the gap
        for n in chord: mix(tonal, t0, sub(n, BAR*0.95, 0.16), 0.5)

    if b == 0 or b >= 2:
        for (s, note) in HOOK:
            if s >= 16: continue
            if b == BREAK and s not in (0, 8): continue
            mix(tonal, t0 + s*STEP, lead(note), 0.30, 0.34)
            mix(tonal, t0 + s*STEP + 3*STEP, lead(note), 0.70, 0.13)   # 3/16 delay

mix(tonal, 0.9, riser(1.1), 0.5)          # into the drop
mix(drums, 2.0, impact(), 0.5)
mix(tonal, 22.9, riser(1.1, 0.16), 0.5)   # back in after the break
mix(drums, 30.0, impact(0.85), 0.5)
for n in (48, 51, 55, 60): mix(tonal, 30.0, sub(n, 2.0, 0.13), 0.5)

# ── mix: sidechain the tonal bus, sum, soft-clip ───────────────────────
end = int(TOTAL * SR)
fo = int(1.6 * SR)
peak = 1e-9
out = array('d', bytes(8 * end * 2))
for k in range(end):
    duck = 1.0 - 0.55 * kickenv[k]
    for c in (0, 1):
        v = drums[2*k+c] + tonal[2*k+c] * duck
        out[2*k+c] = v
        if abs(v) > peak: peak = abs(v)
g = 1.95 / peak
frames = bytearray()
for k in range(end):
    env = 1.0
    if k < int(0.05*SR): env = k / (0.05*SR)
    if k > end - fo: env *= (end - k) / fo
    l = math.tanh(out[2*k]   * g * env ) * 0.93
    r = math.tanh(out[2*k+1] * g * env ) * 0.93
    frames += struct.pack('<hh', int(l*32767), int(r*32767))

with wave.open('music2.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(frames))
print('music2.wav written: %.1fs @ %g BPM' % (TOTAL, BPM))
