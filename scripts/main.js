const getCurrentPageKey = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  if (!path || path === '') {
    return 'home';
  }
  if (path === '/') {
    return 'home';
  }

  const segment = path.split('/').filter(Boolean).pop();
  const map = {
    index: 'home',
    'index.html': 'home',
    portfolio: 'portfolio',
    'portfolio.html': 'portfolio',
    partners: 'partners',
    'partners.html': 'partners',
    videos: 'videos',
    'videos.html': 'videos',
    faq: 'faq',
    'faq.html': 'faq',
  };

  return map[segment] || 'home';
};

const highlightActiveNav = () => {
  const navLinks = document.querySelectorAll('.navbar__link[data-page]');
  const currentPage = getCurrentPageKey();

  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (page === currentPage) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
};

const configureNavLinks = (container) => {
  const navLinks = container.querySelectorAll('.navbar__link[data-page]');
  if (!navLinks.length) {
    return;
  }

  const isLocal =
    window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const getHrefForPage = (page) => {
    if (page === 'home') {
      return isLocal ? 'index.html' : '/';
    }
    return isLocal ? `${page}.html` : `/${page}`;
  };

  navLinks.forEach((link) => {
    const page = link.dataset.page;
    if (!page) {
      return;
    }
    const target = getHrefForPage(page);
    link.setAttribute('href', target);
  });
};

let lastModalTrigger = null;
let activeMobileNav = null;

const initMobileNavbar = (container) => {
  const toggle = container.querySelector('[data-navbar-toggle]');
  const mobile = container.querySelector('[data-navbar-mobile]');
  const closeButton = container.querySelector('[data-navbar-close]');
  const backdrop = container.querySelector('[data-navbar-backdrop]');

  if (!toggle || !mobile || !backdrop) {
    return;
  }

  const focusableSelectors = 'a, button';
  const getFocusable = () => mobile.querySelectorAll(focusableSelectors);

  const close = (returnFocus = true) => {
    if (!container.classList.contains('navbar--open')) {
      return;
    }

    container.classList.remove('navbar--open');
    toggle.setAttribute('aria-expanded', 'false');
    mobile.setAttribute('hidden', '');
    backdrop.setAttribute('hidden', '');
    document.body.classList.remove('navbar-open');

    if (returnFocus) {
      toggle.focus();
    }

    if (activeMobileNav && activeMobileNav.container === container) {
      activeMobileNav = null;
    }
  };

  const open = () => {
    if (activeMobileNav) {
      activeMobileNav.close(false);
    }

    container.classList.add('navbar--open');
    toggle.setAttribute('aria-expanded', 'true');
    mobile.removeAttribute('hidden');
    backdrop.removeAttribute('hidden');
    document.body.classList.add('navbar-open');

    const first = getFocusable()[0];
    if (first) {
      first.focus();
    }

    activeMobileNav = { container, close };
  };

  toggle.addEventListener('click', () => {
    if (container.classList.contains('navbar--open')) {
      close();
    } else {
      open();
    }
  });

  closeButton?.addEventListener('click', () => close());
  backdrop.addEventListener('click', () => close());

  mobile.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      close(false);
    }
  });
};

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
    if (activeMobileNav) {
      activeMobileNav.close();
      return;
    }

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
  if (activeMobileNav) {
    const mobile = activeMobileNav.container.querySelector('[data-navbar-mobile]');
    const toggle = activeMobileNav.container.querySelector('[data-navbar-toggle]');
    if (mobile && toggle && !mobile.contains(event.target) && !toggle.contains(event.target)) {
      const focusable = mobile.querySelector('a, button');
      if (focusable) {
        focusable.focus();
        return;
      }
    }
  }

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

const CHATBOT_DEFAULT_WHATSAPP = '5521999999999';
const CHATBOT_RESPONSE_HEADING = 'Para tirar suas dúvidas, entre em contato pelo nosso WhatsApp';

const chatbotOptionConfig = {
  info: { heading: CHATBOT_RESPONSE_HEADING },
  projetos: { heading: CHATBOT_RESPONSE_HEADING },
  leticia: { heading: CHATBOT_RESPONSE_HEADING },
  tiago: { heading: CHATBOT_RESPONSE_HEADING },
};

const initChatbot = (container) => {
  const root = container.querySelector('[data-chatbot]');
  if (!root) {
    return;
  }

  const toggleButton = root.querySelector('[data-chatbot-toggle]');
  const windowElement = root.querySelector('[data-chatbot-window]');
  const closeButton = root.querySelector('[data-chatbot-close]');
  const messagesContainer = root.querySelector('[data-chatbot-messages]');
  const optionsContainer = root.querySelector('[data-chatbot-options]');
  const backToTopButton = root.querySelector('[data-chatbot-back-to-top]');
  const avatarSrc = root.dataset.chatbotAvatar || 'assets/images/icone-arte-construir.png';
  const whatsappNumber = root.dataset.chatbotWhatsapp || CHATBOT_DEFAULT_WHATSAPP;

  if (!toggleButton || !windowElement || !closeButton || !messagesContainer || !optionsContainer) {
    return;
  }

  const optionButtons = Array.from(optionsContainer.querySelectorAll('[data-chatbot-option]'));

  const clearOptionResponses = () => {
    const responses = optionsContainer.querySelectorAll('.chatbot__option-response');
    responses.forEach((response) => response.remove());
  };

  const resetOptions = () => {
    optionButtons.forEach((button) => button.classList.remove('is-active'));
  };

  const openChat = () => {
    windowElement.removeAttribute('hidden');
    toggleButton.setAttribute('hidden', '');
    window.setTimeout(() => closeButton.focus(), 150);
  };

  const closeChat = () => {
    windowElement.setAttribute('hidden', '');
    toggleButton.removeAttribute('hidden');
    resetOptions();
    clearOptionResponses();
  };

  const handleOptionClick = (event) => {
    const button = event.target.closest('[data-chatbot-option]');
    if (!button) {
      return;
    }

    const optionKey = button.dataset.chatbotOption;
    const label = button.dataset.chatbotLabel || button.textContent.trim();
    const whatsappMessage = button.dataset.chatbotWhatsapp || label;
    const config = chatbotOptionConfig[optionKey] || chatbotOptionConfig.info;

    optionButtons.forEach((item) => {
      item.classList.toggle('is-active', item === button);
    });

    clearOptionResponses();

    const response = document.createElement('div');
    response.className = 'chatbot__option-response';

    const title = document.createElement('strong');
    title.textContent = config.heading || CHATBOT_RESPONSE_HEADING;
    response.appendChild(title);

    const action = document.createElement('a');
    action.className = 'chatbot__whatsapp-button';
    const encodedMessage = encodeURIComponent(whatsappMessage);
    action.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    action.target = '_blank';
    action.rel = 'noreferrer noopener';
    action.innerHTML = `
      <svg class="chatbot__whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
      </svg>
      <span>Entrar em contato pelo WhatsApp</span>
    `;
    response.appendChild(action);

    button.insertAdjacentElement('afterend', response);
  };

  const handleBackToTopVisibility = () => {
    if (!backToTopButton) {
      return;
    }
    if (window.scrollY > 300) {
      backToTopButton.classList.add('is-visible');
    } else {
      backToTopButton.classList.remove('is-visible');
    }
  };

  toggleButton.addEventListener('click', openChat);
  closeButton.addEventListener('click', closeChat);
  optionsContainer.addEventListener('click', handleOptionClick);

  if (backToTopButton) {
    window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });
    handleBackToTopVisibility();
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }

  closeChat();
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
      configureNavLinks(element);
      highlightActiveNav();
      initMobileNavbar(element);
    }

    if (componentName === 'footer') {
      const yearTarget = element.querySelector('[data-footer-year]');
      if (yearTarget) {
        yearTarget.textContent = new Date().getFullYear();
      }
    }

    if (componentName === 'chat-bob') {
      initChatbot(element);
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
