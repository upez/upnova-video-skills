"""Turn a word-level transcript into caption groups for templates/captions.html.

Usage:
  python3 -I build_groups.py transcript.json groups.json --from 20.2 --to 121.0

transcript.json is the output of `hyperframes transcribe`: [{"text","start","end"}, ...].
--from / --to keep only the words between the opening and closing claim sections
(those sections carry their own text, so captions stay off there).

Output: [{"s": start, "e": end, "w": [[text, style], ...]}, ...]
style is "" | "hi" | "mark" | "offer". Paste the JSON as GROUPS in captions.html.
Each group shows all at once (Son rejected word-by-word), so words carry no own time.
Edit FIX, OFFERS, TERMS, MARK and HI below for each video.
"""
import argparse
import json
import math
import re

# Mishearings to correct. Brand is always spelled "Upnova".
FIX = {
    "UpNova": "Upnova", "AppNova": "Upnova", "Altonova": "Upnova", "Aupnova": "Upnova",
    "brain.": "brand.", "card": "cart", "rationals": "rationales",
    "Stant": "Stantt", "Sun": "Son", "Lilo": "Leelo", "Cananda": "Cannanda",
}
# Product / offer names: always shown as ONE pill, never split or animated word by word.
# Each entry: (spoken tokens to match, text to show).
OFFERS = [
    (["bundle", "builder"], "bundle builder"),
    (["free", "gift", "with", "purchase"], "free gift with purchase"),
    (["free", "gift", "purchase"], "free gift with purchase"),
    (["order", "volume"], "order volume"),
    (["auto", "volume"], "order volume"),
    (["product", "volume"], "product volume"),
    (["buy", "X,", "get", "Y"], "buy X, get Y"),
]
# Multi-word terms: never split across groups, every word gets the same style.
# Each entry: (spoken tokens to match, words to show, style). Also fixes "average value".
TERMS = [
    (["average", "order", "value"], ["Average", "Order", "Value"], "hi"),
    (["average", "value"], ["Average", "Order", "Value"], "hi"),
    (["cheat", "code"], ["cheat", "code"], "mark"),
    (["one", "minute"], ["one", "minute"], "mark"),
    (["store", "data"], ["store", "data"], "hi"),
    (["six", "dollars"], ["six", "dollars"], "mark"),
    (["ai", "agent"], ["AI", "agent"], "hi"),
    (["ai", "agents"], ["AI", "agents"], "hi"),
]
MARK = {"10", "15", "20", "30", "600", "60", "five", "three", "aov", "guarantee"}  # numbers / big claims
HI = {"ai", "agent", "agents", "upnova", "upsell", "amazing", "generic", "premium",
      "launch", "live", "discount", "install", "brand", "data", "integrated", "previewed"}


def L(x):
    # an offer pill reads as one unit, so it counts as a medium-length word when grouping
    return 10 if x["k"] == "offer" else len(x["t"])


def words(x):
    # a term is one unit while grouping, then shows as its separate words
    return [[t, x["k"]] for t in x["parts"]] if "parts" in x else [[x["t"], x["k"]]]


def norm(t):
    return re.sub(r"[^\w]", "", t).lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("transcript")
    ap.add_argument("out")
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float, default=1e9)
    a = ap.parse_args()

    W = [w for w in json.load(open(a.transcript)) if a.t0 <= w["start"] < a.t1]
    out, i = [], 0
    while i < len(W):
        matched = False
        for toks, label in OFFERS:
            span = W[i:i + len(toks)]
            got = [x["text"] for x in span]
            # whisper glues "Y offer" into "Yoffer."; accept a prefix match on the last token
            if len(span) == len(toks) and all(
                g == t or (k == len(toks) - 1 and g.startswith(t)) for k, (g, t) in enumerate(zip(got, toks))
            ):
                last = span[-1]
                tail = last["text"][len(toks[-1]):]
                mid = (last["start"] + last["end"]) / 2 if tail else last["end"]
                out.append({"t": label, "s": span[0]["start"], "e": mid, "k": "offer"})
                if tail:
                    out.append({"t": tail, "s": mid, "e": last["end"], "k": ""})
                i += len(toks)
                matched = True
                break
        if matched:
            continue
        for toks, show, style in TERMS:
            span = W[i:i + len(toks)]
            if len(span) == len(toks) and [norm(x["text"]) for x in span] == toks:
                tail = re.sub(r"^[\w'%$-]+", "", span[-1]["text"])  # keep the last word's punctuation
                out.append({"t": " ".join(show) + tail, "parts": show[:-1] + [show[-1] + tail],
                            "s": span[0]["start"], "e": span[-1]["end"], "k": style})
                i += len(toks)
                matched = True
                break
        if matched:
            continue
        w = W[i]
        t = w["text"]
        if t.rstrip(",.") in FIX:
            t = FIX[t.rstrip(",.")] + t[len(t.rstrip(",.")):]
        t = FIX.get(t, t)
        n = norm(t)
        k = "mark" if n in MARK else ("hi" if n in HI else "")
        out.append({"t": t, "s": w["start"], "e": w["end"], "k": k})
        i += 1

    # phrases break on punctuation or a pause > 0.6s
    phrases, cur = [], []
    for j, w in enumerate(out):
        cur.append(w)
        nxt = out[j + 1] if j + 1 < len(out) else None
        if nxt is None or w["t"][-1] in ".,?!" or nxt["s"] - w["e"] > 0.6:
            phrases.append(cur)
            cur = []
    # glue one-word phrases onto a short neighbour so nothing dangles alone
    merged = []
    for p in phrases:
        if merged and (len(p) == 1 or len(merged[-1]) == 1) and len(merged[-1]) + len(p) <= 4 \
                and sum(L(x) + 1 for x in merged[-1] + p) <= 24:
            merged[-1] = merged[-1] + p
        else:
            merged.append(p)
    # split long phrases into balanced groups of 3-4 words / ~22 characters
    groups = []
    for p in merged:
        chars = sum(L(x) + 1 for x in p)
        n = max(1, math.ceil(len(p) / 4), math.ceil(chars / 22))
        size = math.ceil(len(p) / n)
        groups += [p[k:k + size] for k in range(0, len(p), size)]

    G = []
    for gi, g in enumerate(groups):
        nxt = groups[gi + 1][0]["s"] if gi + 1 < len(groups) else a.t1
        G.append({"s": round(g[0]["s"], 3), "e": round(min(nxt, g[-1]["e"] + 0.6), 3),
                  "w": [w for x in g for w in words(x)]})
    json.dump(G, open(a.out, "w"), separators=(",", ":"))
    for g in G:
        print(f'{g["s"]:7.2f}-{g["e"]:7.2f}  ' + " | ".join(
            t + {"mark": "*", "offer": "#", "hi": "^"}.get(k, "") for t, k in g["w"]))
    print(len(G), "groups")


if __name__ == "__main__":
    main()
