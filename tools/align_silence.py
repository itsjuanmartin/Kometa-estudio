"""tools/align_silence.py — offline script-to-audio alignment (no speech model, no downloads).

  python tools/align_silence.py --project projects/<slug> [--parts 425.74,0.7] [--db -38] [--min 0.16]

Uses the exact narration script plus the pauses in the voiceover: sentence ends are snapped to the
detected silences, walking forward with the measured speaking rate; words inside a sentence are spread
over its voiced time by character length. Writes the same timeline files as transcribe.py.
--parts lets you give the boundary of joined takes (end of part 1, gap) so each part is aligned on its own.
"""
import argparse, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from common import load_json, write_timeline, probe_duration


def silences(path, thr, mind):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"silencedetect=noise={thr}dB:d={mind}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", out)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", out)]
    return list(zip(st, en[:len(st)]))


def sentences_of(text):
    sents = []
    for para in [p.strip() for p in text.split("\n\n") if p.strip()]:
        for s in re.split(r"(?<=[.?!…»])\s+(?=[¿¡«—A-ZÁÉÍÓÚÑ0-9])", para):
            if s.strip(): sents.append(s.strip())
    return sents


def weight(s):  # spoken "length" of a string
    return len(re.sub(r"[^\wáéíóúñü]", "", s.lower())) + 3 * len(re.findall(r"\d", s))


def align(sents, t0, t1, gaps):
    """Global DP: choose which detected pauses are sentence boundaries."""
    G = [g for g in gaps if g[0] > t0 + 0.05 and g[1] < t1 - 0.05]
    nodes = [(t0, t0)] + G + [(t1, t1)]          # node i: pause (start,end); speech runs from nodes[i].end to nodes[j].start
    M = len(nodes); N = len(sents)
    import itertools
    cum = [0.0]
    for i in range(1, M): cum.append(cum[-1] + (nodes[i][1] - nodes[i][0]))
    def voiced(i, j): return (nodes[j][0] - nodes[i][1]) - (cum[j - 1] - cum[i] if j - 1 > i else 0)
    W = [weight(x) for x in sents]
    rate = voiced(0, M - 1) / max(1, sum(W))
    soft = [len(re.findall(r"[,…:;—]", x)) for x in sents]
    INF = float("inf")
    dp = [[INF] * M for _ in range(N + 1)]; bk = [[-1] * M for _ in range(N + 1)]
    dp[0][0] = 0.0
    for k in range(1, N + 1):
        exp = W[k - 1] * rate; last = k == N
        for j in range(1, M):
            if last and j != M - 1: continue
            if not last and j == M - 1: continue
            gapj = nodes[j][1] - nodes[j][0]
            best, arg = INF, -1
            for i in range(j - 1, -1, -1):
                if dp[k - 1][i] == INF: continue
                v = voiced(i, j)
                if v > exp * 2.2 + 2.5: break
                inner = [nodes[q][1] - nodes[q][0] for q in range(i + 1, j)]
                inner_pen = sum(max(0.0, g - 0.25) for g in sorted(inner)[: max(0, len(inner) - soft[k - 1])]) * 4 + max(0, len(inner) - soft[k - 1]) * 0.6
                import math
                c = dp[k - 1][i] + 20 * ((v - exp) ** 2) / (exp + 0.6) + 6 * math.log((v + 0.3) / (exp + 0.3)) ** 2 + inner_pen - (0 if last else min(gapj, 1.0) * 1.2)
                if c < best: best, arg = c, i
            dp[k][j] = best; bk[k][j] = arg
    # backtrack
    j = M - 1; ends = []
    for k in range(N, 0, -1):
        i = bk[k][j]; ends.append((nodes[i][1], nodes[j][0])); j = i
    return list(reversed(ends))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--project", required=True); ap.add_argument("--parts", default="")
    ap.add_argument("--db", type=float, default=-38); ap.add_argument("--min", type=float, default=0.16)
    a = ap.parse_args(); P = a.project; cfg = load_json(os.path.join(P, "config.json"))
    voice = os.path.join(P, cfg["voiceover"]); script = open(os.path.join(P, cfg["script"]), encoding="utf-8").read()
    dur = probe_duration(voice); gaps = silences(voice, a.db, a.min)
    lead = gaps[0][1] if gaps and gaps[0][0] < 0.05 else 0.0
    tail = gaps[-1][0] if gaps and gaps[-1][1] > dur - 0.1 else dur
    sents = sentences_of(script)
    spans = []
    if a.parts:
        cut, gap = [float(x) for x in a.parts.split(",")]
        # split the script where part 2 starts (first sentence after the split marker line in the script file)
        marker = os.path.join(P, "input", "part2_first_line.txt")
        first = open(marker, encoding="utf-8").read().strip()
        idx = next(i for i, s in enumerate(sents) if s.startswith(first[:30]))
        p1_end = max(g[0] for g in gaps if g[0] <= cut + 0.05)
        p2_start = min(g[1] for g in gaps if g[1] >= cut + gap - 0.05)
        spans += align(sents[:idx], lead, p1_end, gaps) + align(sents[idx:], p2_start, tail, gaps)
    else:
        spans = align(sents, lead, tail, gaps)
    words, S = [], []
    for i, (s, (st, en)) in enumerate(zip(sents, spans)):
        toks = s.split(); ws = [max(1, weight(t)) for t in toks]; tot = sum(ws); inner = [g for g in gaps if g[0] > st and g[1] < en]
        vo = (en - st) - sum(b - a for a, b in inner)
        def real(v):  # voiced offset -> real time, skipping inner silences
            t = st
            for ga, gb in inner:
                if t + v <= ga: return t + v
                v -= (ga - t); t = gb
            return t + v
        acc = 0
        for t, w in zip(toks, ws):
            ws0 = real(vo * acc / tot); acc += w; ws1 = real(vo * acc / tot)
            words.append({"word": t, "start": round(ws0, 3), "end": round(max(ws0 + 0.05, ws1 - 0.02), 3)})
        S.append({"i": i, "start": round(st, 3), "end": round(en, 3), "text": s})
    write_timeline(os.path.join(P, "timeline"), words, S, "script+silence")
    print(f"duration {dur:.1f}s, {len(gaps)} pauses, {len(sents)} sentences")


if __name__ == "__main__":
    main()
