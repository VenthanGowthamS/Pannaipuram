# Variant B — festive village-folk. Brighter than the kuthu cut: reedy
# nadaswaram-style lead with vibrato, thavil double-hits, tambourine,
# major pentatonic (Mohanam). Celebration rather than club.
import math, wave, struct, random
from array import array

SR = 44100; BPM = 116.0
STEP = 60.0 / BPM / 4; BAR = STEP * 16
TOTAL = 32.0; N = int(SR * (TOTAL + 1.5))
random.seed(23)
drums = array('d', bytes(8*N*2)); tonal = array('d', bytes(8*N*2))
kickenv = array('d', bytes(8*N))

def mix(buf, start, mono, pan=0.5, gain=1.0):
    i = int(start*SR)
    for k in range(len(mono)):
        j = i+k
        if 0 <= j < N:
            v = mono[k]*gain
            buf[2*j] += v*(1-pan); buf[2*j+1] += v*pan

def midi(n): return 440.0*(2**((n-69)/12.0))
def lp(s, fc):
    a = 1-math.exp(-2*math.pi*fc/SR); y=0.0
    for k in range(len(s)): y += a*(s[k]-y); s[k]=y
    return s

def kick(amp=1.0):
    n=int(0.30*SR); o=[0.0]*n
    for k in range(n):
        t=k/SR; f=48+95*math.exp(-t*38)
        o[k]=amp*(math.exp(-t*10)*math.sin(2*math.pi*f*t)*0.92+math.exp(-t*800)*0.42)
    return o

def thavil(note, amp=0.6, dry=17.0):
    f0=midi(note); n=int(0.22*SR); o=[0.0]*n; prev=0.0
    for k in range(n):
        t=k/SR; f=f0*(1+0.42*math.exp(-t*34))
        w=random.uniform(-1,1); hp=w-prev; prev=w
        o[k]=amp*math.exp(-t*dry)*(math.sin(2*math.pi*f*t)*0.80+hp*0.20*math.exp(-t*70))
    return o

def tamb(amp=0.20):
    n=int(0.14*SR); o=[0.0]*n; prev=0.0
    for k in range(n):
        t=k/SR
        w=random.uniform(-1,1); hp=w-prev; prev=w
        ring=math.sin(2*math.pi*7600*t)*0.35+math.sin(2*math.pi*9900*t)*0.25
        o[k]=amp*math.exp(-t*26)*(hp*0.75+ring*0.25)
    return o

def reed(note, dur=0.32, amp=0.30):
    # odd-harmonic (square-ish) + vibrato => nadaswaram-ish cry
    f=midi(note); n=int(dur*SR); o=[0.0]*n
    K=max(3, min(11, int(15000/f)))
    for k in range(n):
        t=k/SR
        vib=1.0+0.006*math.sin(2*math.pi*5.4*t)
        env=min(1.0,k/(0.020*SR))*min(1.0,(n-k)/(0.05*SR))*(0.75+0.25*math.exp(-t*3))
        s=0.0
        for h in range(1,K+1,2): s += math.sin(2*math.pi*f*vib*h*t)/h
        o[k]=amp*env*s*0.75
    return lp(o, 4200)

def sub(note, dur, amp=0.5):
    f=midi(note); n=int(dur*SR); o=[0.0]*n
    for k in range(n):
        t=k/SR
        env=min(1.0,k/(0.008*SR))*min(1.0,(n-k)/(0.03*SR))*math.exp(-t*1.8)
        o[k]=amp*env*(math.sin(2*math.pi*f*t)+0.10*math.sin(2*math.pi*f*2*t))
    return o

def riser(dur, amp=0.18):
    n=int(dur*SR); o=[0.0]*n; y=0.0; prev=0.0
    for k in range(n):
        p=k/n; w=random.uniform(-1,1); hp=w-prev; prev=w
        a=1-math.exp(-2*math.pi*(300+6000*p*p)/SR); y+=a*(hp-y)
        o[k]=amp*y*(p**1.5)
    return o

def impact(amp=0.7):
    n=int(1.0*SR); o=[0.0]*n; prev=0.0
    for k in range(n):
        t=k/SR; f=40+55*math.exp(-t*8)
        w=random.uniform(-1,1); hp=w-prev; prev=w
        o[k]=amp*math.exp(-t*3.6)*(math.sin(2*math.pi*f*t)*0.85+hp*0.15*math.exp(-t*20))
    return o

# C - F - G - C, four times.  Mohanam hook: C D E G A
PROG=[(48,[48,52,55]),(53,[53,57,60]),(55,[55,59,62]),(48,[48,52,55])]*4
HOOK=[(0,72),(1,74),(2,76),(4,79),(6,76),(8,74),(10,72),(12,74),(14,76),
      (16,79),(17,81),(18,79),(20,76),(22,79),(24,81),(26,79),(28,76),(30,72)]
KICKP=[0,7,8,12]; THAV=[2,5,10,13,15]
BREAK=10

for b in range(16):
    t0=b*BAR; root, chord = PROG[b]
    on = (b>=1 and b!=BREAK and b!=15)
    if on:
        for s in KICKP:
            mix(drums, t0+s*STEP, kick(1.0 if s==0 else 0.8), 0.5, 0.82)
            ke=int((t0+s*STEP)*SR)
            for k in range(int(0.20*SR)):
                if ke+k<N: kickenv[ke+k]=max(kickenv[ke+k], math.exp(-k/SR*12))
        for i,s in enumerate(THAV):
            mix(drums, t0+s*STEP, thavil(45 if i%2 else 50, 0.5), 0.42+0.16*(i%2))
        if b>=2:
            for s in range(1,16,2): mix(drums, t0+s*STEP, tamb(0.20 if s%4==1 else 0.13), 0.60)
        if b%4==3:                       # thavil roll into the turn
            for i,s in enumerate((12,13,14,15)):
                mix(drums, t0+s*STEP, thavil(50-i*2, 0.42, 22.0), 0.5+(i-1.5)*0.12)
    if b>=1 and b!=15:
        for s in KICKP: mix(tonal, t0+s*STEP, sub(root-12, 0.28), 0.5, 0.85)
    if b==BREAK:
        for n in chord: mix(tonal, t0, sub(n, BAR*0.95, 0.15), 0.5)
    if b==0 or b>=2:
        for (s,note) in HOOK:
            if s>=16: continue
            if b==BREAK and s not in (0,8): continue
            mix(tonal, t0+s*STEP, reed(note), 0.34, 0.32)
            mix(tonal, t0+s*STEP+3*STEP, reed(note, 0.24), 0.68, 0.11)

mix(tonal, 0.85, riser(1.15), 0.5)
mix(drums, 2.0*BAR/2, impact(), 0.5)
mix(tonal, 22.8, riser(1.1, 0.15), 0.5)
mix(drums, 30.0, impact(0.8), 0.5)
for n in (48,52,55,60): mix(tonal, 30.0, sub(n, 2.0, 0.12), 0.5)

end=int(TOTAL*SR); fo=int(1.6*SR); peak=1e-9
out=array('d', bytes(8*end*2))
for k in range(end):
    duck=1.0-0.50*kickenv[k]
    for c in (0,1):
        v=drums[2*k+c]+tonal[2*k+c]*duck
        out[2*k+c]=v
        if abs(v)>peak: peak=abs(v)
g=1.95/peak; frames=bytearray()
for k in range(end):
    env=1.0
    if k<int(0.05*SR): env=k/(0.05*SR)
    if k>end-fo: env*=(end-k)/fo
    l=math.tanh(out[2*k]*g*env)*0.93; r=math.tanh(out[2*k+1]*g*env)*0.93
    frames+=struct.pack('<hh', int(l*32767), int(r*32767))
with wave.open('music3.wav','wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(frames))
print('music3.wav written: %.1fs @ %g BPM' % (TOTAL, BPM))
