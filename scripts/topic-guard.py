#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
语义查重闸门：出题员每出一道题，先查它与全库已有材料的语义相似度。

为什么需要它（第 111 轮建，三层漏检）：
  1) 标题字面查重查不出。已归档库里「空调设成二十六度」与「空调要开多少度」标题不同，
     但都是「某人让另一人把温度设成 X 度、干扰项靠改数字排除」，是同一考点。
  2) 词袋签名查不出。词集合完全一致才算重复，而这类同构是「同考点 + 换人物换数字」，
     词集合必然不同。
  3) 问句主干查得出大部分但会漏：空调那对问法不同，主干归一后仍不同。

模型：google/embeddinggemma-300m（本地 .models/embeddinggemma-300m，ModelScope 下载）。
阈值标定（第 111 轮实测 419 份材料，两两比对）：
  编码全文（标题+材料+题干）：>=0.80 的 10 对里 8 对是真重复（煮鸡蛋/停水/电费/声控灯/地震演习/
  书法课/图书角/校车）；阈值定 0.75，落在真假交界之上，共约 33 对，人工可逐对定性。
  只编码题干：反而更差——D/E 类没有 **Question** 行，两边都退化成只剩标题，
  D4-01 与 E-01 都叫「周末安排」直接算出 1.000 的假阳性。故采用全文编码。
  脚本只报相似度，不判「是不是同一道题」——那一步必须由人做。

三条子命令：
  build   扫描 data/item-bank 与 prod/，把全部材料编码进索引（增量：已入库的跳过）
  check   读若干条待查文本（每行一条，或 --stdin），返回各自最相似的库内材料
  scan    只扫库内两两重复，输出疑似重复组（供审核员定性）

退出码：有超阈值相似项时 check 退出 1；scan 找到重复组退出 1；build 成功退出 0。
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "data" / "item-bank"
MODEL = ROOT / ".models" / "embeddinggemma-300m"
INDEX = ROOT / "data" / "item-bank" / ".topic-index.json"

THRESHOLD = 0.75
_MODEL = None


def get_model():
    global _MODEL
    if _MODEL is None:
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        from sentence_transformers import SentenceTransformer
        _MODEL = SentenceTransformer(str(MODEL), device="cpu")
    return _MODEL


def material_files():
    out = []
    for d in (BANK, BANK / "prod"):
        if not d.is_dir():
            continue
        for f in sorted(d.glob("*.md")):
            if f.name in ("INDEX.md", "REVIEW-RUBRIC.md"):
                continue
            if not re.match(r"^[A-E]", f.stem):
                continue
            out.append(f)
    return out


def parse_materials(path: Path):
    """返回 [(id, title, text)]，text = 标题 + 材料正文 + 题干，压成一段用于编码。"""
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except Exception:
        return []
    items = []
    i = 0
    while i < len(lines):
        m = re.match(r"^##\s+(.+)$", lines[i])
        if not m:
            i += 1
            continue
        head = m.group(1).strip()
        mid = head.split()[0] if head.split() else head
        title = head[len(mid):].strip()
        body = []
        j = i + 1
        question = ""
        while j < len(lines) and not re.match(r"^##\s", lines[j]):
            body.append(lines[j])
            if not question and lines[j].strip() == "**Question**":
                question = lines[j + 1] if j + 1 < len(lines) else ""
            j += 1
        # 只取材料正文与题干，去掉选项与答案行（选项与答案不影响考点判定）
        keep = []
        for b in body:
            s = b.strip()
            if s.startswith("- A.") or s.startswith("- B.") or s.startswith("- C.") \
               or s.startswith("- D.") or s.startswith("- E.") or s.startswith("**Answer"):
                continue
            keep.append(b)
        if question:
            keep.append(question)
        text = (title + ". " + " ".join(keep)).strip()
        text = re.sub(r"\s+", " ", text)
        items.append({"id": mid, "file": path.name, "title": title, "text": text[:1200]})
        i = j
    return items


def load_index():
    if INDEX.is_file():
        try:
            return json.loads(INDEX.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {"model": "google/embeddinggemma-300m", "threshold": THRESHOLD, "items": []}


def save_index(idx):
    INDEX.write_text(json.dumps(idx, ensure_ascii=False), encoding="utf-8")


def encode_all(texts):
    import numpy as np
    return get_model().encode(texts, normalize_embeddings=True,
                              batch_size=32, show_progress_bar=False)


def cmd_build(args):
    """增量重建索引。

    第 113 轮修（reviewer-3 指出）：原实现按 key 跳过已入库项，
    于是**修复员改完题目再跑 build，改动进不了索引**——索引与磁盘静默不一致，
    语义闸门对改过的题仍在用旧向量。这是「工具悄悄失效」，比报错更危险。

    修法：每条索引项记文本哈希，内容变了就重编码。删除的批次条目也一并剔除。
    """
    import numpy as np
    import hashlib
    idx = load_index()
    old = {}
    for it in idx["items"]:
        old[it["key"]] = it
    live = {}
    fresh = []
    for f in material_files():
        for m in parse_materials(f):
            key = f"{m['file']}::{m['id']}"
            h = hashlib.md5(m["text"].encode("utf-8")).hexdigest()
            m["key"] = key
            m["h"] = h
            m.pop("text", None)
            live[key] = m
            prev = old.get(key)
            if prev is None:
                fresh.append(m)
            elif prev.get("h") != h:
                fresh.append(m)          # 内容变了 -> 重编码
    dropped = [k for k in old if k not in live]
    for k in dropped:
        idx["items"].remove(old[k])
    if not fresh:
        msg = f"索引已是最新：{len(idx['items'])} 条"
        if dropped:
            msg += f"，剔除已删除批次 {len(dropped)} 条"
        print(msg)
        if dropped:
            save_index(idx)
        return 0
    texts = [parse_text(None, m["key"]) for m in fresh]
    vecs = encode_all(texts)
    replaced = 0
    for m, v in zip(fresh, vecs):
        vec = [round(float(x), 5) for x in v]
        if m["key"] in old:
            idx["items"].remove(old[m["key"]])
            replaced += 1
        m["vec"] = vec
        idx["items"].append(m)
    idx["threshold"] = THRESHOLD
    save_index(idx)
    print(f"索引已更新：重编码 {replaced} 条，新增 {len(fresh)-replaced} 条，"
          f"总计 {len(idx['items'])} 条 -> {INDEX.name}")
    return 0


_TEXT_CACHE = {}


def parse_text(_f, key):
    fn, mid = key.split("::")
    path = BANK / fn
    if not path.is_file():
        path = BANK / "prod" / fn
    if path in _TEXT_CACHE:
        for m in parse_materials(path):
            pass
    for m in parse_materials(path):
        if f"{path.name}::{m['id']}" == key:
            return m["text"]
    return key


def cmd_check(args):
    import numpy as np
    idx = load_index()
    if not idx["items"]:
        print("索引为空，请先运行 build", file=sys.stderr)
        return 2
    raw = []
    if args.stdin:
        raw = [l.rstrip("\n") for l in sys.stdin]
    else:
        raw = [l.rstrip("\n") for l in open(args.input, encoding="utf-8")]
    # 第 111 轮补：候选行可写成「题号<TAB>文本」。题号用于排除自匹配——
    # 出题员写完一批就 build，之后再查这一批时，每道题都会与索引里的自己 1.000 命中，
    # 退出码恒为 1，审核员每次都得手工排除才能读懂（reviewer-1 与 reviewer-2 各自指出过）。
    # 给了题号就把同题号的索引条目剔掉；没给题号则不排除，退回旧行为。
    queries, selfids = [], []
    for line in raw:
        if not line.strip():
            continue
        if "\t" in line:
            head, rest = line.split("\t", 1)
            if head.strip() and len(head.strip()) <= 24 and not head.strip().endswith("."):
                selfids.append(head.strip())
                queries.append(rest.strip())
                continue
        queries.append(line.strip())
        selfids.append(None)
    if not queries:
        print("没有待查文本", file=sys.stderr)
        return 2
    known_fp = load_known_false_positives()
    bank = np.array([it["vec"] for it in idx["items"]], dtype=np.float32)
    qv = encode_all(queries)
    sims = qv @ bank.T
    worst = 0.0
    fp_hits = []
    lines = []
    for qi, q in enumerate(queries):
        row = sims[qi].copy()
        sid = selfids[qi] if qi < len(selfids) else None
        if sid:
            # 剔除同题号的自匹配条目，再参与 top-N 与阈值判定
            for oi, it in enumerate(idx["items"]):
                if it["id"] == sid:
                    row[oi] = -1.0
        if float(row.max()) <= -1.0:
            lines.append(f"[查询 {qi+1}] {q[:78]}")
            lines.append(f"    （已排除自匹配 {sid}，索引内无其他可比条目）")
            lines.append("")
            continue
        # 第 113 轮补：已定性的假阳性不参与阈值判定。
        # 起因是 R1-A10 —— V-A10 的 topic-guard check 因 A10-03/A13-04=0.775 退出码 1，
        # 而这一对早已在 DUP-ADJUDICATION.md 挂账表里判为非重复。
        # **我上一轮只给 scan 加了挂账过滤、漏了 check**，于是单批检查仍然 FAIL。
        for oi, it in enumerate(idx["items"]):
            if sid and it["id"] == sid:
                continue
            if frozenset([sid, it["id"]]) in known_fp if sid else False:
                row[oi] = -1.0
        order = np.argsort(-row)[: args.top]
        head = q[:78]
        tag = f"  [{sid}]" if sid else ""
        lines.append(f"[查询 {qi+1}]{tag} {head}")
        for oi in order:
            it = idx["items"][oi]
            s = float(row[oi])
            mark = "  <== 超阈值" if s >= THRESHOLD else ""
            lines.append(f"    {s:.3f}  {it['id']:<10} {it['file']:<14} {it['title'][:34]}{mark}")
        if sid:
            for oi, it in enumerate(idx["items"]):
                if frozenset([sid, it["id"]]) in known_fp:
                    fp_hits.append((float(sims[qi][oi]), sid, it["id"]))
        top = float(row[order[0]])
        worst = max(worst, top)
        lines.append("")

    # 候选题彼此之间也要比。
    # 第 111 轮补：原先只与索引比，于是「同一批里两道题重复」查不出来——
    # 而出题员是并行写多批的，谁先 build 谁先进索引，后写的批次若没等到 build 就查不到前一批。
    # 这个盲区是 reviewer-1 指出来的。候选互比不依赖任何 build 顺序。
    intra = []
    if len(qv) > 1:
        SS = qv @ qv.T
        np.fill_diagonal(SS, -1.0)
        for i in range(len(qv)):
            for j in range(i + 1, len(qv)):
                if SS[i][j] >= THRESHOLD:
                    intra.append((float(SS[i][j]), i, j))
        intra.sort(key=lambda x: -x[0])
    if intra:
        lines.append("## 候选题彼此重复（本批内部，必须换掉其中一个）")
        for s, i, j in intra:
            lines.append(f"  {s:.3f}  [查询 {i+1}] {queries[i][:44]}")
            lines.append(f"           [查询 {j+1}] {queries[j][:44]}")
        lines.append("")

    print("\n".join(lines))
    print(f"阈值 {THRESHOLD}｜与索引最高相似度 {worst:.3f}｜批内超阈值对 {len(intra)}")
    if fp_hits:
        print("")
        print("以下命中已在 DUP-ADJUDICATION.md 挂账表判为非重复，不计入判定：")
        for s, a, b in sorted(fp_hits, key=lambda x: -x[0])[: args.top]:
            print(f"    {s:.3f}  {a} / {b}")
        print("")
    if worst >= THRESHOLD or intra:
        print("VERDICT: 有超阈值相似项，必须换题后重查")
        return 1
    print("VERDICT: 通过，无超阈值相似项（已排除已定性的假阳性）")
    return 0


def load_known_false_positives():
    """读 DUP-ADJUDICATION.md 的挂账表，取出已定性的假阳性题号对。

    第 113 轮补（reviewer-3 指出）：scan 只按相似度报，闸门只看这个输出，
    **它不知道挂账表里已经写明「非重复」**。于是已定性的假阳性会随每轮新增批次持续累积，
    让闸门永远 FAIL——R2-A16 卡住的原因正是这个，不是没人裁决。
    **改题只会制造新的 F 轮工作量、换不来绿灯。**
    """
    path = Path(__file__).resolve().parent.parent / "docs" / "pipeline" / "DUP-ADJUDICATION.md"
    if not path.is_file():
        return set()
    try:
        txt = path.read_text(encoding="utf-8")
    except Exception:
        return set()
    pairs = set()
    for line in txt.splitlines():
        if "非重复" not in line and "长期挂账" not in line:
            continue
        # 题号有两种形态：归档首批用「A-18」（字母后直接连字符、无题号），
        # 其余用「A18-11」。第 113 轮初版只匹配后一种，A-18/A-06 这类挂账读不到。
        ids = re.findall(r"\b([A-E](?:-\d{1,2}|\d{1,2}-\d{2}))\b", line)
        if len(ids) >= 2:
            pairs.add(frozenset(ids[:2]))
    return pairs


def cmd_scan(args):
    import numpy as np
    known_fp = load_known_false_positives()
    idx = load_index()
    if not idx["items"]:
        print("索引为空，请先运行 build", file=sys.stderr)
        return 2
    V = np.array([it["vec"] for it in idx["items"]], dtype=np.float32)
    S = V @ V.T
    np.fill_diagonal(S, -1.0)
    n = len(idx["items"])
    pairs = []
    for i in range(n):
        for j in range(i + 1, n):
            if S[i][j] >= THRESHOLD:
                a, b = idx["items"][i], idx["items"][j]
                if a["file"] == b["file"]:
                    continue
                fp = frozenset([a["id"], b["id"]])
                pairs.append((float(S[i][j]), a, b, fp in known_fp))
    pairs.sort(key=lambda x: -x[0])
    fp_pairs = [p for p in pairs if p[3]]
    open_pairs = [p for p in pairs if not p[3]]
    print(f"索引 {n} 条｜阈值 {THRESHOLD}｜跨批次超阈值 {len(pairs)} 对"
          f"（已定性假阳性 {len(fp_pairs)}｜待裁决 {len(open_pairs)}）")
    print("")
    if open_pairs:
        print("## 待裁决（需人工定性）")
        for s, a, b, _ in open_pairs[: args.limit]:
            print(f"  {s:.3f}")
            print(f"      {a['id']:<10} {a['file']:<14} {a['title']}")
            print(f"      {b['id']:<10} {b['file']:<14} {b['title']}")
        print("")
    if fp_pairs:
        print("## 已定性为假阳性（DUP-ADJUDICATION.md 挂账表）——不用再改")
        for s, a, b, _ in fp_pairs[: args.limit]:
            print(f"  {s:.3f}  {a['id']} / {b['id']}")
        print("")
    if open_pairs:
        print("以上是待人工定性的候选：脚本只报相似度，不判是不是同一道题。")
        print("**已定性的假阳性已从待裁决里排除**——它们每次都会出现，但改题只会制造新的修复轮工作量、换不来绿灯。")
        return 1
    if fp_pairs:
        print("PASS: 无待裁决的跨批次重复（列出的均为已定性假阳性）")
        return 0
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("build")
    c = sub.add_parser("check")
    c.add_argument("input", nargs="?", default="-")
    c.add_argument("--stdin", action="store_true")
    c.add_argument("--top", type=int, default=3)
    s = sub.add_parser("scan")
    s.add_argument("--limit", type=int, default=60)
    a = ap.parse_args()
    if a.cmd == "build":
        return cmd_build(a)
    if a.cmd == "check":
        return cmd_check(a)
    if a.cmd == "scan":
        return cmd_scan(a)
    return 2


if __name__ == "__main__":
    sys.exit(main())
