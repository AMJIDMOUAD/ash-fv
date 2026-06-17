/* ============================================================
   Summit Studio — funnel interactions (vanilla JS, no deps)
   ============================================================ */
(function () {
  "use strict";

  /* ---- Scroll reveal via IntersectionObserver ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Smooth-scroll for in-page anchors (with reduced-motion respect) ---- */
  function initSmoothScroll() {
    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
        // move focus for accessibility
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---- Mobile sticky CTA: hide while the opt-in form is in view ---- */
  function initStickyCta() {
    var sticky = document.querySelector(".sticky-cta");
    var form = document.querySelector("#audit");
    if (!sticky || !form || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sticky.style.transform = entry.isIntersecting ? "translateY(120%)" : "translateY(0)";
      });
    }, { threshold: 0.25 });
    io.observe(form);
    sticky.style.transition = "transform 0.3s ease";
  }

  /* ---- Client-side validation + SMTP email ---- */
  function initForm() {
    var form = document.querySelector('form[data-funnel="optin"]');
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var ok = true;
      form.querySelectorAll("input[required]").forEach(function (input) {
        if (!input.checkValidity()) { ok = false; input.setAttribute("aria-invalid", "true"); }
        else { input.removeAttribute("aria-invalid"); }
      });
      if (!ok) {
        var first = form.querySelector('[aria-invalid="true"]');
        if (first) first.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = "Sending\u2026"; btn.disabled = true; }

      var data = {};
      form.querySelectorAll("input[name]").forEach(function (input) {
        data[input.name] = input.value;
      });

      var body = "New Free Audit Request\n\n"
        + "Name: " + data.name + "\n"
        + "Business: " + data.business + "\n"
        + "Email: " + data.email + "\n"
        + "Phone: " + data.phone + "\n";

      Email.send({
        Host: "smtp.gmail.com",
        Username: "ash8518@gmail.com",
        Password: "uusp valv sxpg oagw",
        To: "ash8518@gmail.com",
        From: "ash8518@gmail.com",
        Subject: "New Free Audit Request - " + data.name + " (" + data.business + ")",
        Body: body
      }).then(function (msg) {
        if (btn) { btn.textContent = "Sent!"; }
        form.innerHTML = '<div class="center" style="padding:2rem 0"><div class="tick" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h3>You\u2019re in! Check your email.</h3><p style="color:var(--muted)">Your free audit is on its way within 24 hours.</p></div>';
      }).catch(function (err) {
        if (btn) { btn.textContent = "Send Me the Audit"; btn.disabled = false; }
        alert("Something went wrong. Please try again or email us directly at ash8518@gmail.com.");
      });
    });
  }

  /* ---- Footer year ---- */
  function initYear() {
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initSmoothScroll();
    initStickyCta();
    initForm();
    initYear();
  });
})();
