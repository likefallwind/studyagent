"""Copy the narrated HTML lecture video into assets/ and cut it into short clips for the course.

  python3 tools/sync_video.py                  # source: ../video/ai_intro
  python3 tools/sync_video.py --src PATH       # another checkout of the video project

A clip is one scene of the video, optionally trimmed to a range of its narration lines, so a
section can embed about a minute of it. The stage is copied as is; assets/video/ai_intro/player.html
(ours, not copied) builds only the clip's scene and plays its audio. Writes:

  assets/video/lib/                       engine.js, base.css (the video project's shared engine)
  assets/video/ai_intro/                  timeline.js, css/, js/, img/
  assets/video/ai_intro/clips/<id>.mp3    narration of each clip, cut from build/narration.wav
  assets/video/clips.js                   SA.clips = {id: {...}}: timing and transcript for the page
  assets/img/<name>.jpg                   lecture images the course text uses as figures
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "video"

# id: (scene, first line, last line) -- 0-based and inclusive; None = to the end of the scene.
# Keep clips around a minute: trim a scene's lines rather than chaining scenes.
CLIPS = {
    "neuron": ("neuron", 0, None),
    "history1": ("history1", 0, 4),    # stops before the Deep Blue aside
}
FIGURES = ["imagenet", "cnnviz"]

PRE = 0.6    # a trimmed clip starts this long before its first line (the scene's own lead-in)
HOLD = 1.2   # and holds this long after its last line


def load_timeline(src):
    s = (src / "timeline.js").read_text(encoding="utf-8")
    return json.loads(s[s.index("{"): s.rindex("}") + 1])


def copy_stage(src):
    lib = OUT / "lib"
    lib.mkdir(parents=True, exist_ok=True)
    for name in ("engine.js", "base.css"):
        shutil.copy2(src.parent / "lib" / name, lib / name)
    dst = OUT / src.name
    dst.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src / "timeline.js", dst / "timeline.js")
    for d in ("css", "js", "img"):
        shutil.copytree(src / d, dst / d, dirs_exist_ok=True)


def cut_clips(src, tl):
    out = OUT / src.name / "clips"
    out.mkdir(parents=True, exist_ok=True)
    clips = {}
    for cid, (sid, first, last) in CLIPS.items():
        sc = next(s for s in tl["scenes"] if s["id"] == sid)
        lines = sc["lines"][first:None if last is None else last + 1]
        t0 = sc["start"] if first == 0 else lines[0]["start"] - PRE
        t1 = sc["end"] if last is None or last == len(sc["lines"]) - 1 else lines[-1]["end"] + HOLD
        dur = t1 - t0
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}",
                        "-i", str(src / "build" / "narration.wav"),
                        "-af", f"afade=t=out:st={max(dur - 0.4, 0):.3f}:d=0.4",
                        "-ac", "1", "-c:a", "libmp3lame", "-b:a", "64k", str(out / f"{cid}.mp3")], check=True)
        clips[cid] = {
            "page": f"{src.name}/player.html",
            "scene": sid,
            "title": sc["chapter"],
            "t0": round(t0, 3),
            "t1": round(t1, 3),
            "dur": round(dur, 3),
            "poster": round(t1 - 1.5, 3),   # by then the scene has drawn everything
            "lines": [{"start": round(l["start"] - t0, 3), "end": round(l["end"] - t0, 3), "text": l["sub"]} for l in lines],
        }
        print(f"  {cid}: {sid} lines {first}-{last if last is not None else len(sc['lines']) - 1}, {dur:.1f}s")
    return clips


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=str(ROOT.parent / "video" / "ai_intro"), help="the video directory")
    src = Path(ap.parse_args().src).resolve()
    tl = load_timeline(src)
    copy_stage(src)
    clips = cut_clips(src, tl)
    (OUT / "clips.js").write_text(
        "/* 由 tools/sync_video.py 生成，不要手改：课程里嵌入的视频片段（时间相对片段开头） */\n"
        f"(window.SA = window.SA || {{}}).clips = {json.dumps(clips, ensure_ascii=False, indent=1)};\n",
        encoding="utf-8")
    img = ROOT / "assets" / "img"
    img.mkdir(parents=True, exist_ok=True)
    for name in FIGURES:
        shutil.copy2(src / "img" / f"{name}.jpg", img / f"{name}.jpg")
    print(f"wrote {OUT.relative_to(ROOT)}/ ({len(clips)} clips) and {len(FIGURES)} figures")


if __name__ == "__main__":
    main()
