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

const loadComponent = async (element) => {
  const componentName = element.dataset.component;

  try {
    const response = await fetch(`components/${componentName}.html`);

    if (!response.ok) {
      throw new Error(`Não foi possível carregar o componente ${componentName}`);
    }

    const template = await response.text();
    element.innerHTML = template;

    if (componentName === 'header') {
      highlightActiveNav();
    }
  } catch (error) {
    console.error(error);
    element.innerHTML = `<p class="component-error">${error.message}</p>`;
  }
};

const boot = () => {
  const componentTargets = document.querySelectorAll('[data-component]');
  componentTargets.forEach(loadComponent);
};

document.addEventListener('DOMContentLoaded', boot);
