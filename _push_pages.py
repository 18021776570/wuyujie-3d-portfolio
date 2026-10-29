"""增量更新 gh-pages 分支（GitHub contents API），避免克隆 56MB 视频。"""
import base64
import json
import os
import subprocess
import urllib.request

REPO = "18021776570/wuyujie-3d-portfolio"
BRANCH = "gh-pages"
ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "dist")


def token() -> str:
    out = subprocess.run(
        ["git", "credential", "fill"],
        input="protocol=https\nhost=github.com\n\n",
        capture_output=True,
        text=True,
    ).stdout
    for line in out.splitlines():
        if line.startswith("password="):
            return line[len("password="):]
    raise SystemExit("no token")


TOKEN = token()


def api(path: str, method: str = "GET", payload: dict | None = None):
    url = f"https://api.github.com{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "portfolio-deploy")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="ignore")[:500]
        print(f"[HTTP {e.code}] {method} {path}\n  {body}")
        raise


def put(rel: str, local: str, message: str):
    size = os.path.getsize(local)
    path = f"/repos/{REPO}/contents/{rel}"
    remote_sha = None
    remote_size = None
    try:
        info = api(f"{path}?ref={BRANCH}")
        remote_sha = info.get("sha")
        remote_size = info.get("size")
    except Exception:
        pass
    if remote_sha is not None:
        if size == remote_size:
            print(f"skip(unchanged) {rel}")
            return
        if size > 20 * 1024 * 1024:
            # contents API 处理不了的大文件且远端已有旧版（大小不同）：需要 git 推送，跳过并提示
            print(f"WARN(too large & changed, needs git push) {rel}")
            return
    with open(local, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    body = {"message": message, "content": content, "branch": BRANCH}
    if remote_sha:
        body["sha"] = remote_sha
    api(path, "PUT", body)
    print(f"updated {rel} ({size/1024/1024:.2f} MB)")


def delete(rel: str, message: str):
    path = f"/repos/{REPO}/contents/{rel}"
    try:
        sha = api(f"{path}?ref={BRANCH}")["sha"]
    except Exception:
        print("skip", rel)
        return
    api(path, "DELETE", {"message": message, "sha": sha, "branch": BRANCH})
    print("deleted", rel)


MSG = "添加真实视频与三维作品到作品集"


def walk_dist():
    """列出 dist 下的所有相对路径（目录 + 文件）。"""
    rels = []
    for dp, dirs, fs in os.walk(DIST):
        dirs[:] = [d for d in dirs if d != ".git"]
        for f in fs:
            full = os.path.join(dp, f)
            rel = os.path.relpath(full, DIST).replace("\\", "/")
            rels.append(rel)
    return rels


def remote_tree(prefix=""):
    """递归列出分支上 prefix 目录下的所有文件路径（contents API 不分页只返回整体）。"""
    out = []
    path = prefix or ""
    try:
        items = api(f"/repos/{REPO}/contents/{path}?ref={BRANCH}" if path else f"/repos/{REPO}/contents?ref={BRANCH}")
    except Exception as e:
        print("skip list", prefix, e)
        return out
    for it in items:
        if it["type"] == "dir":
            out += remote_tree(it["path"])
        else:
            out.append(it["path"])
    return out


local_files = walk_dist()
remote_files = remote_tree()
local_set = set(local_files)

for rel in sorted(local_files):
    put(rel, os.path.join(DIST, rel), MSG)

# 清理线上已失效的旧文件（不在本次 dist 里的一律删除；.nojekyll 必须保留）
for rel in sorted(remote_files):
    if rel not in local_set and rel != ".nojekyll":
        delete(rel, MSG)
print("done")
