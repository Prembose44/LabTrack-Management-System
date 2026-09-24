# ============================================================
# EXPERIMENT 10 – Selenium Tests
# PERSON 1: Admin Dashboard, Equipment Mgmt, Student Mgmt,
#           Booking Reports, Maintenance
# Project: LabTrack Management System
# ============================================================

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time

# ── Auto-download correct ChromeDriver ──────────────────────
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

    # Step 1: Open any page on the same origin
    driver.get(BASE_URL + "/index.html")
    time.sleep(1)

    # Step 2: Inject the correct session key ('labtrack_session')
    # with role='admin' so guardAdmin() passes
    driver.execute_script("""
        localStorage.setItem('labtrack_session', JSON.stringify({
            role: 'admin',
            name: 'Arjun Kumar',
            email: 'admin@lab.com'
        }));
    """)
    time.sleep(0.5)
    return driver

results = []

def log(tc_id, tc_type, scenario, expected, actual, status):
    results.append({
        "id": tc_id, "type": tc_type, "scenario": scenario,
        "expected": expected, "actual": actual, "status": status
    })
    print(f"[{status}] {tc_id} – {scenario}")

# ─────────────────────────────────────────────
# TC-P1-01: FUNCTIONAL – Admin Dashboard Loads
# ─────────────────────────────────────────────
def test_admin_dashboard_loads(driver):
    driver.get(BASE_URL + "/admin-dashboard.html")
    time.sleep(2)
    title = driver.title
    url   = driver.current_url
    if "admin-dashboard" in url and ("Admin" in title or "Dashboard" in title):
        log("TC-P1-01", "Functional",
            "Admin Dashboard page loads without redirect",
            "Page stays on admin-dashboard.html",
            f"Title: {title}", "PASS")
    else:
        log("TC-P1-01", "Functional",
            "Admin Dashboard page loads without redirect",
            "Page stays on admin-dashboard.html",
            f"Redirected to: {url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-02: FUNCTIONAL – Admin Sidebar Links Present
# ─────────────────────────────────────────────
def test_admin_sidebar_links(driver):
    driver.get(BASE_URL + "/admin-dashboard.html")
    time.sleep(2)
    sidebar_links = driver.find_elements(By.CSS_SELECTOR, ".sidebar-nav a")
    link_texts = [l.text.strip() for l in sidebar_links if l.text.strip()]
    expected_links = ["Dashboard", "Browse Equipment", "Reports", "Maintenance", "Students"]
    found = all(any(exp in t for t in link_texts) for exp in expected_links)
    if found:
        log("TC-P1-02", "Functional",
            "Admin sidebar has all navigation links",
            "All 5 nav links present",
            f"Found: {link_texts}", "PASS")
    else:
        log("TC-P1-02", "Functional",
            "Admin sidebar has all navigation links",
            "All 5 nav links present",
            f"Found: {link_texts}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-03: FUNCTIONAL – Navigate to Equipment Management
# ─────────────────────────────────────────────
def test_navigate_to_equipment_mgmt(driver):
    driver.get(BASE_URL + "/admin-dashboard.html")
    time.sleep(2)
    links = driver.find_elements(By.CSS_SELECTOR, ".sidebar-nav a")
    for link in links:
        if "Equipment" in link.text or "Browse" in link.text:
            link.click()
            time.sleep(2)
            break
    current_url = driver.current_url
    page_heading = ""
    try:
        page_heading = driver.find_element(By.CSS_SELECTOR, ".page-title").text
    except Exception:
        pass
    if "equipment-management" in current_url or "Equipment" in page_heading:
        log("TC-P1-03", "Functional",
            "Navigate to Equipment Management from sidebar",
            "Equipment Management page opens",
            f"URL: {current_url}", "PASS")
    else:
        log("TC-P1-03", "Functional",
            "Navigate to Equipment Management from sidebar",
            "Equipment Management page opens",
            f"URL: {current_url}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-04: FUNCTIONAL – Equipment Table Shows Data
# ─────────────────────────────────────────────
def test_equipment_table_data(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    rows = driver.find_elements(By.CSS_SELECTOR, ".data-table tbody tr")
    if len(rows) >= 1:
        first_cells = rows[0].find_elements(By.TAG_NAME, "td")
        if len(first_cells) > 0:
            log("TC-P1-04", "Functional",
                "Equipment inventory table displays data rows",
                "At least 1 data row with cells visible",
                f"{len(rows)} rows; first cell: '{first_cells[0].text}'", "PASS")
        else:
            log("TC-P1-04", "Functional",
                "Equipment inventory table displays data rows",
                "At least 1 data row",
                "Rows found but no cells", "FAIL")
    else:
        log("TC-P1-04", "Functional",
            "Equipment inventory table displays data rows",
            "At least 1 data row", "No rows found", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-05: FUNCTIONAL – Add Equipment Button Opens Modal
# ─────────────────────────────────────────────
def test_add_equipment_modal(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        add_btn = driver.find_element(By.CSS_SELECTOR, "[data-open-modal='addEquipModal']")
        if add_btn.is_displayed():
            add_btn.click()
            time.sleep(1)
            modal = driver.find_element(By.ID, "addEquipModal")
            log("TC-P1-05", "Functional",
                "Click '+ Add Equipment' opens modal dialog",
                "Modal dialog appears",
                "Button clicked, modal element exists", "PASS")
        else:
            log("TC-P1-05", "Functional",
                "Click '+ Add Equipment' opens modal dialog",
                "Button visible", "Button not visible", "FAIL")
    except Exception as e:
        log("TC-P1-05", "Functional",
            "Click '+ Add Equipment' opens modal dialog",
            "Modal dialog appears", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-06: FUNCTIONAL – Search Equipment by Name
# ─────────────────────────────────────────────
def test_equipment_search(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        search_box = driver.find_element(By.ID, "advSearch")
        search_box.clear()
        search_box.send_keys("Microscope")
        time.sleep(1.5)
        val = search_box.get_attribute("value")
        if val == "Microscope":
            log("TC-P1-06", "Functional",
                "Search equipment by keyword 'Microscope'",
                "Search field accepts input and filters list",
                f"Field value: '{val}'", "PASS")
        else:
            log("TC-P1-06", "Functional",
                "Search equipment by keyword 'Microscope'",
                "Field accepts input", f"Value: '{val}'", "FAIL")
    except Exception as e:
        log("TC-P1-06", "Functional",
            "Search equipment by keyword",
            "Rows filtered", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-07: FUNCTIONAL – Student Management Page Loads
# ─────────────────────────────────────────────
def test_student_management_loads(driver):
    driver.get(BASE_URL + "/student-management.html")
    time.sleep(2)
    try:
        url = driver.current_url
        heading = driver.find_element(By.CSS_SELECTOR, ".page-title").text
        if "student-management" in url and ("Directory" in heading or "Student" in heading):
            log("TC-P1-07", "Functional",
                "Student Management page loads with correct heading",
                "Heading contains 'Directory' or 'Student'",
                f"Heading: '{heading}'", "PASS")
        else:
            log("TC-P1-07", "Functional",
                "Student Management page loads with correct heading",
                "Heading contains 'Directory'",
                f"URL: {url}, Heading: '{heading}'", "FAIL")
    except Exception as e:
        log("TC-P1-07", "Functional",
            "Student Management page loads",
            "Page heading visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-08: FUNCTIONAL – Booking Reports Page Loads Stats
# ─────────────────────────────────────────────
def test_booking_reports_loads(driver):
    driver.get(BASE_URL + "/booking-reports.html")
    time.sleep(2)
    try:
        heading   = driver.find_element(By.CSS_SELECTOR, ".page-title").text
        stat_cards = driver.find_elements(By.CSS_SELECTOR, ".stats-grid-4 .card")
        if "Reports" in heading and len(stat_cards) >= 4:
            log("TC-P1-08", "Functional",
                "Booking Reports page shows heading and 4 stat cards",
                "Heading 'Reports & Analytics' + 4 stat cards",
                f"Heading: '{heading}', Cards: {len(stat_cards)}", "PASS")
        else:
            log("TC-P1-08", "Functional",
                "Booking Reports page shows heading and 4 stat cards",
                "Heading + 4 cards",
                f"Heading: '{heading}', Cards: {len(stat_cards)}", "FAIL")
    except Exception as e:
        log("TC-P1-08", "Functional",
            "Booking Reports page loads",
            "Stats visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-09: FUNCTIONAL – Maintenance Page Has Report Damage Button
# ─────────────────────────────────────────────
def test_maintenance_report_damage(driver):
    driver.get(BASE_URL + "/maintenance.html")
    time.sleep(2)
    try:
        btn      = driver.find_element(By.CSS_SELECTOR, "[data-open-modal='damageModal']")
        btn_text = btn.text.strip()
        if btn.is_displayed():
            log("TC-P1-09", "Functional",
                "Maintenance page has '+ Report Damage' button",
                "Button is visible and clickable",
                f"Button text: '{btn_text}'", "PASS")
        else:
            log("TC-P1-09", "Functional",
                "Maintenance page has '+ Report Damage' button",
                "Button visible", "Button not displayed", "FAIL")
    except Exception as e:
        log("TC-P1-09", "Functional",
            "Maintenance Report Damage button",
            "Button present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-10: USABILITY – Equipment Mgmt Search Has Label
# ─────────────────────────────────────────────
def test_equipment_search_label(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        label = driver.find_element(By.CSS_SELECTOR, "label[for='advSearch']")
        if label.is_displayed() and label.text.strip():
            log("TC-P1-10", "Usability",
                "Equipment search field has visible label",
                "Label 'Advanced Search' visible",
                f"Label text: '{label.text}'", "PASS")
        else:
            log("TC-P1-10", "Usability",
                "Equipment search field has visible label",
                "Label visible and non-empty", "Label hidden or empty", "FAIL")
    except Exception as e:
        log("TC-P1-10", "Usability",
            "Equipment search label check",
            "Label present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-11: USABILITY – Category Filter Dropdown Has Options
# ─────────────────────────────────────────────
def test_category_filter_options(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        sel     = Select(driver.find_element(By.ID, "catFilter"))
        options = [o.text for o in sel.options]
        if len(options) >= 2:
            log("TC-P1-11", "Usability",
                "Category filter dropdown has meaningful options",
                "At least 2 options including 'All Categories'",
                f"Options: {options}", "PASS")
        else:
            log("TC-P1-11", "Usability",
                "Category filter dropdown options",
                "At least 2 options", f"Options: {options}", "FAIL")
    except Exception as e:
        log("TC-P1-11", "Usability",
            "Category filter dropdown",
            "Options present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-12: USABILITY – Student Search Has Placeholder
# ─────────────────────────────────────────────
def test_student_search_placeholder(driver):
    driver.get(BASE_URL + "/student-management.html")
    time.sleep(2)
    try:
        search      = driver.find_element(By.ID, "studentSearch")
        placeholder = search.get_attribute("placeholder")
        if placeholder and placeholder.strip():
            log("TC-P1-12", "Usability",
                "Student search field has meaningful placeholder",
                "Placeholder text present",
                f"Placeholder: '{placeholder}'", "PASS")
        else:
            log("TC-P1-12", "Usability",
                "Student search placeholder",
                "Non-empty placeholder", "No placeholder found", "FAIL")
    except Exception as e:
        log("TC-P1-12", "Usability",
            "Student search placeholder",
            "Placeholder present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-13: USABILITY – Reports Page Has Export Buttons
# ─────────────────────────────────────────────
def test_reports_export_buttons(driver):
    driver.get(BASE_URL + "/booking-reports.html")
    time.sleep(2)
    try:
        buttons   = driver.find_elements(By.CSS_SELECTOR, ".btn")
        btn_texts = [b.text.strip() for b in buttons if b.is_displayed() and b.text.strip()]
        has_export = any("Export" in t for t in btn_texts)
        if has_export:
            log("TC-P1-13", "Usability",
                "Reports page has Export buttons with clear labels",
                "Buttons labeled 'Export PDF' and 'Export Excel'",
                f"Visible buttons: {btn_texts}", "PASS")
        else:
            log("TC-P1-13", "Usability",
                "Reports export buttons",
                "Export buttons present", f"Button texts: {btn_texts}", "FAIL")
    except Exception as e:
        log("TC-P1-13", "Usability",
            "Reports export buttons",
            "Buttons present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-14: INTERFACE – Admin Dashboard Topbar Search Visible
# ─────────────────────────────────────────────
def test_admin_topbar_search_visible(driver):
    driver.get(BASE_URL + "/admin-dashboard.html")
    time.sleep(2)
    try:
        search = driver.find_element(By.CSS_SELECTOR, ".topbar-search input[type='search']")
        if search.is_displayed():
            log("TC-P1-14", "Interface",
                "Admin Dashboard topbar search input is visible",
                "Search box displayed in topbar",
                "Search input found and displayed", "PASS")
        else:
            log("TC-P1-14", "Interface",
                "Admin Dashboard topbar search visible",
                "Search box displayed", "Not visible", "FAIL")
    except Exception as e:
        log("TC-P1-14", "Interface",
            "Topbar search visible",
            "Search visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-15: INTERFACE – Equipment Table Headers Visible
# ─────────────────────────────────────────────
def test_equipment_table_headers(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        headers      = driver.find_elements(By.CSS_SELECTOR, ".data-table thead th")
        header_texts = [h.text.strip() for h in headers if h.text.strip()]
        expected     = ["ID", "Equipment Name", "Category", "Status"]
        found_all    = all(any(e in t for t in header_texts) for e in expected)
        if found_all:
            log("TC-P1-15", "Interface",
                "Equipment table shows correct column headers",
                "Headers: ID, Equipment Name, Category, Status present",
                f"Headers: {header_texts}", "PASS")
        else:
            log("TC-P1-15", "Interface",
                "Equipment table headers",
                "Required headers present", f"Found: {header_texts}", "FAIL")
    except Exception as e:
        log("TC-P1-15", "Interface",
            "Equipment table headers",
            "Headers visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-16: INTERFACE – Maintenance Page Heading & Subheading
# ─────────────────────────────────────────────
def test_maintenance_heading(driver):
    driver.get(BASE_URL + "/maintenance.html")
    time.sleep(2)
    try:
        h1  = driver.find_element(By.CSS_SELECTOR, ".page-title").text
        sub = driver.find_element(By.CSS_SELECTOR, ".page-sub").text
        if "Maintenance" in h1 and sub.strip():
            log("TC-P1-16", "Interface",
                "Maintenance page shows main heading and subheading",
                "Heading 'Maintenance & Repair' + descriptive subtext",
                f"H1: '{h1}', Sub: '{sub}'", "PASS")
        else:
            log("TC-P1-16", "Interface",
                "Maintenance page heading",
                "Heading visible", f"H1: '{h1}'", "FAIL")
    except Exception as e:
        log("TC-P1-16", "Interface",
            "Maintenance heading visible",
            "Heading present", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-17: INTERFACE – Sidebar Brand Logo Visible
# ─────────────────────────────────────────────
def test_sidebar_brand_visible(driver):
    driver.get(BASE_URL + "/admin-dashboard.html")
    time.sleep(2)
    try:
        brand      = driver.find_element(By.CSS_SELECTOR, ".sidebar-brand")
        brand_text = brand.text
        if brand.is_displayed() and "LabTrack" in brand_text:
            log("TC-P1-17", "Interface",
                "Sidebar shows LabTrack brand/logo",
                "Brand link with 'LabTrack' text visible",
                f"Brand text: '{brand_text[:30]}'", "PASS")
        else:
            log("TC-P1-17", "Interface",
                "Sidebar brand logo",
                "Brand visible", "Brand not displayed", "FAIL")
    except Exception as e:
        log("TC-P1-17", "Interface",
            "Sidebar brand visible",
            "Brand visible", f"Error: {e}", "FAIL")

# ─────────────────────────────────────────────
# TC-P1-18: INTERFACE – Status Badges Visible in Equipment Table
# ─────────────────────────────────────────────
def test_equipment_status_badges(driver):
    driver.get(BASE_URL + "/equipment-management.html")
    time.sleep(2)
    try:
        badges         = driver.find_elements(By.CSS_SELECTOR, ".data-table .badge")
        visible_badges = [b for b in badges if b.is_displayed()]
        if visible_badges:
            badge_texts = [b.text for b in visible_badges]
            log("TC-P1-18", "Interface",
                "Equipment status badges are visible in table",
                "At least 1 colored status badge visible",
                f"Badges: {badge_texts}", "PASS")
        else:
            log("TC-P1-18", "Interface",
                "Equipment status badges visible",
                "Badges visible", "No visible badges", "FAIL")
    except Exception as e:
        log("TC-P1-18", "Interface",
            "Status badges visible",
            "Badges present", f"Error: {e}", "FAIL")


# ══════════════════════════════════════════════
#  MAIN RUNNER
# ══════════════════════════════════════════════
def run_all():
    driver = setup_driver()
    try:
        test_admin_dashboard_loads(driver)
        test_admin_sidebar_links(driver)
        test_navigate_to_equipment_mgmt(driver)
        test_equipment_table_data(driver)
        test_add_equipment_modal(driver)
        test_equipment_search(driver)
        test_student_management_loads(driver)
        test_booking_reports_loads(driver)
        test_maintenance_report_damage(driver)
        test_equipment_search_label(driver)
        test_category_filter_options(driver)
        test_student_search_placeholder(driver)
        test_reports_export_buttons(driver)
        test_admin_topbar_search_visible(driver)
        test_equipment_table_headers(driver)
        test_maintenance_heading(driver)
        test_sidebar_brand_visible(driver)
        test_equipment_status_badges(driver)
    finally:
        driver.quit()

    print("\n" + "=" * 70)
    print("PERSON 1 – ADMIN MODULE TEST RESULTS")
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