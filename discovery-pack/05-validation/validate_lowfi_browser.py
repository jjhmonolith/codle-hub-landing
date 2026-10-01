#!/usr/bin/env python3
"""Browser-level smoke test for the Codle low-fi hub."""
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:4173/archive/design-history-2026-09-30/prototypes/low-fi-hub/"
OUT = Path(__file__).resolve().parents[2] / "archive/design-history-2026-09-30" / "prototypes" / "low-fi-hub" / "screenshots"
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)

    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    page.goto(URL, wait_until="networkidle")
    assert page.title() == "Codle 상품 허브 — 저충실도 구조"
    assert page.locator("article.card").count() == 6
    assert page.locator('#p004 .select-offering').count() == 0
    assert page.locator('input[name="offering"]').count() == 5

    # Situation filter emphasizes but does not hide other products.
    page.get_by_role("button", name="AI 콘텐츠").click()
    assert page.locator("#p002").evaluate("el => el.classList.contains('match')")
    assert page.locator("#p001").evaluate("el => el.classList.contains('dim')")
    assert page.locator("#p001").is_visible()

    # Multiple direct-sale offerings can be selected.
    page.locator('#p001 button[data-offering="license"]').click()
    page.locator('#p006 button[data-offering="hackathon"]').click()
    assert page.locator('input[value="license"]').is_checked()
    assert page.locator('input[value="hackathon"]').is_checked()
    assert "선택 2개" in page.locator("#selection-summary").inner_text()

    # AIDT uses the publisher-guidance panel rather than inquiry selection.
    page.locator("#aidt-open-card").click()
    assert page.locator("#aidt-panel").is_visible()
    assert "코들 견적 문의 버튼은 제공하지 않습니다" in page.locator("#aidt-panel").inner_text()

    # Empty required fields are handled without network submission/navigation.
    page.locator("#inquiry-form button[type=submit]").click()
    assert page.url == URL
    assert page.locator("#form-status").is_visible()
    assert "필수 항목" in page.locator("#form-status").inner_text()

    page.screenshot(path=str(OUT / "desktop.png"), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto(URL, wait_until="networkidle")
    assert mobile.locator("article.card").count() == 6
    overflow = mobile.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    assert overflow <= 1, f"mobile horizontal overflow: {overflow}px"
    mobile.locator('#p005 button[data-offering="camp"]').click()
    assert mobile.locator('input[value="camp"]').is_checked()
    mobile.locator("#aidt-toggle").click()
    assert mobile.locator("#aidt-panel").is_visible()
    mobile.screenshot(path=str(OUT / "mobile.png"), full_page=True)

    browser.close()

print("PASS browser smoke: desktop+mobile, filter, multi-select, AIDT routing, form validation")
print(f"screenshots={OUT / 'desktop.png'},{OUT / 'mobile.png'}")
