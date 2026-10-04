#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
dispatch-guard：派工前机器校验「自验冲突」与「区间标签」两个前提。

第 113 轮建立。起因是本轮同一物种的六次派工/落盘失误：
  1) topic-guard build 报「索引已是最新」，但那次是改动前跑的
  2) C7/C8/C9 的 V 报告 MD5 指向会被后续修复改动的字节
  3) 任务书把 A21 的数字填进 A16 的对照行
  4) 任务书写「A18/A22 换过题」，依据是 F2-A18toA28 的**文件名**
  5) 任务书写「F1 修复是 writer-a 做的」同时把活派给 writer-a
  6) 「写已有则写 -2」在 -2 已存在时覆盖

共同点：都是「凭记忆或凭文件名做的断言」，而正确答案是「一次查表」。

设计约束：
  * 离线、仅标准库（hashlib / pathlib / re / argparse）。
  * **读文件要精确**：逐行流式扫描，只保留命中的行；不把整份记录读进内存，
    也不整目录读内容。修复记录里「被修文件」清单的位置不统一，先 grep 定位再取那一小段。
  * **不确定就输出 UNKNOWN，不猜。**本脚本的价值在于消除猜测，加猜测等于白做。
  * 区间标签不算数：批次归属只认记录正文里声明的「被修文件」清单，不认记录自己的文件名。
  * 退出码：0 = 通过 / 无冲突；1 = 发现冲突、覆盖风险或缺基线；2 = 用法或输入错误。
"""

import argparse
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "data" / "item-bank"
PROD = BANK / "prod"
REVIEWS = BANK / "reviews"
FIXES = BANK / "fixes"

MD5_RE = re.compile(r"\b([0-9a-f]{32})\b")
MD_FILE_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]*\.md")
BATCH_STEM_RE = re.compile(r"^([ABCD](?:-batch\d+|\d+)?)$", re.IGNORECASE)
AUTHOR_RE = re.compile(r"执行者\s*[：:｜|]\s*\**\s*([A-Za-z][A-Za-z0-9_-]*)")
DECL_KEYS = ("被修文件", "被改文件", "修复文件", "修改文件", "被修批次")


def out(s=""):
    print(s)


def die(code=2, msg="用法错误"):
    out(msg)
    sys.exit(code)


def md5_of(path):
    """整文件算 MD5——这是本脚本唯一必须通读全文的操作（哈希本来就跑不开）。"""
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def stat_of(path):
    b = path.read_bytes()
    return {
        "bytes": len(b),
        "lines": len(b.decode("utf-8", errors="replace").splitlines()),
        "last": b[-1] if b else -1,
    }


def grep(path, patterns, limit=40):
    """逐行流式扫描，只保留命中行；绝不把整份文件读进内存。"""
    hits = []
    pats = [re.compile(p) for p in patterns]
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                if any(p.search(line) for p in pats):
                    hits.append(line.rstrip("\n"))
                    if len(hits) >= limit:
                        break
    except OSError:
        return []
    return hits


def norm_batch(stem):
    """把文件名主干规范化成批次名（A32 / C7 / E-batch1 / A-batch0）。"""
    m = BATCH_STEM_RE.match(stem.strip())
    return m.group(1).upper() if m else None


def find_item(batch):
    """题目文件的位置：先 prod/ 再库根。找不到返回 None。"""
    for d in (PROD, BANK):
        p = d / (batch + ".md")
        if p.is_file():
            return p
    return None


def fix_records():
    return sorted(FIXES.glob("*.md")) if FIXES.is_dir() else []


def review_files():
    return sorted(REVIEWS.glob("*.md")) if REVIEWS.is_dir() else []


def record_declares(path):
    """返回该修复记录**正文声明**的被修批次集合；第二个返回值表示是否找到声明行。

    区间标签不算数：只从「被修文件」等声明行里取，绝不从记录自己的文件名取。
    """
    decl_lines = grep(path, DECL_KEYS, limit=10)
    if not decl_lines:
        return set(), False
    batches = set()
    for line in decl_lines:
        for m in MD_FILE_RE.finditer(line):
            b = norm_batch(m.group(0)[:-3])
            if b:
                batches.add(b)
    return batches, True


def record_author(path):
    """记录里声明的执行者；没有就返回 None（调用方据此输出 UNKNOWN，不猜）。"""
    for line in grep(path, [AUTHOR_RE.pattern], limit=3):
        m = AUTHOR_RE.search(line)
        if m:
            return m.group(1)
    return None


def record_post_md5s(path):
    """记录里「修后」的 MD5 候选集合。

    优先取含「修后/post」字样的行上的 32 位十六进制；取不到时退回结论节内出现的
    全部 32 位十六进制。两者都取不到就返回空集，由调用方判 UNKNOWN——不猜。
    """
    post = set()
    head = set()
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                toks = set(MD5_RE.findall(line))
                if not toks:
                    continue
                low = line.lower()
                if ("修后" in line) or ("post" in low):
                    post |= toks
                if not re.match(r"^##\s*[一二三四五六七八九十]", line):
                    head |= toks
    except OSError:
        pass
    return post if post else head


def rel(p):
    try:
        return str(Path(p).relative_to(ROOT)).replace("\\", "/")
    except ValueError:
        return str(p)


def cmd_agent(args):
    """这个执行者真的没参与这些批次的产出或修复吗？"""
    batches = [norm_batch(b) for b in args.batches.split(",") if b.strip()]
    batches = [b for b in batches if b]
    if not batches:
        die(2, "用法：agent <name> --batches A26,A28,A32")
    out("=" * 68)
    out("DISPATCH-GUARD · agent=%s · 批次=%s" % (args.name, ",".join(batches)))
    out("=" * 68)
    conflicts, unknowns, checked = [], [], 0
    for rec in fix_records():
        declared, ok = record_declares(rec)
        if not ok:
            continue
        hit = declared.intersection(batches)
        if not hit:
            continue
        checked += 1
        author = record_author(rec)
        verdict = "UNKNOWN" if author is None else ("CONFLICT" if author == args.name else "OK")
        out("")
        out("记录：%s" % rel(rec))
        out("  记录自称的被修批次：%s（取自正文声明，不取自文件名）" % ",".join(sorted(declared)))
        out("  执行者：%s" % (author if author else "UNKNOWN（记录未声明执行者）"))
        detail = []
        for b in sorted(hit):
            item = find_item(b)
            if item is None:
                detail.append("%s: 题目文件不在 prod/ 与库根，UNKNOWN" % b)
                continue
            cur = md5_of(item)
            inside = cur in record_post_md5s(rec)
            detail.append("%s: 磁盘 %s %s" % (b, cur[:8], "与记录「修后」一致" if inside else "不在记录「修后」集合内"))
        out("  批次现状：%s" % "；".join(detail))
        out("  判定：%s" % verdict)
        if verdict == "CONFLICT":
            conflicts.append((sorted(hit), rel(rec)))
        elif verdict == "UNKNOWN":
            unknowns.append((sorted(hit), rel(rec)))
    out("")
    out("-" * 68)
    out("命中记录 %d 条。" % checked)
    if conflicts:
        for bs, r in conflicts:
            out("CONFLICT: %s <- %s" % (",".join(bs), r))
        out("结论：CONFLICT —— 该执行者参与过上述批次的修复，不得复核它们。")
        return 1
    if unknowns:
        for bs, r in unknowns:
            out("UNKNOWN: %s <- %s（声明改过这批但未署名，无法判定是否构成冲突）" % (",".join(bs), r))
        out("结论：UNKNOWN —— 需人工确认记录执行者，不能据此放行。")
        return 1
    out("CLEAN —— 未发现该执行者参与这些批次的修复记录。")
    return 0


def governing_r1(batch):
    """该批次的现行 R1：有 -N 的取后缀最大者（既定口径）。只按文件名判断，不读内容。"""
    cands = []
    for p in review_files():
        m = re.match(r"^R1-%s(?:\.(\d+))?\.md$" % re.escape(batch), p.name, re.IGNORECASE)
        if m:
            cands.append((int(m.group(1)) if m.group(1) else 1, p))
    return sorted(cands)[-1][1] if cands else None


def cmd_touched(args):
    """这一批自 R1 之后到底被改过没有？改了哪些记录？"""
    batch = norm_batch(args.batch)
    if not batch:
        die(2, "用法：touched <批次>，例如 touched A26")
    out("=" * 68)
    out("DISPATCH-GUARD · touched %s" % batch)
    out("=" * 68)
    item = find_item(batch)
    if item is None:
        out("UNKNOWN：找不到批次 %s 的题目文件（prod/ 与库根都没有）。" % batch)
        return 1
    cur = md5_of(item)
    out("当前磁盘：%s  (%s)" % (cur, rel(item)))
    r1 = governing_r1(batch)
    r1_md5 = None
    if r1 is None:
        out("R1 基线：UNKNOWN —— reviews/ 下找不到 R1-%s*.md。" % batch)
    else:
        toks = []
        for line in grep(r1, [MD5_RE.pattern], limit=12):
            if "md5" in line.lower() or "基线" in line:
                toks.extend(MD5_RE.findall(line))
        if not toks:
            for line in grep(r1, [MD5_RE.pattern], limit=12):
                toks.extend(MD5_RE.findall(line))
        r1_md5 = toks[0] if toks else None
        out("R1 记录：%s" % rel(r1))
        out("R1 记录的 MD5：%s" % (r1_md5 or "UNKNOWN（该报告正文未出现可解析的 MD5）"))
    out("")
    out("fixes/ 下声明改过本批的记录（区间标签不算数）：")
    changers = []
    for rec in fix_records():
        declared, ok = record_declares(rec)
        if ok and batch in declared:
            inside = cur in record_post_md5s(rec)
            out("  - %s（磁盘 MD5 %s）" % (rel(rec), "在记录「修后」集合内" if inside else "不在记录「修后」集合内"))
            changers.append(rel(rec))
    if not changers:
        out("  （无）")
    out("")
    if changers:
        out("CHANGED by %s" % ", ".join(changers))
        return 0
    if r1_md5 is None:
        out("UNKNOWN —— 无修复记录声明改过本批，且 R1 基线不可解析。")
        return 1
    if r1_md5 == cur:
        out("UNCHANGED-SINCE-R1 —— 无任何修复记录声明改过本批，且磁盘 MD5 与 R1 记录逐位相同。")
        return 0
    out("CHANGED by UNKNOWN —— 磁盘 MD5 与 R1 记录不同（%s → %s），但无任何修复记录声明改过本批。"
        % (r1_md5[:8], cur[:8]))
    out("  这是「基线失效但无人负责」：改动存在，但无人署名。")
    return 1


def cmd_slot(args):
    """给这一批写新报告，落点文件名该是什么？会不会覆盖？"""
    batch = norm_batch(args.batch)
    if not batch:
        die(2, "用法：slot <批次> [--prefix V]")
    base = "%s-%s" % (args.prefix, batch)
    out("=" * 68)
    out("DISPATCH-GUARD · slot %s（前缀 %s）" % (batch, args.prefix))
    out("=" * 68)
    pat = re.compile(r"^%s\.md$" % re.escape(base))
    patn = re.compile(r"^%s-(\d+)\.md$" % re.escape(base))
    plain, nums = False, []
    for p in review_files():
        if pat.match(p.name):
            plain = True
        else:
            m = patn.match(p.name)
            if m:
                nums.append(int(m.group(1)))
    nums.sort()
    exist = ([base + ".md"] if plain else []) + ["%s-%d.md" % (base, n) for n in nums]
    out("已存在：%s" % ("、".join(exist) if exist else "（无）"))
    out("（只读文件名与元数据，未打开任何报告内容）")
    if plain:
        target = "%s-%d.md" % (base, (max(nums) + 1) if nums else 2)
    elif not nums:
        target = "%s.md" % base
    else:
        target = "%s-%d.md" % (base, max(nums) + 1)
    gaps = []
    if plain and 1 in nums:
        gaps.append(1)
    for a, b in zip(nums, nums[1:]):
        if b - a > 1:
            gaps.extend(range(a + 1, b))
    out("")
    out("下一个落点：%s" % target)
    if gaps:
        out("⚠ 编号断层：缺 %s —— 说明中间某一版被覆盖或删除过。" % "、".join("-%d" % g for g in gaps))
    if (REVIEWS / target).exists():
        out("目标文件已存在，非零退出以防覆盖。")
        return 1
    out("目标不存在，可安全落盘。")
    return 0


def cmd_baseline(args):
    """当前 MD5 / 字节数 / 行数 / 末字节，供派工时填进任务书。"""
    batch = norm_batch(args.batch)
    if not batch:
        die(2, "用法：baseline <批次>")
    out("=" * 68)
    out("DISPATCH-GUARD · baseline %s" % batch)
    out("=" * 68)
    item = find_item(batch)
    if item is None:
        out("UNKNOWN：找不到批次 %s 的题目文件（prod/ 与库根都没有）。" % batch)
        return 1
    st = stat_of(item)
    out("路径        ：%s" % rel(item))
    out("MD5         ：%s" % md5_of(item))
    out("字节数      ：%d" % st["bytes"])
    out("行数        ：%d" % st["lines"])
    out("末字节      ：0x%02X%s" % (st["last"], "（LF）" if st["last"] == 10 else "（**不是 LF，落盘会被 encoding-check 拦**）"))
    out("")
    out("提醒：本命令只用于核对任务书里写的数是否已过期；执行者仍须自己重算。")
    return 0


def main():
    ap = argparse.ArgumentParser(
        prog="dispatch-guard.py",
        description="派工前机器校验自验冲突与区间标签两个前提（离线，仅标准库）。",
    )
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("agent", help="该执行者是否参与过这些批次的修复")
    a.add_argument("name")
    a.add_argument("--batches", required=True, help="逗号分隔，如 A26,A28,A32")
    a.set_defaults(fn=cmd_agent)
    b = sub.add_parser("touched", help="这一批自 R1 之后被改过没有")
    b.add_argument("batch")
    b.set_defaults(fn=cmd_touched)
    c = sub.add_parser("slot", help="新报告的下一个可用落点")
    c.add_argument("batch")
    c.add_argument("--prefix", default="V", help="报告前缀，默认 V")
    c.set_defaults(fn=cmd_slot)
    d = sub.add_parser("baseline", help="当前 MD5/字节/行/末字节")
    d.add_argument("batch")
    d.set_defaults(fn=cmd_baseline)
    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
