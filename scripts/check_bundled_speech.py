"""Real local speech synthesis, with system voices disabled and audio muted."""

from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
import sys

ROOT = Path(__file__).resolve().parent.parent


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = getattr(p, sys.argv[1] if len(sys.argv) > 1 else "chromium").launch()
        context = browser.new_context()
        probe = context.new_page()
        if not probe.evaluate("Boolean(window.AudioContext || window.webkitAudioContext)"):
            print("SKIP: this browser build does not implement Web Audio; test on a build with audio support.")
            browser.close()
            sys.exit(0)
        probe.close()
        context.add_init_script("""
    Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});
    window.__audio=[];
    const start=AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start=function(...args){
      __audio.push({duration:this.buffer.duration,energy:this.buffer.getChannelData(0).reduce((n,v)=>n+Math.abs(v),0)});
      const silence=this.context.createGain(); silence.gain.value=0; this.disconnect(); this.connect(silence); silence.connect(this.context.destination); return start.apply(this,args);
    };
  """)
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(f"http://127.0.0.1:{server.server_port}/index.html")
        listing = page.evaluate(
            """()=>new Promise((resolve,reject)=>{const w=new Worker('js/speech-worker.js',{type:'module'});w.onmessage=({data})=>{w.terminate();resolve(data)};w.onerror=e=>reject(e.message);w.postMessage({id:1,list:true})})"""
        )
        assert not listing.get("error")
        assert all(code in listing["voices"] for code in ["pt-br", "hi", "ja", "en-us"])
        for language in ["pt-BR", "en", "hi", "es-419", "de", "fr", "zh-CN", "ru", "ja"]:
            page.locator("#language-picker").select_option(language)
            page.wait_for_function("(lang)=>document.documentElement.lang===lang", arg=language)
            page.locator(".reader-launcher").click()
            before = page.evaluate("__audio.length")
            page.locator("[data-reader-preview]").click()
            try:
                page.wait_for_function("(before)=>__audio.length>before", arg=before, timeout=60000)
            except Exception:
                print(
                    "FAILED",
                    language,
                    page.locator("[data-reader-status]").first.inner_text(),
                    flush=True,
                )
                raise
            data = page.evaluate("__audio.at(-1)")
            assert data["duration"] > 0 and data["energy"] > 0, (language, data)
            page.locator("[data-reader-close]").click()
            print("PASS", language, data, flush=True)
        page.locator(".reader-launcher").click()
        page.locator("#reader-gender").select_option("male")
        before = page.evaluate("__audio.length")
        page.locator("[data-reader-preview]").click()
        page.wait_for_function("(before)=>__audio.length>before", arg=before, timeout=60000)
        page.locator("[data-reader-close]").click()
        page.locator(".reader-launcher").click()
        page.locator("[data-reader-enable]").click()
        page.locator("h1").hover()
        page.wait_for_function(
            'document.querySelector("h1").classList.contains("reader-highlight")', timeout=60000
        )
        page.keyboard.press("Escape")
        assert page.locator(".reader-highlight").count() == 0
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
