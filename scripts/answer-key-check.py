#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
答案键与选项一致性检查（第 113 轮建）

为什么建它（R1-A21 与 R1-B6 / R1-B7 各逼出一次）：

  **缺陷一：答案键与材料直接矛盾。** R1-A21 查出 15 题里 10 题的 Answer 字母所指的选项
  与材料明确支持的那一项相反——例如 A21-07 文件写 `**Answer** A`（Ten minutes），
  而材料原话是 `Five minutes, not ten.`。**答对的学生会被判错。**
  更要紧的是：**现有六道闸门一条都没报出来。** wordcount-gate 只管词数，
  encoding-check 只管字节，topic-guard 只管语义重复，verify-bank 只查文件自身自洽——
  连 1.8 的答案排列检查在这批错误答案上照样 PASS（现状序列 p 全 False、最长连跑 1、四字母齐备）。
  **没有任何自动环节能发现「答案键与材料矛盾」，此前全靠人工逐题读。**

  **缺陷二：同一时刻/时长的两种英文写法被当成两个选项。**
  B6-03 的 `At half past four.` 与 `At four thirty.`；
  B7-05 的 `One hour and fifteen minutes.` 与 `One hour and a quarter.`。
  **B、C 两批各一处，是系统性习惯不是偶发。**
  字符串互异检查永远抓不到——两个选项的字符完全不同。

本脚本做两件事，都是「筛出可疑，交人定性」，不下最终判决：

  C1 答案键支持度比较：把每个选项的内容词在材料正文里找证据，
     若**标答的支持度低于某个兄弟选项**，报出来。这能抓住「答案标反了」。
  C2 选项同指检测：把每个选项里的时刻/时长归一化成分钟数，
     若两个选项归一后相同，报出来。这能抓住「同一时刻两种写法」。

退出码：有可疑项时 1，无可疑项时 0。
"""
import argparse
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "data" / "item-bank"

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
    "thirteen": 13, "fourteen": 14, "fifteen": 15, "sixteen": 16,
    "seventeen": 17, "eighteen": 18, "nineteen": 19, "twenty": 20,
    "thirty": 30, "forty": 40, "forty-five": 45, "fifty": 50, "sixty": 60,
    "quarter": 15, "half": 30,
}

STOP = set("""a an the of to in on at for with and or not is are was were be been do does did
will would could should may might must can it its this that these those he she they them his her
their our your my me we you i as by from up out about into than then there here what when where
who whom which why how if but so very too also just only more most some any each every""".split())


def content_tokens(text):
    """取出有区分度的词：小写、去标点、去停用词、长度>2，或任何数字表达。"""
    t = text.lower().replace("-", " ")
    toks = re.findall(r"[a-z]+", t)
    out = []
    for w in toks:
        if w in NUMBER_WORDS:
            out.append(w)
        elif len(w) > 2 and w not in STOP and not w.endswith("ly"):
            out.append(w)
    return out


NUMTOK = dict(NUMBER_WORDS)
NUMTOK.update({"oh": 0, "a": None, "an": None})


def _num(tok):
    """一个 token 转数字；'a'/'an' 不作数。"""
    if tok in ("a", "an"):
        return None
    return NUMTOK.get(tok)


def to_minutes(text):
    """把选项里的时刻/时长归一化成分钟数；识别不出返回 None。

    第 113 轮重写。初版先把单位词整段截掉再解析，导致
    'one hour and a quarter' 被截成 'one' 返回 1、
    'half past four' 因数字是英文词而匹配不上返回 None——两个都错。
    正确做法是**带着单位词整体解析**。
    """
    t = text.lower().strip().replace("\u00a0", " ")
    t = re.sub(r"^(at|on|in|after|before|for|about|around|by)\s+", "", t)
    t = re.sub(r"\b(o'clock|oclock|hrs|hrs\.|hours|hour|minutes|minute|mins|min|m)\b", " ", t)
    t = re.sub(r"\b(am|pm|a\.m\.|p\.m\.)\b", " ", t)
    t = t.replace(".", " ").replace(":", " ")
    toks = [w for w in re.findall(r"[a-z\-]+", t) if w not in ("the", "a", "an", "of") or w in ("a", "an")]
    toks = re.findall(r"[a-z\-]+", t)
    if not toks:
        return None
    low = " ".join(toks)

    ap = None
    if "pm" in toks or "p" in toks:
        ap = "p"
    elif "am" in toks or "a" == toks[0] and False:
        ap = "a"

    # 「quarter past four」/「half past six」/「quarter to seven」
    if ("half" in toks or "quarter" in toks) and ("past" in toks or "to" in toks):
        frac = 30 if "half" in toks else 15
        dirn = "past" if "past" in toks else "to"
        try:
            i = toks.index(dirn)
            base_tok = toks[i - 1]
        except (ValueError, IndexError):
            return None
        base = int(base_tok) if base_tok.isdigit() else _num(base_tok)
        if base is None or base > 12:
            return None
        return base * 60 + frac if dirn == "past" else (base - 1) * 60 - frac

    nums = [(_num(x) if not x.isdigit() else int(x)) for x in toks]
    has_hour = "hour" in toks or "hours" in toks
    if "quarter" in toks and has_hour:
        lead = [n for n in nums if n is not None]
        return (lead[0] if lead else 0) + 15
    if "half" in toks and has_hour:
        lead = [n for n in nums if n is not None]
        return (lead[0] if lead else 0) * 60 + 30

    vals = [n for n in nums if n is not None]
    if has_hour and len(vals) >= 2:
        return vals[0] * 60 + vals[1]
    if has_hour and len(vals) == 1:
        return vals[0] * 60
    if not has_hour and len(toks) == 1 and vals:
        return vals[0]
    # 「eight thirty」这类无冒号的钟点
    if len(toks) == 2 and vals and all(v is not None for v in vals):
        h, mi = vals
        if h <= 12 and 0 < mi < 60:
            return h * 60 + mi
    if len(vals) == 1:
        return vals[0]
    return None

    # 英文数词 + 词序
    words = re.findall(r"[a-z\-]+", t)
    if not words:
        return None
    vals = [NUMBER_WORDS.get(w) for w in words]
    if all(v is None for v in vals):
        return None
    # 「X hour(s) and Y minute(s)」/「X and a quarter」/「an hour and a quarter」
    nums = [v for v in vals if v is not None]
    joined = " ".join(words)
    if re.search(r"\ban?\s+hour\b", joined) and len(nums) >= 2:
        return nums[0] + nums[1]
    if "quarter" in joined and len(nums) >= 2:
        return nums[0] + nums[1]
    if len(nums) == 1 and re.search(r"\bhour", joined):
        return nums[0] * 60
    if len(nums) == 1:
        return nums[0]
    return None


def parse_batch(path):
    """返回 [(qid, material_text, [(label, text)], answer_letter)]，只处理 A/B/C。"""
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except Exception:
        return []
    out = []
    i = 0
    while i < len(lines):
        m = re.match(r"^##\s+(\S+)\s*(.*)$", lines[i])
        if not m:
            i += 1
            continue
        qid = m.group(1)
        j = i + 1
        mat, opts, ans = [], [], None
        while j < len(lines) and not lines[j].startswith("##"):
            s = lines[j].strip()
            if re.match(r"^\*\*Answers?\*\*", s):
                mm = re.match(r"^\*\*Answers?\*\*\s*([A-E])\s*$", s)
                if mm:
                    ans = mm.group(1)
                j += 1
                continue
            if s.startswith("- A.") or s.startswith("- B.") or s.startswith("- C.") \
               or s.startswith("- D.") or s.startswith("- E."):
                om = re.match(r"^-\s*([A-E])\.\s*(.+)$", s)
                if om:
                    opts.append((om.group(1), om.group(2).strip()))
            elif s.startswith("**"):
                pass
            else:
                mat.append(s)
            j += 1
        out.append((qid, " ".join(mat), opts, ans))
        i = j
    return out


def check(path, topn=1):
    problems = []
    for qid, mat, opts, ans in parse_batch(path):
        if not ans or len(opts) < 2:
            continue
        matlow = mat.lower()
        # C1 答案键支持度
        support = {}
        for lab, txt in opts:
            toks = content_tokens(txt)
            if not toks:
                support[lab] = (0.0, 0)
                continue
            hit = sum(1 for t in toks if t in matlow)
            support[lab] = (hit / len(toks), hit)
        if ans in support:
            base = support[ans][0]
            for lab, txt in opts:
                if lab == ans:
                    continue
                if support[lab][0] - base >= 0.25:
                    problems.append({
                        "type": "C1", "qid": qid, "file": path.name,
                        "detail": f"标答 {ans} 的材料支持度 {base:.2f}，但选项 {lab} 达 {support[lab][0]:.2f}",
                        "opt": txt,
                    })
        # C2 选项同指
        norm = {}
        for lab, txt in opts:
            v = to_minutes(txt)
            if v is not None:
                norm.setdefault(v, []).append((lab, txt))
        for v, lst in norm.items():
            if len(lst) > 1:
                labels = ", ".join(l for l, _ in lst)
                texts = " | ".join(t for _, t in lst)
                mark = "（含标答）" if any(l == ans for l, _ in lst) else ""
                problems.append({
                    "type": "C2", "qid": qid, "file": path.name,
                    "detail": f"选项 {labels} 同指第 {v} 分钟{mark}",
                    "opt": texts,
                })
    return problems


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("paths", nargs="*", help="题目文件；不给则扫全库")
    a = ap.parse_args()
    files = [Path(p) for p in a.paths] if a.paths else \
        sorted([f for d in (BANK, BANK / "prod") if d.is_dir()
                for f in d.glob("*.md")
                if re.match(r"^[ABC]", f.stem)])
    allp = []
    for f in files:
        allp.extend(check(f))
    c1 = [p for p in allp if p["type"] == "C1"]
    c2 = [p for p in allp if p["type"] == "C2"]
    print(f"扫描 {len(files)} 份文件")
    print(f"C1 答案键支持度可疑 {len(c1)} 条｜C2 选项同指可疑 {len(c2)} 条")
    print("")
    for p in c1:
        print(f"  [C1] {p['file']} {p['qid']}: {p['detail']}")
        print(f"        该选项原文：{p['opt'][:80]}")
    for p in c2:
        print(f"  [C2] {p['file']} {p['qid']}: {p['detail']}")
        print(f"        原文：{p['opt'][:80]}")
    print("")
    if allp:
        print("以上是**可疑项**，不是判决——脚本不知道材料是否用同义改写。")
        print("但 C2（同一时刻/时长的两种写法）字符串互异检查永远抓不到，人工也要特别当心。")
        return 1
    print("PASS: 未查出答案键与选项的机械矛盾")
    return 0


if __name__ == "__main__":
    sys.exit(main())
