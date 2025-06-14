    const popupLink = document.querySelector('a[href="#"]');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupBox = document.getElementById('popup-box');
    const popupClose = document.getElementById('popup-close');
    const modeToggle = document.getElementById('mode-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Open popup on click
    if (popupLink) {
      popupLink.addEventListener('click', (e) => {
        e.preventDefault();
        popupOverlay.style.display = 'flex';
      });
    }

    // Close popup on outside click or close button
    document.addEventListener('click', (e) => {
      if (popupOverlay.style.display === 'flex' && !popupBox.contains(e.target) && e.target !== popupLink) {
        popupOverlay.style.display = 'none';
      }
    });
    popupClose.addEventListener('click', () => {
      popupOverlay.style.display = 'none';
    });

    // Handle theme
    function setTheme(theme) {
      document.body.classList.toggle('dark', theme === 'dark');
      themeIcon.querySelector('use').setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
      modeToggle.title = (theme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode');
     localStorage.setItem('theme', theme);
    }

    function getPreferredTheme() {
      return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    modeToggle.addEventListener('click', () => {
      const current = document.body.classList.contains('dark') ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });

    setTheme(getPreferredTheme());

    // Open popup if URL has ?changelog=true
    if (new URLSearchParams(window.location.search).get('changelog') === 'true') {
      popupOverlay.style.display = 'flex';
    }