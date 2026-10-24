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
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def put(rel: str, local: str, message: str):
    with open(local, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    path = f"/repos/{REPO}/contents/{rel}"
    sha = None
    try:
        sha = api(f"{path}?ref={BRANCH}")["sha"]
    except Exception:
        sha = None
    body = {"message": message, "content": content, "branch": BRANCH}
    if sha:
        body["sha"] = sha
    api(path, "PUT", body)
    print("updated", rel)


def delete(rel: str, message: str):
    path = f"/repos/{REPO}/contents/{rel}"
    try:
        sha = api(f"{path}?ref={BRANCH}")["sha"]
    except Exception:
        print("skip", rel)
        return
    api(path, "DELETE", {"message": message, "sha": sha, "branch": BRANCH})
    print("deleted", rel)


MSG = "作品集改为卡片式画廊：左右滑动切换"
html = os.path.join(DIST, "index.html")
put("index.html", html, MSG)
new_assets = set(os.listdir(os.path.join(DIST, "assets")))
for fn in sorted(new_assets):
    put(f"assets/{fn}", os.path.join(DIST, "assets", fn), MSG)

# 清理线上已失效的旧资源（不在本次 dist 里的 assets 一律删除，避免无限堆积）
try:
    remote = api(f"/repos/{REPO}/contents/assets?ref={BRANCH}")
    for item in remote:
        if item["type"] == "file" and item["name"] not in new_assets:
            delete(f"assets/{item['name']}", MSG)
except Exception as e:
    print("skip cleanup:", e)
print("done")
