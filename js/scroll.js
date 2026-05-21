// js/scroll.js — Section reveal animations (classic script)
// ScrollTrigger.refresh() is called by vault.js after vault opens
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Service steps — stagger in from below
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.service-step', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
      });
    },
  });

  // Testimonial cards — stagger in
  ScrollTrigger.create({
    trigger: '.testimonials-grid',
    start: 'top 80%',
    once: true,
    onEnter: function () {
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power2.out',
      });
    },
  });

  // CTA section
  ScrollTrigger.create({
    trigger: '.cta-section',
    start: 'top 85%',
    once: true,
    onEnter: function () {
      gsap.from('.cta-heading, .cta-sub, .cta-buttons', {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
      });
    },
  });
})();
