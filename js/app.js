(function () {
  "use strict";

  function drawUtilizationChart() {
    var canvas = document.getElementById("utilChart");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var w = (canvas.width = canvas.offsetWidth * 2);
    var h = (canvas.height = 440);
    ctx.scale(2, 2);
    var cw = w / 2;
    var ch = h / 2;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    var values = [40, 55, 48, 62, 58, 70, 65];
    var barW = 28;
    var gap = 24;
    var max = Math.max.apply(null, values);
    ctx.fillStyle = "#006d77";
    values.forEach(function (v, i) {
      var bh = (v / max) * (ch - 50);
      var x = 40 + i * (barW + gap);
      var y = ch - 30 - bh;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, bh, 6);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#6b7280";
      ctx.font = "11px Segoe UI";
      ctx.fillText(months[i], x + 4, ch - 8);
      ctx.fillStyle = "#006d77";
    });
  }

  function drawDonutChart() {
    var canvas = document.getElementById("deptDonut");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = 200;
    canvas.width = size * 2;
    canvas.height = size * 2;
    ctx.scale(2, 2);
    var slices = [
      { v: 0.45, c: "#006d77" },
      { v: 0.3, c: "#2a9d8f" },
      { v: 0.15, c: "#83c5be" },
      { v: 0.1, c: "#cbd5e1" },
    ];
    var start = -Math.PI / 2;
    slices.forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(size / 2, size / 2);
      ctx.arc(size / 2, size / 2, 70, start, start + s.v * Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = s.c;
      ctx.fill();
      start += s.v * Math.PI * 2;
    });
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 42, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 14px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText("45%", size / 2, size / 2 + 5);
  }

  function drawDeptBars() {
    var canvas = document.getElementById("adminDeptChart");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 320;
    ctx.scale(2, 2);
    var labels = ["Bio", "Chem", "Phys", "Eng", "Med"];
    var vals = [85, 62, 78, 90, 55];
    var cw = canvas.width / 2;
    var ch = canvas.height / 2;
    var max = 100;
    vals.forEach(function (v, i) {
      var bh = (v / max) * (ch - 40);
      var x = 30 + i * 55;
      var grad = ctx.createLinearGradient(0, ch - bh, 0, ch);
      grad.addColorStop(0, "#006d77");
      grad.addColorStop(1, "#83c5be");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, ch - 20 - bh, 36, bh, 8);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px Segoe UI";
      ctx.fillText(labels[i], x + 6, ch - 2);
    });
  }

  function initModals() {
    document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-open-modal");
        var el = document.getElementById(id);
        if (el) el.classList.add("open");
      });
    });
    document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var overlay = btn.closest(".modal-overlay");
        if (overlay) overlay.classList.remove("open");
      });
    });
  }

  function initRoleToggle() {
    document.querySelectorAll(".role-toggle input").forEach(function (radio) {
      radio.addEventListener("change", function () {
        /* visual handled by CSS :has */
      });
    });
  }

  function init() {
    drawUtilizationChart();
    drawDonutChart();
    drawDeptBars();
    initModals();
    initRoleToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
