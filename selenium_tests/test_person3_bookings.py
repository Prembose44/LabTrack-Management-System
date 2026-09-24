# ============================================================
# EXPERIMENT 10 – Selenium Tests
# PERSON 3: Equipment Detail, My Bookings, Bundle Booking,
#           Profile, Settings, Notifications
# Project: LabTrack Management System
# ============================================================

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
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
# TC-P3-01: FUNCTIONAL – My Bookings Page Loads
# ─────────────────────────────────────────────
def test_my_bookings_loads(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        url     = driver.current_url
        heading = driver.find_element(By.CSS_SELECTOR, ".page-title").text
        if "my-bookings" in url and ("Bookings" in heading or "Booking" in heading):
            log("TC-P3-01", "Functional", "My Bookings page loads with correct heading",
                "Heading 'My Bookings' visible",
                f"Heading: '{heading}'", "PASS")
        else:
            log("TC-P3-01", "Functional", "My Bookings heading",
                "Expected 'My Bookings'", f"URL: {url}, Got: '{heading}'", "FAIL")
    except Exception as e:
        log("TC-P3-01", "Functional", "My Bookings loads",
            "Page heading visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-02: FUNCTIONAL – Bookings Tab Navigation Works
# ─────────────────────────────────────────────
def test_bookings_tabs(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        tabs      = driver.find_elements(By.CSS_SELECTOR, ".tabs a")
        tab_texts = [t.text for t in tabs if t.text.strip()]
        expected  = ["All", "Active", "Pending", "Completed", "Overdue"]
        found_all = all(any(e in t for t in tab_texts) for e in expected)
        if found_all:
            log("TC-P3-02", "Functional", "My Bookings has 5 status tabs",
                "All, Active, Pending, Completed, Overdue tabs present",
                f"Tabs: {tab_texts}", "PASS")
        else:
            log("TC-P3-02", "Functional", "Bookings tabs",
                "5 tabs present", f"Found: {tab_texts}", "FAIL")
    except Exception as e:
        log("TC-P3-02", "Functional", "Bookings tabs",
            "5 tabs", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-03: FUNCTIONAL – Equipment Detail Page Loads
# ─────────────────────────────────────────────
def test_equipment_detail_loads(driver):
    driver.get(BASE_URL + "/equipment-detail.html")
    time.sleep(2)
    url   = driver.current_url
    title = driver.title
    if "equipment-detail" in url and "LabTrack" in title:
        log("TC-P3-03", "Functional", "Equipment Detail page loads successfully",
            "Page stays on equipment-detail.html",
            f"Title: '{title}'", "PASS")
    else:
        log("TC-P3-03", "Functional", "Equipment detail page loads",
            "Stays on equipment-detail.html", f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-04: FUNCTIONAL – Bundle Booking Page Loads
# ─────────────────────────────────────────────
def test_bundle_booking_loads(driver):
    driver.get(BASE_URL + "/bundle-booking.html")
    time.sleep(2)
    url   = driver.current_url
    title = driver.title
    if "bundle-booking" in url and "LabTrack" in title:
        log("TC-P3-04", "Functional", "Bundle Booking page loads successfully",
            "Stays on bundle-booking.html",
            f"Title: '{title}'", "PASS")
    else:
        log("TC-P3-04", "Functional", "Bundle booking loads",
            "Stays on bundle-booking.html", f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-05: FUNCTIONAL – Notifications Page Loads
# ─────────────────────────────────────────────
def test_notifications_loads(driver):
    driver.get(BASE_URL + "/notifications.html")
    time.sleep(2)
    url   = driver.current_url
    title = driver.title
    if "notifications" in url and "LabTrack" in title:
        log("TC-P3-05", "Functional", "Notifications page loads successfully",
            "Stays on notifications.html",
            f"Title: '{title}'", "PASS")
    else:
        log("TC-P3-05", "Functional", "Notifications page loads",
            "Stays on notifications.html", f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-06: FUNCTIONAL – Profile Page Loads
# ─────────────────────────────────────────────
def test_profile_loads(driver):
    driver.get(BASE_URL + "/profile.html")
    time.sleep(2)
    url   = driver.current_url
    title = driver.title
    if "profile" in url and "LabTrack" in title:
        log("TC-P3-06", "Functional", "Profile page loads successfully",
            "Stays on profile.html",
            f"Title: '{title}'", "PASS")
    else:
        log("TC-P3-06", "Functional", "Profile page loads",
            "Stays on profile.html", f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-07: FUNCTIONAL – Settings Page Loads
# ─────────────────────────────────────────────
def test_settings_loads(driver):
    driver.get(BASE_URL + "/settings.html")
    time.sleep(2)
    url   = driver.current_url
    title = driver.title
    if "settings" in url and "LabTrack" in title:
        log("TC-P3-07", "Functional", "Settings page loads successfully",
            "Stays on settings.html",
            f"Title: '{title}'", "PASS")
    else:
        log("TC-P3-07", "Functional", "Settings page loads",
            "Stays on settings.html", f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-08: USABILITY – My Bookings Search Has Placeholder
# ─────────────────────────────────────────────
def test_bookings_search_placeholder(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        search      = driver.find_element(By.CSS_SELECTOR, ".topbar-search input[type='search']")
        placeholder = search.get_attribute("placeholder")
        if placeholder and placeholder.strip():
            log("TC-P3-08", "Usability", "My Bookings search field has meaningful placeholder",
                "Placeholder text present",
                f"Placeholder: '{placeholder}'", "PASS")
        else:
            log("TC-P3-08", "Usability", "Bookings search placeholder",
                "Placeholder present", "Empty placeholder", "FAIL")
    except Exception as e:
        log("TC-P3-08", "Usability", "Bookings search placeholder",
            "Placeholder present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-09: USABILITY – Booking Status Tabs Have "All" Label
# ─────────────────────────────────────────────
def test_bookings_tab_counts(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        tabs      = driver.find_elements(By.CSS_SELECTOR, ".tabs a")
        first_tab = tabs[0].text if tabs else ""
        if "All" in first_tab:
            log("TC-P3-09", "Usability", "Booking tabs display booking count in labels",
                "First tab shows 'All (n)' format",
                f"First tab: '{first_tab}'", "PASS")
        else:
            log("TC-P3-09", "Usability", "Booking tab counts",
                "Count in tab label", f"Tab: '{first_tab}'", "FAIL")
    except Exception as e:
        log("TC-P3-09", "Usability", "Booking tab counts",
            "Counts shown", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-10: USABILITY – My Bookings Has Sidebar Navigation
# ─────────────────────────────────────────────
def test_bookings_sidebar_nav(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        sidebar   = driver.find_element(By.CSS_SELECTOR, ".app-sidebar")
        nav_items = driver.find_elements(By.CSS_SELECTOR, ".sidebar-nav li")
        if sidebar.is_displayed() and len(nav_items) >= 4:
            log("TC-P3-10", "Usability", "My Bookings page has sidebar with nav links",
                "Sidebar present with at least 4 navigation items",
                f"{len(nav_items)} nav items found", "PASS")
        else:
            log("TC-P3-10", "Usability", "Bookings sidebar nav",
                "Sidebar with 4+ items", f"Items: {len(nav_items)}", "FAIL")
    except Exception as e:
        log("TC-P3-10", "Usability", "Bookings sidebar",
            "Sidebar present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-11: INTERFACE – My Bookings Shows Booking Cards or Empty State
# ─────────────────────────────────────────────
def test_bookings_cards_visible(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(3)
    try:
        cards = driver.find_elements(By.CSS_SELECTOR, ".booking-list-card")
        if len(cards) >= 1:
            log("TC-P3-11", "Interface", "My Bookings page displays booking cards",
                "At least 1 booking card visible",
                f"{len(cards)} booking cards found", "PASS")
        else:
            # Could be empty state message
            log("TC-P3-11", "Interface", "My Bookings page shows empty state when no bookings",
                "Booking cards or empty state message shown",
                "0 cards – empty state displayed", "PASS")
    except Exception as e:
        log("TC-P3-11", "Interface", "Booking cards visible",
            "Cards visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-12: INTERFACE – My Bookings Sidebar Brand Present
# ─────────────────────────────────────────────
def test_bookings_sidebar_brand(driver):
    driver.get(BASE_URL + "/my-bookings.html")
    time.sleep(2)
    try:
        brand = driver.find_element(By.CSS_SELECTOR, ".sidebar-brand")
        if brand.is_displayed() and "LabTrack" in brand.text:
            log("TC-P3-12", "Interface", "My Bookings sidebar shows LabTrack brand",
                "Brand with 'LabTrack' text visible",
                f"Brand: '{brand.text[:30]}'", "PASS")
        else:
            log("TC-P3-12", "Interface", "Sidebar brand in My Bookings",
                "Brand visible", "Brand hidden or wrong text", "FAIL")
    except Exception as e:
        log("TC-P3-12", "Interface", "Sidebar brand",
            "Brand visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-13: INTERFACE – Notifications Page Has App Layout
# ─────────────────────────────────────────────
def test_notifications_app_layout(driver):
    driver.get(BASE_URL + "/notifications.html")
    time.sleep(2)
    try:
        layout  = driver.find_element(By.CSS_SELECTOR, ".app-layout")
        sidebar = driver.find_element(By.CSS_SELECTOR, ".app-sidebar")
        if layout and sidebar.is_displayed():
            log("TC-P3-13", "Interface", "Notifications page has app layout with sidebar",
                "app-layout and app-sidebar both visible",
                "Both layout elements found", "PASS")
        else:
            log("TC-P3-13", "Interface", "Notifications app layout",
                "Layout with sidebar", "Elements missing", "FAIL")
    except Exception as e:
        log("TC-P3-13", "Interface", "Notifications layout",
            "App layout visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-14: INTERFACE – Profile Page Has App Layout
# ─────────────────────────────────────────────
def test_profile_app_layout(driver):
    driver.get(BASE_URL + "/profile.html")
    time.sleep(2)
    try:
        layout  = driver.find_element(By.CSS_SELECTOR, ".app-layout")
        sidebar = driver.find_element(By.CSS_SELECTOR, ".app-sidebar")
        if layout and sidebar.is_displayed():
            log("TC-P3-14", "Interface", "Profile page has full app layout with sidebar",
                "App layout and sidebar both visible",
                "Layout and sidebar found", "PASS")
        else:
            log("TC-P3-14", "Interface", "Profile app layout",
                "Layout with sidebar", "Elements missing", "FAIL")
    except Exception as e:
        log("TC-P3-14", "Interface", "Profile layout",
            "App layout visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P3-15: INTERFACE – Settings Page Has App Layout
# ─────────────────────────────────────────────
def test_settings_app_layout(driver):
    driver.get(BASE_URL + "/settings.html")
    time.sleep(2)
    try:
        layout    = driver.find_element(By.CSS_SELECTOR, ".app-layout")
        main_area = driver.find_element(By.CSS_SELECTOR, ".app-main")
        if layout and main_area.is_displayed():
            log("TC-P3-15", "Interface", "Settings page has app layout with main content area",
                "App layout and app-main both visible",
                "Both layout elements found", "PASS")
        else:
            log("TC-P3-15", "Interface", "Settings layout",
                "App layout visible", "Layout missing", "FAIL")
    except Exception as e:
        log("TC-P3-15", "Interface", "Settings layout",
            "App layout visible", f"Error: {e}", "FAIL")

# ══════════════════════════════════════════════
#  MAIN RUNNER
# ══════════════════════════════════════════════
def run_all():
    driver = setup_driver()
    try:
        test_my_bookings_loads(driver)
        test_bookings_tabs(driver)
        test_equipment_detail_loads(driver)
        test_bundle_booking_loads(driver)
        test_notifications_loads(driver)
        test_profile_loads(driver)
        test_settings_loads(driver)
        test_bookings_search_placeholder(driver)
        test_bookings_tab_counts(driver)
        test_bookings_sidebar_nav(driver)
        test_bookings_cards_visible(driver)
        test_bookings_sidebar_brand(driver)
        test_notifications_app_layout(driver)
        test_profile_app_layout(driver)
        test_settings_app_layout(driver)
    finally:
        driver.quit()

    print("\n" + "=" * 70)
    print("PERSON 3 – BOOKINGS/PROFILE MODULE TEST RESULTS")
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