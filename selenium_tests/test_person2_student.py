# ============================================================
# EXPERIMENT 10 – Selenium Tests
# PERSON 2: Landing Page, Login, Register,
#           Student Dashboard, Equipment Catalog
# Project: LabTrack Management System
# ============================================================

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time

from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://127.0.0.1:5500"

def setup_driver():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    driver.maximize_window()
    driver.get(BASE_URL + "/index.html")
    time.sleep(1)
    # Correct key is 'labtrack_session' with role='student'
    driver.execute_script("""
        localStorage.setItem('labtrack_session', JSON.stringify({
            role: 'student',
            name: 'Arjun Kumar',
            email: 'student@lab.com'
        }));
    """)
    time.sleep(0.5)
    return driver

results = []

def log(tc_id, tc_type, scenario, expected, actual, status):
    results.append({"id": tc_id, "type": tc_type, "scenario": scenario,
                    "expected": expected, "actual": actual, "status": status})
    print(f"[{status}] {tc_id} – {scenario}")

# ─────────────────────────────────────────────
# TC-P2-01: FUNCTIONAL – Landing Page Loads
# ─────────────────────────────────────────────
def test_landing_page_loads(driver):
    driver.get(BASE_URL + "/index.html")
    time.sleep(2)
    title = driver.title
    if "LabTrack" in title:
        log("TC-P2-01", "Functional", "Landing page loads with LabTrack title",
            "Title contains 'LabTrack'", f"Title: {title}", "PASS")
    else:
        log("TC-P2-01", "Functional", "Landing page loads with LabTrack title",
            "Title contains 'LabTrack'", f"Title: {title}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-02: FUNCTIONAL – Hero Section Text Present
# ─────────────────────────────────────────────
def test_hero_section_text(driver):
    driver.get(BASE_URL + "/index.html")
    time.sleep(2)
    try:
        hero = driver.find_element(By.CSS_SELECTOR, ".hero h1")
        if "Borrow Smart" in hero.text or "Lab Harder" in hero.text:
            log("TC-P2-02", "Functional", "Landing page hero heading text is correct",
                "Text 'Borrow Smart' or 'Lab Harder' visible",
                f"Hero: '{hero.text}'", "PASS")
        else:
            log("TC-P2-02", "Functional", "Hero heading text",
                "Expected hero text", f"Got: '{hero.text}'", "FAIL")
    except Exception as e:
        log("TC-P2-02", "Functional", "Hero heading text",
            "Hero heading visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-03: FUNCTIONAL – Login Button Navigates to Login Page
# ─────────────────────────────────────────────
def test_login_button_navigation(driver):
    driver.get(BASE_URL + "/index.html")
    time.sleep(1)
    try:
        login_btn = driver.find_element(By.CSS_SELECTOR, "a.btn-outline[href='login.html']")
        login_btn.click()
        time.sleep(2)
        if "login.html" in driver.current_url:
            log("TC-P2-03", "Functional", "Header 'Login' button navigates to login page",
                "URL contains 'login.html'",
                f"URL: {driver.current_url}", "PASS")
        else:
            log("TC-P2-03", "Functional", "Login button navigation",
                "login.html opened", f"URL: {driver.current_url}", "FAIL")
    except Exception as e:
        log("TC-P2-03", "Functional", "Login button navigation",
            "login.html opened", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-04: FUNCTIONAL – Login Form: Valid Field Input
# ─────────────────────────────────────────────
def test_login_form_input(driver):
    driver.get(BASE_URL + "/login.html")
    time.sleep(2)
    try:
        email    = driver.find_element(By.ID, "loginEmail")
        password = driver.find_element(By.ID, "loginPassword")
        email.clear()
        email.send_keys("admin@lab.com")
        password.clear()
        password.send_keys("Admin@123")
        if email.get_attribute("value") == "admin@lab.com":
            log("TC-P2-04", "Functional", "Login form accepts valid email and password input",
                "Fields accept text input",
                "Email and password fields filled successfully", "PASS")
        else:
            log("TC-P2-04", "Functional", "Login form input",
                "Fields accept input", "Field value mismatch", "FAIL")
    except Exception as e:
        log("TC-P2-04", "Functional", "Login form input",
            "Fields accept input", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-05: FUNCTIONAL – Register Form Fields Present
# ─────────────────────────────────────────────
def test_register_form_fields(driver):
    driver.get(BASE_URL + "/register.html")
    time.sleep(2)
    try:
        name       = driver.find_element(By.ID, "fullName")
        email      = driver.find_element(By.ID, "email")
        pw         = driver.find_element(By.ID, "password")
        confirm_pw = driver.find_element(By.ID, "confirmPassword")
        dept       = driver.find_element(By.ID, "department")
        if all([name, email, pw, confirm_pw, dept]):
            log("TC-P2-05", "Functional", "Register form has all 5 required fields",
                "fullName, email, password, confirmPassword, department all present",
                "All 5 fields found", "PASS")
        else:
            log("TC-P2-05", "Functional", "Register form fields",
                "5 fields present", "Some fields missing", "FAIL")
    except Exception as e:
        log("TC-P2-05", "Functional", "Register form fields",
            "All fields present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-06: FUNCTIONAL – Equipment Catalog Page Loads
# ─────────────────────────────────────────────
def test_equipment_catalog_loads(driver):
    driver.get(BASE_URL + "/equipment-catalog.html")
    time.sleep(2)
    try:
        url     = driver.current_url
        heading = driver.find_element(By.CSS_SELECTOR, ".page-title").text
        if "equipment-catalog" in url and ("Catalog" in heading or "Equipment" in heading):
            log("TC-P2-06", "Functional", "Equipment Catalog page loads with correct heading",
                "Heading 'Equipment Catalog'",
                f"Heading: '{heading}'", "PASS")
        else:
            log("TC-P2-06", "Functional", "Equipment catalog heading",
                "Expected heading", f"URL: {url}, Heading: '{heading}'", "FAIL")
    except Exception as e:
        log("TC-P2-06", "Functional", "Equipment catalog loads",
            "Heading visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-07: USABILITY – Login Email Label Present
# ─────────────────────────────────────────────
def test_login_email_label(driver):
    driver.get(BASE_URL + "/login.html")
    time.sleep(2)
    try:
        label = driver.find_element(By.CSS_SELECTOR, "label[for='loginEmail']")
        if label.is_displayed() and "Email" in label.text:
            log("TC-P2-07", "Usability", "Login page has 'Email Address' label for email field",
                "Label with text 'Email Address' visible",
                f"Label: '{label.text}'", "PASS")
        else:
            log("TC-P2-07", "Usability", "Login email label",
                "Label visible", f"Label: '{label.text}'", "FAIL")
    except Exception as e:
        log("TC-P2-07", "Usability", "Login email label",
            "Label present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-08: USABILITY – Login Password Field Has Placeholder
# ─────────────────────────────────────────────
def test_login_password_placeholder(driver):
    driver.get(BASE_URL + "/login.html")
    time.sleep(2)
    try:
        pw          = driver.find_element(By.ID, "loginPassword")
        placeholder = pw.get_attribute("placeholder")
        if placeholder and "password" in placeholder.lower():
            log("TC-P2-08", "Usability", "Login password field has meaningful placeholder",
                "Placeholder text contains 'password'",
                f"Placeholder: '{placeholder}'", "PASS")
        else:
            log("TC-P2-08", "Usability", "Password field placeholder",
                "Meaningful placeholder", f"Got: '{placeholder}'", "FAIL")
    except Exception as e:
        log("TC-P2-08", "Usability", "Password placeholder",
            "Placeholder present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-09: USABILITY – Register Department Dropdown Has Options
# ─────────────────────────────────────────────
def test_register_department_options(driver):
    driver.get(BASE_URL + "/register.html")
    time.sleep(2)
    try:
        sel     = Select(driver.find_element(By.ID, "department"))
        options = [o.text for o in sel.options]
        if len(options) >= 2:
            log("TC-P2-09", "Usability", "Register department dropdown has meaningful options",
                "At least 2 options (default + departments)",
                f"Options: {options}", "PASS")
        else:
            log("TC-P2-09", "Usability", "Department dropdown options",
                "2+ options", f"Options: {options}", "FAIL")
    except Exception as e:
        log("TC-P2-09", "Usability", "Department dropdown",
            "Options present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-10: USABILITY – Equipment Catalog Search Placeholder
# ─────────────────────────────────────────────
def test_catalog_search_placeholder(driver):
    driver.get(BASE_URL + "/equipment-catalog.html")
    time.sleep(2)
    try:
        search      = driver.find_element(By.CSS_SELECTOR, ".topbar-search input[type='search']")
        placeholder = search.get_attribute("placeholder")
        if placeholder and "equipment" in placeholder.lower():
            log("TC-P2-10", "Usability", "Equipment catalog search has meaningful placeholder",
                "Placeholder mentions 'equipment'",
                f"Placeholder: '{placeholder}'", "PASS")
        else:
            log("TC-P2-10", "Usability", "Catalog search placeholder",
                "Meaningful placeholder", f"Got: '{placeholder}'", "FAIL")
    except Exception as e:
        log("TC-P2-10", "Usability", "Catalog search placeholder",
            "Placeholder present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-11: INTERFACE – Landing Nav Has 4 Links
# ─────────────────────────────────────────────
def test_landing_nav_links(driver):
    driver.get(BASE_URL + "/index.html")
    time.sleep(2)
    try:
        nav_links  = driver.find_elements(By.CSS_SELECTOR, ".landing-nav a")
        link_texts = [l.text for l in nav_links]
        if len(nav_links) >= 4:
            log("TC-P2-11", "Interface", "Landing page navigation has 4 menu links",
                "4 nav items: Home, Features, How It Works, About Us",
                f"Links: {link_texts}", "PASS")
        else:
            log("TC-P2-11", "Interface", "Landing nav links",
                "4 links", f"Found {len(nav_links)}: {link_texts}", "FAIL")
    except Exception as e:
        log("TC-P2-11", "Interface", "Landing nav links",
            "4 links present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-12: INTERFACE – Landing Stats Cards Visible
# ─────────────────────────────────────────────
def test_landing_stats_cards(driver):
    driver.get(BASE_URL + "/index.html")
    time.sleep(2)
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, ".stat-card")
        if len(cards) >= 4:
            texts = [c.text for c in cards]
            log("TC-P2-12", "Interface", "Landing page shows 4 stat cards",
                "4 stat cards visible",
                f"Card texts: {texts}", "PASS")
        else:
            log("TC-P2-12", "Interface", "Landing stats cards",
                "4 cards", f"Found: {len(cards)}", "FAIL")
    except Exception as e:
        log("TC-P2-12", "Interface", "Stats cards visible",
            "Cards present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-13: INTERFACE – Login Sign In Button Visible
# ─────────────────────────────────────────────
def test_login_signin_button(driver):
    driver.get(BASE_URL + "/login.html")
    time.sleep(2)
    try:
        submit = driver.find_element(By.CSS_SELECTOR, "#loginForm button[type='submit']")
        if submit.is_displayed() and "Sign In" in submit.text:
            log("TC-P2-13", "Interface", "Login page has visible 'Sign In' submit button",
                "Button with text 'Sign In' visible",
                f"Button text: '{submit.text}'", "PASS")
        else:
            log("TC-P2-13", "Interface", "Sign In button visible",
                "Button visible", "Button not found or hidden", "FAIL")
    except Exception as e:
        log("TC-P2-13", "Interface", "Sign In button",
            "Button visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-14: INTERFACE – Register Page Has Brand Panel
# ─────────────────────────────────────────────
def test_register_brand_panel(driver):
    driver.get(BASE_URL + "/register.html")
    time.sleep(2)
    try:
        panel = driver.find_element(By.CSS_SELECTOR, ".auth-brand-panel")
        if panel.is_displayed():
            log("TC-P2-14", "Interface", "Register page shows brand panel with LabTrack info",
                "Auth brand panel visible",
                "Brand panel element found and visible", "PASS")
        else:
            log("TC-P2-14", "Interface", "Register brand panel",
                "Panel visible", "Panel hidden", "FAIL")
    except Exception as e:
        log("TC-P2-14", "Interface", "Register brand panel",
            "Panel visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P2-15: INTERFACE – Equipment Catalog Filter Sidebar
# ─────────────────────────────────────────────
def test_catalog_filter_sidebar(driver):
    driver.get(BASE_URL + "/equipment-catalog.html")
    time.sleep(2)
    try:
        filter_form = driver.find_element(By.CSS_SELECTOR, "form[aria-label='Equipment filters']")
        if filter_form.is_displayed():
            log("TC-P2-15", "Interface", "Equipment Catalog shows filter sidebar with form",
                "Filter form visible with Category, Department, Availability",
                "Filter sidebar form found", "PASS")
        else:
            log("TC-P2-15", "Interface", "Catalog filter sidebar",
                "Sidebar visible", "Not displayed", "FAIL")
    except Exception as e:
        log("TC-P2-15", "Interface", "Catalog filter sidebar",
            "Sidebar visible", f"Error: {e}", "FAIL")

# ══════════════════════════════════════════════
#  MAIN RUNNER
# ══════════════════════════════════════════════
def run_all():
    driver = setup_driver()
    try:
        test_landing_page_loads(driver)
        test_hero_section_text(driver)
        test_login_button_navigation(driver)
        test_login_form_input(driver)
        test_register_form_fields(driver)
        test_equipment_catalog_loads(driver)
        test_login_email_label(driver)
        test_login_password_placeholder(driver)
        test_register_department_options(driver)
        test_catalog_search_placeholder(driver)
        test_landing_nav_links(driver)
        test_landing_stats_cards(driver)
        test_login_signin_button(driver)
        test_register_brand_panel(driver)
        test_catalog_filter_sidebar(driver)
    finally:
        driver.quit()

    print("\n" + "=" * 70)
    print("PERSON 2 – STUDENT/PUBLIC MODULE TEST RESULTS")
    print("=" * 70)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    print(f"\n{'TC ID':<12} {'Type':<12} {'Scenario':<45} {'Status'}")
    print("-" * 90)
    for r in results:
        print(f"{r['id']:<12} {r['type']:<12} {r['scenario'][:44]:<45} {r['status']}")
    print(f"\nTotal: {len(results)} | PASSED: {passed} | FAILED: {failed}")


if __name__ == "__main__":
    run_all()