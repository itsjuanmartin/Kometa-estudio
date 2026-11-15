"""tools/align_whisper.py — word-accurate script-to-audio alignment with faster-whisper.

  HF_HUB_DISABLE_XET=1 python3 tools/align_whisper.py --project projects/<slug> [--model medium]

Transcribes the voiceover with word timestamps, then maps the EXACT script words onto the recognised words
(difflib on normalised tokens), so captions keep the script's spelling while timings come from the audio.
Unmatched script words are interpolated between their matched neighbours. Writes the same timeline files as
align_silence.py (words.json, sentences.json, transcript.txt).
"""
import argparse, difflib, os, re, sys, unicodedata
sys.path.insert(0, os.path.dirname(__file__))
from common import load_json, write_timeline
from align_silence import sentences_of


def norm(w):
    w = unicodedata.normalize('NFD', w.lower())
    return re.sub(r'[^a-z0-9ñ]', '', ''.join(c for c in w if unicodedata.category(c) != 'Mn'))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--model', default='medium')
    ap.add_argument('--refine', action='store_true', help='keep sentence bounds from the existing (silence) timeline; use Whisper only for word rhythm inside each sentence')
    a = ap.parse_args(); P = a.project; cfg = load_json(os.path.join(P, 'config.json'))
    voice = os.path.join(P, cfg['voiceover']); script = open(os.path.join(P, cfg['script']), encoding='utf-8').read()
    raw = os.path.join(P, 'timeline', f'whisper_{a.model}.json')
    if os.path.exists(raw):   # cached recognition (delete the file to re-run Whisper)
        rec = [tuple(x) for x in load_json(raw)]
    else:
        rec = transcribe(voice, a.model)
        import json; json.dump(rec, open(raw, 'w'))
    print(f'whisper: {len(rec)} words')
    align(a, P, script, rec)


def transcribe(voice, model):
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device='cpu', compute_type='int8')
    import subprocess, numpy as np   # decode with ffmpeg (the bundled PyAV can be incompatible)
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', voice, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768.0
    # no initial_prompt: with a long prompt Whisper can skip the opening and squash its timestamps
    segs, _ = m.transcribe(audio, language='es', word_timestamps=True, vad_filter=True, beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in s.words if w.word.strip()]


def align(a, P, script, rec):

    sents = sentences_of(script)
    sw = [(si, w) for si, s in enumerate(sents) for w in s.split()]
    A = [norm(w) for _, w in sw]; B = [norm(w) for w, _, _ in rec]
    t = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, A, B, autojunk=False).get_matching_blocks():
        for k in range(blk.size): t[blk.a + k] = (rec[blk.b + k][1], rec[blk.b + k][2])
    hit = sum(x is not None for x in t); print(f'matched {hit}/{len(t)} script words ({100 * hit / max(1, len(t)):.1f}%)')
    # interpolate gaps between matched anchors
    i = 0; n = len(t); last_end = 0.0
    while i < n:
        if t[i] is not None: last_end = t[i][1]; i += 1; continue
        j = i
        while j < n and t[j] is None: j += 1
        nxt = t[j][0] if j < n else (rec[-1][2] if rec else last_end + 0.4 * (j - i))
        step = max(0.05, (nxt - last_end) / (j - i))
        for k in range(i, j): t[k] = (last_end + (k - i) * step, last_end + (k - i + 1) * step - 0.02)
        i = j
    if a.refine:   # silence-detected sentence bounds are reliable; Whisper can drift on shouted/short lines
        old = load_json(os.path.join(P, 'timeline', 'sentences.json'))
        assert len(old) == len(sents), 'refine needs the same script as the existing timeline'
        for si, o in enumerate(old):
            idx = [k for k, (x, _) in enumerate(sw) if x == si]
            ws, we = t[idx[0]][0], t[idx[-1]][1]; span = max(0.05, we - ws); os_, oe = o['start'], o['end']
            for k in idx:
                t[k] = (os_ + (t[k][0] - ws) / span * (oe - os_), os_ + (t[k][1] - ws) / span * (oe - os_))
    words = [{'word': w, 'start': round(s, 3), 'end': round(max(e, s + 0.05), 3)} for (_, w), (s, e) in zip(sw, t)]
    S = []
    for si, s in enumerate(sents):
        idx = [k for k, (x, _) in enumerate(sw) if x == si]
        S.append({'i': si, 'start': words[idx[0]]['start'], 'end': words[idx[-1]]['end'], 'text': s})
    write_timeline(os.path.join(P, 'timeline'), words, S, f'script+whisper-{a.model}' + ('+silence-bounds' if a.refine else ''))


if __name__ == '__main__':
    main()
