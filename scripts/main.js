const highlightActiveNav = () => {
  const navLinks = document.querySelectorAll('.navbar__link');
  const path = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach((link) => {
    const linkPath = link.getAttribute('href').split('#')[0];
    if (linkPath === path || (path === '' && linkPath === 'index.html')) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
};

let lastModalTrigger = null;

const toggleBodyScroll = () => {
  const hasOpenModal = document.querySelector('.modal.is-open');
  document.body.classList.toggle('modal-open', Boolean(hasOpenModal));
};

const injectVideo = (modal, trigger) => {
  if (!modal.classList.contains('modal--video')) {
    return;
  }

  const container = modal.querySelector('[data-modal-video-container]');
  const url = trigger?.dataset.videoUrl;

  if (container) {
    container.innerHTML = url
      ? `<iframe src="${url}" title="Vídeo Arte Construir" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
      : '';
  }
};

const clearVideo = (modal) => {
  if (!modal.classList.contains('modal--video')) {
    return;
  }

  const container = modal.querySelector('[data-modal-video-container]');
  if (container) {
    container.innerHTML = '';
  }
};

const openModal = (modalId, trigger) => {
  const modal = document.querySelector(`[data-modal-id="${modalId}"]`);
  if (!modal) {
    return;
  }

  lastModalTrigger = trigger || null;
  injectVideo(modal, trigger);
  modal.classList.add('is-open');
  toggleBodyScroll();
  const focusable = modal.querySelector('.modal__close');
  if (focusable) {
    focusable.focus();
  }
};

const closeModal = (modal) => {
  if (!modal) {
    return;
  }

  clearVideo(modal);
  modal.classList.remove('is-open');
  toggleBodyScroll();

  if (lastModalTrigger) {
    lastModalTrigger.focus();
    lastModalTrigger = null;
  }
};

const handleDocumentClick = (event) => {
  const openTrigger = event.target.closest('[data-modal-target]');
  if (openTrigger) {
    const modalId = openTrigger.dataset.modalTarget;
    openModal(modalId, openTrigger);
    return;
  }

  const closeTrigger = event.target.closest('[data-modal-close]');
  if (closeTrigger) {
    const modal = closeTrigger.closest('.modal');
    closeModal(modal);
  }
};

const handleDocumentKeydown = (event) => {
  if (event.key === 'Escape') {
    const modal = document.querySelector('.modal.is-open');
    if (modal) {
      closeModal(modal);
    }
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    const openTrigger = event.target.closest('[data-modal-target]');
    if (openTrigger) {
      const tagName = openTrigger.tagName?.toLowerCase();
      if (tagName !== 'button' && tagName !== 'a') {
        event.preventDefault();
        const modalId = openTrigger.dataset.modalTarget;
        openModal(modalId, openTrigger);
      }
    }
  }
};

const handleDocumentFocus = (event) => {
  const modal = document.querySelector('.modal.is-open');
  if (!modal) {
    return;
  }

  if (!modal.contains(event.target)) {
    const focusable = modal.querySelector('.modal__close');
    if (focusable) {
      focusable.focus();
    }
  }
};

const loadComponent = async (element) => {
  const componentName = element.dataset.component;

  try {
    const response = await fetch(`components/${componentName}.html`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o componente ${componentName}`);
    }

    const template = await response.text();
    element.innerHTML = template;

    if (componentName === 'header') {
      highlightActiveNav();
    }

    if (componentName === 'footer') {
      const yearTarget = element.querySelector('[data-footer-year]');
      if (yearTarget) {
        yearTarget.textContent = new Date().getFullYear();
      }
    }
  } catch (error) {
    console.error(error);
    element.innerHTML = `<p class="component-error">${error.message}</p>`;
  }
};

const boot = () => {
  const componentTargets = document.querySelectorAll('[data-component]');
  componentTargets.forEach(loadComponent);

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
  document.addEventListener('focusin', handleDocumentFocus);
};

document.addEventListener('DOMContentLoaded', boot);
