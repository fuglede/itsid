/* ===== Itsid - Main JavaScript ===== */

(function () {
  'use strict';

  // Mobile Navigation Toggle
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.innerHTML = isOpen
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        hamburger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
      });
    });
  }

  // April Fools Modal - intercept all dead links
  (function () {
    // Inject modal HTML once
    var overlay = document.createElement('div');
    overlay.className = 'af-overlay';
    overlay.innerHTML = [
      '<div class="af-modal" role="dialog" aria-modal="true" aria-labelledby="af-title">',
      '  <div class="af-modal__loading" id="af-loading">',
      '    <div class="demo-spinner" style="width:24px;height:24px;"></div>',
      '    <span id="af-loading-text">Loading...</span>',
      '  </div>',
      '  <div class="af-modal__reveal" id="af-reveal">',
      '    <span class="af-modal__emoji">🎉</span>',
      '    <h2 class="af-modal__title" id="af-title">April Fools.</h2>',
      '    <p class="af-modal__body">',
      '      <strong>Itsid is not a real product.</strong> There is no 14-billion parameter model.',
      '      The identity function - <code>𝑥 ↦ 𝑥</code> - does not require a transformer, a GPU cluster,',
      '      or a Series A round. It requires returning the input.<br><br>',
      '      In particular, <strong>passing code through an LLM does not launder its license.</strong>',
      '      Courts have not settled this. Legal scholars disagree. Do not do this.',
      '      <br><br>',
      '      Happy April 1st. Please consult an actual lawyer for actual legal questions.',
      '      <br><br>',
      '      In the meantime, come hang out <a href="https://mastodon.social/@fuglede/116328306490969617">on Mastodon</a>.',
      '    </p>',
      '    <button class="af-modal__close" id="af-close">lol k</button>',
      '  </div>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);

    function openModal(label) {
      var loadingText = document.getElementById('af-loading-text');
      var loading = document.getElementById('af-loading');
      var reveal = document.getElementById('af-reveal');
      loadingText.textContent = 'Loading ' + (label || 'page') + '...';
      loading.style.display = 'flex';
      reveal.classList.remove('visible');
      overlay.classList.add('visible');
      setTimeout(function () {
        loading.style.display = 'none';
        reveal.classList.add('visible');
      }, 5000);
    }

    function closeModal() {
      overlay.classList.remove('visible');
    }

    document.getElementById('af-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    // Intercept all dead hash links
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href="#"]');
      if (!a) return;
      e.preventDefault();
      openModal(a.textContent.trim());
    });
  }());

  // FAQ Accordion
  document.querySelectorAll('.faq-item__q').forEach(function (q) {
    q.addEventListener('click', function () {
      const item = this.parentElement;
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // Demo Page Logic
  const demoInput = document.getElementById('demo-input');
  const demoOutput = document.getElementById('demo-output');
  const demoBtn = document.getElementById('demo-btn');
  const demoProgress = document.getElementById('demo-progress');
  const demoProgressText = document.getElementById('demo-progress-text');
  const charCounter = document.getElementById('char-counter');

  var MAX_CHARS = 500;
  var TOKENS_PER_SEC = 1.5;
  var isGenerating = false;

  if (demoInput && charCounter) {
    demoInput.addEventListener('input', function () {
      var len = demoInput.value.length;
      charCounter.textContent = len + ' / ' + MAX_CHARS;
      if (len > MAX_CHARS) {
        charCounter.classList.add('over-limit');
      } else {
        charCounter.classList.remove('over-limit');
      }
    });
  }

  if (demoBtn) {
    demoBtn.addEventListener('click', function () {
      if (isGenerating) return;

      var input = demoInput.value;
      if (!input.trim()) return;

      if (input.length > MAX_CHARS) {
        alert('Input exceeds the free tier limit of ' + MAX_CHARS + ' characters. Upgrade to Pro for unlimited input.');
        return;
      }

      // Start generation
      isGenerating = true;
      demoOutput.value = '';
      demoBtn.disabled = true;
      demoBtn.textContent = 'Generating...';
      if (demoProgress) {
        demoProgress.classList.add('visible');
      }

      // Split input into "tokens" (words + whitespace chunks)
      var tokens = tokenize(input);
      var currentIndex = 0;
      var totalTokens = tokens.length;

      // Calculate interval for token rate
      var interval = 1000 / TOKENS_PER_SEC;

      function emitNextToken() {
        if (currentIndex >= totalTokens) {
          // Done
          isGenerating = false;
          demoBtn.disabled = false;
          demoBtn.textContent = 'Transform';
          if (demoProgress) {
            demoProgress.classList.remove('visible');
          }
          return;
        }

        demoOutput.value += tokens[currentIndex];
        demoOutput.scrollTop = demoOutput.scrollHeight;
        currentIndex++;

        if (demoProgressText) {
          var pct = Math.round((currentIndex / totalTokens) * 100);
          demoProgressText.textContent = 'Processing... ' + pct + '% (' + currentIndex + '/' + totalTokens + ' tokens)';
        }

        setTimeout(emitNextToken, interval + (Math.random() * 200 - 100)); // slight jitter
      }

      // Simulate a brief "thinking" delay
      setTimeout(function () {
        if (demoProgressText) {
          demoProgressText.textContent = 'Initializing identity transform pipeline...';
        }
        setTimeout(emitNextToken, 400);
      }, 600);
    });
  }

  /**
   * Tokenize text into word-like chunks that mimic LLM token boundaries.
   * We split on word boundaries and whitespace to produce realistic-looking token emission.
   */
  function tokenize(text) {
    var tokens = [];
    var current = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(ch);
      } else if (/[{}()\[\];:,.<>\/\\=+\-*&|!?@#$%^~`"]/.test(ch)) {
        if (current) {
          tokens.push(current);
          current = '';
        }
        tokens.push(ch);
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  // DevTools Console Easter Egg
  (function () {
    var art = [
      '  ██╗███████╗███████╗██╗██████╗ ',
      '  ██║╔══██╔═══██╔════╗██║██╔══██╗',
      '  ██║   ██║   ███████╗██║██║  ██║',
      '  ██║   ██║   ╔════██║██║██║  ██║',
      '  ██║   ██║   ███████║██║██████╔╝',
      '  ╚═╝   ╚═╝   ╚══════╝╚═╝╚═════╝ ',
      '',
      '  𝑥 ↦ 𝑥',
      '',
      "  Hi. If you're reading this, you already know what Itsid does.",
      '  You could have just read the input.',
      '',
      '  Our source code is its own documentation.',
    ].join('\n');
    console.log('%c' + art, 'color:#6b85f7; font-family:monospace; line-height:1.4;');
  }());

  // Konami Code - MAXIMUM FIDELITY MODE
  (function () {
    var seq = [38,38,40,40,37,39,37,39,66,65];
    var pos = 0;
    document.addEventListener('keydown', function (e) {
      pos = (e.keyCode === seq[pos]) ? pos + 1 : (e.keyCode === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; triggerMaxFidelity(); }
    });

    function triggerMaxFidelity() {
      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0f;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;color:#4f6df5;text-align:center;cursor:pointer;';
      overlay.innerHTML = [
        '<div style="font-size:clamp(1rem,3.5vw,1.8rem);font-weight:800;letter-spacing:0.08em;margin-bottom:20px;">⚡ MAXIMUM FIDELITY MODE ENGAGED ⚡</div>',
        '<div style="width:320px;height:6px;background:#1a1a28;border-radius:3px;overflow:hidden;margin-bottom:20px;">',
        '<div id="mf-bar" style="height:100%;width:0%;background:#4f6df5;transition:width 0.04s linear;"></div></div>',
        '<div id="mf-lbl" style="font-size:0.85rem;color:#6a6a82;">Initializing advanced identity pipeline…</div>',
      ].join('');
      document.body.appendChild(overlay);

      var labels = [
        'Loading 14B parameters…',
        'Calibrating identity weights…',
        'Verifying fidelity tensors…',
        'Engaging Advanced Identity Mode™…',
        'Running self-check: output === input…',
        'Self-check passed.',
        'MAXIMUM FIDELITY ACHIEVED.',
      ];
      var bar = overlay.querySelector('#mf-bar');
      var lbl = overlay.querySelector('#mf-lbl');
      var pct = 0, labelIdx = 0;

      var timer = setInterval(function () {
        pct += 1.4;
        bar.style.width = Math.min(pct, 100) + '%';
        var t = Math.min(Math.floor(pct / 100 * labels.length), labels.length - 1);
        if (t !== labelIdx) { labelIdx = t; lbl.textContent = labels[labelIdx]; }
        if (pct >= 100) {
          clearInterval(timer);
          setTimeout(function () {
            lbl.innerHTML = '<strong style="color:#34d399;font-size:1rem;">Everything looks exactly the same. This is correct.</strong><br><span style="font-size:0.75rem;color:#6a6a82;margin-top:10px;display:block;">Click anywhere to dismiss.</span>';
            overlay.addEventListener('click', function () { document.body.removeChild(overlay); });
          }, 400);
        }
      }, 30);
    }
  }());

  // Docs Sidebar Active State
  var sidebarLinks = document.querySelectorAll('.docs-sidebar__nav a');
  if (sidebarLinks.length) {
    var sections = [];
    sidebarLinks.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        var el = document.querySelector(id);
        if (el) sections.push({ link: link, el: el });
      }
    });

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY + 120;
      var active = sections[0];
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= scrollY) {
          active = sections[i];
        }
      }
      sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
      if (active) active.link.classList.add('active');
    });
  }

})();
