/* Clear Trade Logistics — site interactions (vanilla JS, no dependencies) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Mobile menu (<details>): close on Escape, outside click or link tap
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var menu = document.querySelector('.mobile-menu');
    if (!menu) return;
    var summary = menu.querySelector('summary');

    function close(returnFocus) {
      if (!menu.open) return;
      menu.open = false;
      if (returnFocus) summary.focus();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close(true);
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target)) close(false);
    });
    menu.querySelectorAll('nav a').forEach(function (link) {
      link.addEventListener('click', function () { close(false); });
    });
    // Collapse if the viewport grows past the mobile breakpoint
    window.matchMedia('(min-width: 851px)').addEventListener('change', function (mq) {
      if (mq.matches) close(false);
    });
  }

  /* ------------------------------------------------------------------
     Subtle scroll entrance animations
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ------------------------------------------------------------------
     Consultation form
     - Validation with accessible inline errors
     - Conditional DMRE field for Petroleum Products
     - Pre-selects service/industry from ?service= / ?industry= links
     - Submits via fetch to the endpoint in data-endpoint.
       Success is ONLY shown after the endpoint confirms receipt.
     ------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\d\s-]{7,20}$/;

  function initConsultationForm() {
    var form = document.getElementById('consultation-form');
    if (!form) return;

    var industry = form.elements.industry;
    var service = form.elements.service;
    var dmreField = document.getElementById('field-dmre');
    var dmreInput = form.elements.dmre;
    var message = form.elements.message;
    var counter = document.getElementById('message-count');
    var statusBox = document.getElementById('form-status');
    var submitBtn = form.querySelector('[type="submit"]');
    var submitLabel = submitBtn.querySelector('.button-label');
    var spinner = submitBtn.querySelector('.spinner');

    /* Pre-select from query string (used by CTAs on other pages) */
    var params = new URLSearchParams(window.location.search);
    setSelect(service, params.get('service'));
    setSelect(industry, params.get('industry'));

    // Options carry a short data-key (e.g. "customs") so links stay tidy
    // while the submitted value remains a readable label.
    function setSelect(select, key) {
      if (!select || !key) return;
      Array.prototype.forEach.call(select.options, function (o) {
        if (o.dataset.key === key) select.value = o.value;
      });
    }
    function selectedKey(select) {
      var opt = select.options[select.selectedIndex];
      return opt ? opt.dataset.key : '';
    }

    /* Conditional DMRE certificate field */
    function syncDmre() {
      var show = selectedKey(industry) === 'petroleum';
      dmreField.hidden = !show;
      dmreInput.disabled = !show; // disabled fields are not submitted
      if (!show) { dmreInput.value = ''; clearError(dmreInput); }
    }
    industry.addEventListener('change', syncDmre);
    syncDmre();

    /* Character counter */
    function syncCount() {
      counter.textContent = message.value.length + ' / ' + message.maxLength;
    }
    message.addEventListener('input', syncCount);
    syncCount();

    /* Validation rules — returns an error string or '' */
    function validate(field) {
      var v = field.type === 'checkbox' ? field.checked : field.value.trim();
      switch (field.name) {
        case 'name':
          if (!v) return 'Please enter your full name.';
          if (v.length < 2) return 'Your name should be at least 2 characters.';
          return '';
        case 'business':
          if (!v) return 'Please enter your business name.';
          if (v.length < 2) return 'Your business name should be at least 2 characters.';
          return '';
        case 'email':
          if (!v) return 'Please enter your email address.';
          if (!EMAIL_RE.test(v)) return 'Please enter a valid email address, e.g. name@company.co.za.';
          return '';
        case 'phone':
          if (v && !PHONE_RE.test(v)) return 'Please enter a valid phone number, e.g. 062 149 2996.';
          return '';
        case 'service':
          return v ? '' : 'Please select the service you require.';
        case 'dmre':
          if (v && v.length > 50) return 'Please keep this under 50 characters.';
          return '';
        case 'message':
          if (!v) return 'Please briefly describe your requirements.';
          if (v.length < 20) return 'Please add a little more detail (at least 20 characters).';
          return '';
        case 'consent':
          return v ? '' : 'Please confirm that we may use your details to respond to your enquiry.';
        default:
          return '';
      }
    }

    function errorEl(field) {
      return document.getElementById(field.name + '-error');
    }
    function showError(field, msg) {
      var el = errorEl(field);
      field.setAttribute('aria-invalid', 'true');
      if (el) el.textContent = msg;
    }
    function clearError(field) {
      var el = errorEl(field);
      field.removeAttribute('aria-invalid');
      if (el) el.textContent = '';
    }
    function check(field) {
      var msg = validate(field);
      if (msg) showError(field, msg); else clearError(field);
      return !msg;
    }

    var fields = Array.prototype.filter.call(form.elements, function (el) {
      return el.name && el.name !== 'website' && el.type !== 'submit' && el.type !== 'hidden';
    });

    // Validate on blur; re-validate as the user corrects an invalid field
    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.type === 'checkbox') return; // validated on change/submit only
        if (field.value || field.hasAttribute('aria-invalid')) check(field);
      });
      field.addEventListener(field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input', function () {
        if (field.hasAttribute('aria-invalid')) check(field);
      });
    });

    function setStatus(type, title, html) {
      statusBox.className = 'form-status form-status--' + type;
      statusBox.innerHTML = '<strong>' + title + '</strong><p>' + html + '</p>';
      statusBox.hidden = false;
      statusBox.focus();
    }

    function setSubmitting(on) {
      submitBtn.disabled = on;
      submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
      spinner.hidden = !on;
      submitLabel.textContent = on ? 'Submitting…' : 'Submit Enquiry';
    }

    var ERROR_TITLE = 'We couldn’t submit your enquiry.';
    var ERROR_BODY = 'Please try again or contact us directly at ' +
      '<a href="mailto:hello@cleartradelogistics.co.za">hello@cleartradelogistics.co.za</a>.';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statusBox.hidden = true;

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (field.disabled) return;
        if (!check(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // Honeypot: real visitors never see or fill this field
      if (form.elements.website && form.elements.website.value) {
        setStatus('error', ERROR_TITLE, ERROR_BODY);
        return;
      }

      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint) {
        // No form service connected yet — never fake a successful submission.
        console.warn('Consultation form: no data-endpoint configured. See README.md → "Connecting the contact form".');
        setStatus('error', ERROR_TITLE, ERROR_BODY);
        return;
      }

      setSubmitting(true);
      fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Request failed with status ' + res.status);
          form.reset();
          syncDmre();
          syncCount();
          setStatus('success', 'Thank you for your enquiry.',
            'Your request has been submitted successfully. Our team will review the information and contact you using the details provided.');
        })
        .catch(function () {
          setStatus('error', ERROR_TITLE, ERROR_BODY);
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }

  initMobileMenu();
  initReveal();
  initYear();
  initConsultationForm();
})();
