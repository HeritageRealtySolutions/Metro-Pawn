// js/nav.js — Mobile menu and active page highlight (classic script)
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');

  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      var isOpen = overlay.classList.contains('open');
      overlay.classList.toggle('open');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Close overlay when a link is clicked
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Mark active nav link based on current page
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-overlay a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();
