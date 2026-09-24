/**
 * LabTrack — shared form validation (HTML5 + JS)
 */
(function (global) {
  "use strict";

  var PATTERNS = {
    alphaOnly: /^[A-Za-z\s]+$/,
    alphaCity: /^[A-Za-z\s]+$/,
    alphaAddress: /^[A-Za-z0-9\s,.-]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
    noEdgeSpace: /^\S(.*\S)?$/,
  };

  function trimValue(el) {
    if (el && el.value !== undefined) {
      el.value = el.value.trim();
    }
  }

  function hasNoEmptySpaces(value) {
    if (value === "") return false;
    if (/^\s|\s$/.test(value)) return false;
    if (/\s{2,}/.test(value)) return false;
    return true;
  }

  function setError(wrap, message) {
    var err = wrap.querySelector(".field-error");
    if (err) err.textContent = message || "";
  }

  function validateName(input) {
    trimValue(input);
    var v = input.value;
    if (!v) return "Name is required.";
    if (!hasNoEmptySpaces(v)) return "No empty or extra spaces allowed.";
    if (!PATTERNS.alphaOnly.test(v)) return "Name must contain letters only.";
    return "";
  }

  function validateCity(input) {
    trimValue(input);
    var v = input.value;
    if (!v) return "City is required.";
    if (!hasNoEmptySpaces(v)) return "No empty or extra spaces allowed.";
    if (!PATTERNS.alphaCity.test(v)) return "City must contain letters only.";
    return "";
  }

  function validateAddress(input) {
    trimValue(input);
    var v = input.value;
    if (!v) return "Address is required.";
    if (!hasNoEmptySpaces(v)) return "No empty or extra spaces allowed.";
    if (!PATTERNS.alphaAddress.test(v)) return "Invalid address format.";
    return "";
  }

  function validateEmail(input) {
    trimValue(input);
    var v = input.value;
    if (!v) return "Email is required.";
    if (!hasNoEmptySpaces(v)) return "No spaces in email.";
    if (!PATTERNS.email.test(v)) return "Enter a valid email address.";
    return "";
  }

  function validatePassword(input) {
    var v = input.value;
    if (!v) return "Password is required.";
    if (/\s/.test(v)) return "Password cannot contain spaces.";
    if (!PATTERNS.password.test(v))
      return "Min 8 chars, upper, lower, number & special (@$!%*?&#).";
    return "";
  }

  function validateConfirmPassword(input, passwordEl) {
    var v = input.value;
    if (!v) return "Please confirm password.";
    if (v !== passwordEl.value) return "Passwords do not match.";
    return "";
  }

  function validateDate(input) {
    var v = input.value;
    if (!v) return "Date is required.";
    var selected = new Date(v + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) return "Date cannot be in the past.";
    return "";
  }

  function validateSelect(input) {
    trimValue(input);
    if (!input.value || input.value === "") return "Please select an option.";
    return "";
  }

  function applyNativeValidity(input, isValid) {
    if (isValid) {
      input.setCustomValidity("");
    } else {
      input.setCustomValidity("Invalid");
    }
  }

  function bindField(input, validator) {
    var wrap = input.closest(".field-wrap");
    if (!wrap) return;

    function run() {
      var msg = validator(input);
      setError(wrap, msg);
      applyNativeValidity(input, msg === "");
      return msg === "";
    }

    input.addEventListener("blur", function () {
      if (input.tagName === "SELECT") input.classList.add("touched");
      run();
    });

    input.addEventListener("input", function () {
      if (input.value.length > 0) run();
    });

    input.addEventListener("change", function () {
      if (input.type === "date" || input.tagName === "SELECT") {
        input.classList.add("touched");
        run();
      }
    });

    return run;
  }

  function validateForm(form, validators) {
    var ok = true;
    validators.forEach(function (item) {
      var input = form.querySelector(item.selector);
      if (!input) return;
      var msg = item.fn(input);
      var wrap = input.closest(".field-wrap");
      if (wrap) {
        setError(wrap, msg);
        applyNativeValidity(input, msg === "");
        if (msg) {
          wrap.classList.add("shake");
          setTimeout(function () {
            wrap.classList.remove("shake");
          }, 400);
          ok = false;
        }
      }
    });
    return ok;
  }

  function showFormMessage(form, type, text) {
    var box = form.querySelector(".form-message");
    if (!box) return;
    box.className = "form-message show " + type;
    box.textContent = text;
  }

  function initLoginForm(form) {
    var emailEl = form.querySelector('[name="loginEmail"]');
    var passwordEl = form.querySelector('[name="loginPassword"]');
    if (emailEl) bindField(emailEl, validateEmail);
    if (passwordEl) bindField(passwordEl, validatePassword);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = validateForm(form, [
        { selector: '[name="loginEmail"]', fn: validateEmail },
        { selector: '[name="loginPassword"]', fn: validatePassword },
      ]);
      if (!valid) {
        showFormMessage(form, "error", "Please fix the highlighted fields.");
        return;
      }
      showFormMessage(form, "success", "Sign in successful. Redirecting…");
      setTimeout(function () {
        /* Role-based redirect via LabTrackAuth */
        var role = (typeof LabTrackAuth !== "undefined")
          ? LabTrackAuth.login(emailEl.value.trim(), passwordEl.value)
          : "student";
        if (role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "student-dashboard.html";
        }
      }, 800);
    });
  }

  function initSignupInlineForm(form) {
    var pwd = form.querySelector('[name="signupPassword"]');
    var confirm = form.querySelector('[name="signupConfirmPassword"]');

    bindField(form.querySelector('[name="signupName"]'), validateName);
    bindField(form.querySelector('[name="signupEmail"]'), validateEmail);
    if (pwd) bindField(pwd, validatePassword);
    if (confirm)
      bindField(confirm, function (el) {
        return validateConfirmPassword(el, pwd);
      });
    bindField(form.querySelector('[name="signupCity"]'), validateCity);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = validateForm(form, [
        { selector: '[name="signupName"]', fn: validateName },
        { selector: '[name="signupEmail"]', fn: validateEmail },
        { selector: '[name="signupPassword"]', fn: validatePassword },
        {
          selector: '[name="signupConfirmPassword"]',
          fn: function (el) {
            return validateConfirmPassword(el, pwd);
          },
        },
        { selector: '[name="signupCity"]', fn: validateCity },
        { selector: '[name="signupDepartment"]', fn: validateSelect },
      ]);
      if (!valid) {
        showFormMessage(form, "error", "Sign up validation failed.");
        return;
      }
      showFormMessage(form, "success", "Account created (demo). You can sign in.");
    });
  }

  function initRegisterForm(form) {
    var pwd = form.querySelector('[name="password"]');
    var confirm = form.querySelector('[name="confirmPassword"]');

    bindField(form.querySelector('[name="fullName"]'), validateName);
    bindField(form.querySelector('[name="email"]'), validateEmail);
    if (pwd) bindField(pwd, validatePassword);
    if (confirm)
      bindField(confirm, function (el) {
        return validateConfirmPassword(el, pwd);
      });
    bindField(form.querySelector('[name="department"]'), validateSelect);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = validateForm(form, [
        { selector: '[name="fullName"]', fn: validateName },
        { selector: '[name="email"]', fn: validateEmail },
        { selector: '[name="password"]', fn: validatePassword },
        {
          selector: '[name="confirmPassword"]',
          fn: function (el) {
            return validateConfirmPassword(el, pwd);
          },
        },
        { selector: '[name="department"]', fn: validateSelect },
      ]);
      if (!valid) {
        showFormMessage(form, "error", "Please complete all fields correctly.");
        return;
      }
      showFormMessage(form, "success", "Registration complete. Redirecting to login…");
      setTimeout(function () {
        window.location.href = "login.html";
      }, 1000);
    });
  }

  function initProfileForm(form) {
    bindField(form.querySelector('[name="fullName"]'), validateName);
    bindField(form.querySelector('[name="preferredName"]'), validateName);
    bindField(form.querySelector('[name="department"]'), validateSelect);
    var city = form.querySelector('[name="city"]');
    if (city) bindField(city, validateCity);
    var address = form.querySelector('[name="address"]');
    if (address) bindField(address, validateAddress);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var rules = [
        { selector: '[name="fullName"]', fn: validateName },
        { selector: '[name="preferredName"]', fn: validateName },
        { selector: '[name="department"]', fn: validateSelect },
      ];
      if (city) rules.push({ selector: '[name="city"]', fn: validateCity });
      if (address) rules.push({ selector: '[name="address"]', fn: validateAddress });
      if (!validateForm(form, rules)) {
        showFormMessage(form, "error", "Could not save — check your entries.");
        return;
      }
      showFormMessage(form, "success", "Profile saved successfully.");
    });
  }

  function validateDuration(input) {
    var v = parseFloat(input.value);
    if (isNaN(v) || v <= 0) return "Duration must be greater than 0.";
    if (v > 8) return "Maximum duration is 8 hours.";
    return "";
  }

  function initBookingForm(form) {
    var dateInput = form.querySelector('[name="bookingDate"]');
    if (dateInput) {
      var today = new Date();
      var iso =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
      dateInput.setAttribute("min", iso);
      dateInput.value = iso;
      dateInput.classList.add("touched");
      bindField(dateInput, validateDate);
    }
    var duration = form.querySelector('[name="duration"]');
    if (duration) bindField(duration, validateDuration);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var slot = form.querySelector('input[name="timeSlot"]:checked');
      var valid = validateForm(form, [
        { selector: '[name="bookingDate"]', fn: validateDate },
        { selector: '[name="duration"]', fn: validateDuration },
      ]);
      if (!slot) {
        showFormMessage(form, "error", "Select an available time slot.");
        return;
      }
      if (!valid) return;
      showFormMessage(form, "success", "Booking confirmed (demo).");
    });
  }

  function initCalendarBookingForm(form) {
    var dateInput = form.querySelector('[name="eventDate"]');
    if (dateInput) {
      var today = new Date();
      var iso =
        today.getFullYear() +
        "-" +
        String(today.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(today.getDate()).padStart(2, "0");
      dateInput.setAttribute("min", iso);
      bindField(dateInput, validateDate);
    }
    bindField(form.querySelector('[name="eventTitle"]'), validateName);
    bindField(form.querySelector('[name="labLocation"]'), validateCity);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (
        !validateForm(form, [
          { selector: '[name="eventDate"]', fn: validateDate },
          { selector: '[name="eventTitle"]', fn: validateName },
          { selector: '[name="labLocation"]', fn: validateCity },
        ])
      ) {
        showFormMessage(form, "error", "Invalid booking details.");
        return;
      }
      showFormMessage(form, "success", "New booking added to calendar.");
    });
  }

  function initDamageReportForm(form) {
    bindField(form.querySelector('[name="equipmentName"]'), validateName);
    bindField(form.querySelector('[name="reportedBy"]'), validateName);
    bindField(form.querySelector('[name="damageLocation"]'), validateCity);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (
        !validateForm(form, [
          { selector: '[name="equipmentName"]', fn: validateName },
          { selector: '[name="reportedBy"]', fn: validateName },
          { selector: '[name="damageLocation"]', fn: validateCity },
        ])
      ) {
        showFormMessage(form, "error", "Fix errors before submitting report.");
        return;
      }
      showFormMessage(form, "success", "Damage report submitted.");
    });
  }

  function initLandingSearch(form) {
    var q = form.querySelector('[name="searchQuery"]');
    if (!q) return;
    q.setAttribute("pattern", "[A-Za-z0-9\\s]+");
    bindField(q, function (input) {
      trimValue(input);
      if (!input.value) return "Enter a search term.";
      if (!hasNoEmptySpaces(input.value)) return "No leading/trailing spaces.";
      if (!/^[A-Za-z0-9\s]+$/.test(input.value))
        return "Use letters and numbers only.";
      return "";
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (
        validateForm(form, [
          {
            selector: '[name="searchQuery"]',
            fn: function (el) {
              trimValue(el);
              if (!el.value) return "Enter a search term.";
              return "";
            },
          },
        ])
      ) {
        window.location.href = "equipment-catalog.html";
      }
    });
  }

  function setCurrentDateLabels() {
    document.querySelectorAll("[data-current-date]").forEach(function (el) {
      el.textContent = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    });
  }

  function initAuthTabs() {
    var tabs = document.querySelectorAll("[data-auth-tab]");
    var panels = document.querySelectorAll("[data-auth-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-auth-tab");
        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.hidden = p.getAttribute("data-auth-panel") !== target;
        });
      });
    });
  }

  function init() {
    setCurrentDateLabels();
    initAuthTabs();

    document.querySelectorAll("form[data-validate='login']").forEach(initLoginForm);
    document
      .querySelectorAll("form[data-validate='signup-inline']")
      .forEach(initSignupInlineForm);
    document
      .querySelectorAll("form[data-validate='register']")
      .forEach(initRegisterForm);
    document
      .querySelectorAll("form[data-validate='profile']")
      .forEach(initProfileForm);
    document
      .querySelectorAll("form[data-validate='booking']")
      .forEach(initBookingForm);
    document
      .querySelectorAll("form[data-validate='calendar-booking']")
      .forEach(initCalendarBookingForm);
    document
      .querySelectorAll("form[data-validate='damage-report']")
      .forEach(initDamageReportForm);
    document
      .querySelectorAll("form[data-validate='landing-search']")
      .forEach(initLandingSearch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.LabTrackValidation = {
    validateName: validateName,
    validateEmail: validateEmail,
    validatePassword: validatePassword,
    validateDate: validateDate,
  };
})(window);
