// src/script.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Globe from 'globe.gl';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Utility function
const exists = (selector) => document.querySelector(selector) !== null;

// Header Interactivity
const initHeader = () => {
  console.log('Initializing header');
  const burgerMenu = document.querySelector('.burger-menu');
  const header = document.querySelector('.header');
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.querySelector('.search-input');
  const searchPlaceholder = document.querySelector('.search-placeholder');
  const suggestions = document.querySelector('.suggestions');
  const discoverBtn = document.querySelector('.discover-btn');
  const menuItems = document.querySelectorAll('.menu a');

  if (burgerMenu && header) {
    burgerMenu.addEventListener('mouseenter', () => {
      if (!burgerMenu.classList.contains('active')) {
        burgerMenu.classList.add('active');
        header.classList.add('darkened');
        gsap.to('.menu', {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
        gsap.from('.menu li', {
          opacity: 0,
          y: 10,
          stagger: 0.1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });

    burgerMenu.addEventListener('mouseleave', () => {
      if (burgerMenu.classList.contains('active')) {
        burgerMenu.classList.remove('active');
        header.classList.remove('darkened');
        gsap.to('.menu', {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    });

    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const href = item.getAttribute('href');
        const preview = item.querySelector('.menu-preview');
        if (preview) {
          preview.classList.add('active');
          gsap.fromTo(preview, 
            { scale: 0, opacity: 0 },
            { 
              scale: 1, 
              opacity: 1, 
              duration: 0.5, 
              ease: 'power2.out', 
              onComplete: () => {
                setTimeout(() => {
                  window.location.href = href;
                }, 1000);
              }
            }
          );
        } else {
          window.location.href = href;
        }
      });
    });
  } else {
    console.warn('Burger menu or header not found');
  }

  if (searchContainer && searchInput && suggestions && searchPlaceholder) {
    const suggestionList = [
      'NOVA7', 'GEOTRACE', 'MOZGIS', 'DRC', 'Mission', 'Launches',
      'Career', 'Updates', 'Discover'
    ];

    searchContainer.addEventListener('mouseenter', () => {
      searchContainer.classList.add('active');
      gsap.to(suggestions, { opacity: 1, y: 0, duration: 0.3 });

      const letters = searchPlaceholder.textContent.split('');
      searchPlaceholder.textContent = '';
      letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.style.opacity = 0;
        searchPlaceholder.appendChild(span);
        gsap.to(span, {
          opacity: 1,
          duration: 0.1,
          delay: index * 0.05,
          ease: 'power1.in'
        });
      });
    });

    searchContainer.addEventListener('mouseleave', () => {
      if (document.activeElement !== searchInput) {
        searchContainer.classList.remove('active');
        gsap.to(suggestions, { opacity: 0, y: -10, duration: 0.3 });
      }
    });

    searchInput.addEventListener('focus', () => {
      searchContainer.classList.add('active');
      gsap.to(suggestions, { opacity: 1, y: 0, duration: 0.3 });
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        if (!searchContainer.matches(':hover')) {
          searchContainer.classList.remove('active');
          gsap.to(suggestions, { opacity: 0, y: -10, duration: 0.3, onComplete: () => suggestions.innerHTML = '' });
        }
      }, 200);
    });

    searchInput.addEventListener('input', () => {
      const value = searchInput.value.trim();
      suggestions.innerHTML = '';
      if (!value) return;

      const filteredSuggestions = suggestionList.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      filteredSuggestions.forEach(item => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = item;
        suggestionItem.addEventListener('click', () => {
          searchInput.value = item;
          suggestions.innerHTML = '';
          searchContainer.classList.remove('active');
          gsap.to(suggestions, { opacity: 0, y: -10, duration: 0.3 });
        });
        suggestions.appendChild(suggestionItem);
        gsap.from(suggestionItem, { opacity: 0, y: 10, duration: 0.2, delay: suggestions.childElementCount * 0.05 });
      });
    });
  }

  if (discoverBtn) {
    discoverBtn.addEventListener('click', () => {
      console.log('Discover button clicked');
      gsap.to(discoverBtn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          window.location.href = '/discover.html';
        }
      });
    });
  }
};

// Hero Typing Animation and Quote Scroll Effect
const initHeroTyping = () => {
  console.log('Initializing hero typing');
  const heroText = document.querySelector('.hero-question');
  const heroVideo = document.querySelector('.hero-video');
  const heroSection = document.querySelector('.hero');
  const heroQuote = document.querySelector('.hero blockquote');
  if (!heroText || !heroVideo || !heroSection) return;

  const text = heroText.textContent; // Use the text already in the HTML
  heroText.textContent = '';

  let charIndex = 0;
  const chars = text.split('');
  const spans = [];

  chars.forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.opacity = 0;
    heroText.appendChild(span);
    spans.push(span);
    charIndex++;
  });

  let currentCharIndex = 0;
  const starsCharIndex = text.indexOf('stars') !== -1 ? text.indexOf('stars') : text.length;
  const stagger = 0.05;
  let videoTriggered = false;

  const charsBeforeStars = starsCharIndex;
  const timeBeforeStars = charsBeforeStars * stagger;
  const videoStartTime = Math.max(0, timeBeforeStars - 3);

  const animateTyping = (startIndex, endIndex, stagger, onComplete) => {
    const spansToAnimate = spans.slice(startIndex, endIndex);
    gsap.to(spansToAnimate, {
      opacity: 1,
      scale: 1.2,
      color: '#FFC107',
      textShadow: '0 0 10px #FFC107, 0 0 20px #FFC107',
      duration: 0.1,
      stagger: stagger,
      ease: 'power1.inOut',
      onUpdate: function() {
        const progress = this.progress();
        currentCharIndex = startIndex + Math.floor(progress * spansToAnimate.length);
        spans.forEach(span => {
          span.classList.remove('highlight');
          span.classList.remove('fancy');
        });
        if (currentCharIndex < spans.length) {
          spans[currentCharIndex].classList.add('highlight');
          spans[currentCharIndex].classList.add('fancy');
        }
      },
      onComplete: onComplete
    });
  };

  setTimeout(() => {
    if (!videoTriggered) {
      heroVideo.style.display = 'block';
      heroVideo.play().catch(error => console.error(`Error playing hero video: ${error}`));
      gsap.fromTo(heroVideo, 
        { opacity: 0, scale: 1, boxShadow: '0 0 0 rgba(255, 193, 7, 0)' },
        { 
          opacity: 1, 
          scale: 1.05, 
          boxShadow: '0 0 20px rgba(255, 193, 7, 0.8)', 
          duration: 3,
          ease: 'power2.out' 
        }
      );
      heroSection.classList.add('active');
      videoTriggered = true;
    }
  }, videoStartTime * 1000);

  animateTyping(0, spans.length, stagger, () => {
    spans.forEach(span => {
      span.classList.remove('highlight');
      span.classList.remove('fancy');
    });
    gsap.to(spans, {
      y: -10,
      scale: 1.2,
      color: '#FFC107',
      textShadow: '0 0 10px #FFC107, 0 0 20px #FFC107',
      duration: 0.5,
      stagger: 0.02,
      ease: 'elastic.out(1, 0.3)',
      repeat: 1,
      yoyo: true,
      onComplete: () => {
        gsap.to(spans, {
          textShadow: '0 0 5px #FFC107, 0 0 10px #FFC107',
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.className = 'typing-cursor';
    heroText.appendChild(cursor);
    gsap.to(cursor, {
      opacity: 0,
      repeat: -1,
      yoyo: true,
      duration: 0.5
    });
  });

  if (heroQuote) {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        gsap.to(heroQuote, {
          y: -50,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in'
        });
      } else {
        gsap.to(heroQuote, {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out'
        });
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
  }
};

// Animated Counters
const initCounters = () => {
  console.log('Initializing counters');
  const counters = document.querySelectorAll('.counter');
  const numberItems = document.querySelectorAll('.number-item');
  const numbersSection = document.querySelector('.numbers');

  if (!counters.length || !numbersSection) return;

  const animateCounter = (counter, target, duration) => {
    const isCurrency = target >= 22000000;
    gsap.fromTo(counter,
      { innerText: 0 },
      {
        innerText: target,
        duration: duration,
        ease: 'power1.out',
        snap: { innerText: 1 },
        onUpdate: function() {
          const value = parseInt(counter.innerText);
          counter.textContent = isCurrency && value >= target ? '$22M' : value;
        }
      }
    );
  };

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    ScrollTrigger.create({
      trigger: numbersSection,
      start: 'top 80%',
      onEnter: () => {
        animateCounter(counter, target, 2);
        numberItems.forEach(item => item.classList.add('visible'));
      },
      onEnterBack: () => {
        animateCounter(counter, target, 2);
        numberItems.forEach(item => item.classList.add('visible'));
      }
    });
  });

  gsap.to(numberItems, {
    scrollTrigger: {
      trigger: numbersSection,
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.out'
  });
};

// Project Videos with "Learn More" Effect (Homepage)
const initProjects = () => {
  console.log('Initializing projects');
  const projectItems = document.querySelectorAll('.project-item');

  if (!projectItems.length) return;

  projectItems.forEach(item => {
    const video = item.querySelector('.project-video');
    const overlay = item.querySelector('.project-overlay');
    const learnMoreBtn = item.querySelector('.btn');

    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 60%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      onStart: () => {
        if (video) video.play().catch(error => console.error(`Error playing video ${video.src}:`, error));
      }
    });

    gsap.to(overlay, {
      scrollTrigger: {
        trigger: item,
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0.7,
      duration: 0.5
    });

    gsap.to(learnMoreBtn, {
      scrollTrigger: {
        trigger: item,
        start: 'top 60%',
        toggleActions: 'play none none reverse'
      },
      onStart: () => {
        learnMoreBtn.classList.add('highlight');
      },
      onReverseComplete: () => {
        learnMoreBtn.classList.remove('highlight');
      }
    });
  });
};

// Scroll Arrow (Homepage)
const initScrollArrow = () => {
  console.log('Initializing scroll arrow');
  let scrollArrow = document.querySelector('.scroll-arrow');
  if (!scrollArrow) {
    scrollArrow = document.createElement('div');
    scrollArrow.className = 'scroll-arrow';
    scrollArrow.innerHTML = `<img src="/public/icons/arrow-down.svg" alt="Scroll Arrow" class="arrow-icon" loading="lazy" onerror="this.src='/public/icons/fallback-arrow.svg'">`;
    document.body.appendChild(scrollArrow);
  }

  const projectItems = document.querySelectorAll('.section-projects .project-item');
  let currentIndex = 0;

  const updateArrowDirection = (direction) => {
    const img = scrollArrow.querySelector('.arrow-icon');
    gsap.to(img, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        img.src = direction === 'down' ? '/public/icons/arrow-down.svg' : '/public/icons/arrow-up.svg';
        gsap.to(img, { opacity: 1, duration: 0.3 });
      }
    });
  };

  projectItems.forEach((item, index) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        currentIndex = index;
        if (index === 0) {
          updateArrowDirection('down');
          gsap.to(scrollArrow, { opacity: 1, duration: 0.3 });
        } else if (index === projectItems.length - 1) {
          updateArrowDirection('up');
          gsap.to(scrollArrow, { opacity: 1, duration: 0.3 });
        } else {
          updateArrowDirection('down');
          gsap.to(scrollArrow, { opacity: 1, duration: 0.3 });
        }
      },
      onLeave: () => {
        if (index === projectItems.length - 1) {
          gsap.to(scrollArrow, { opacity: 0, duration: 0.3 });
        }
      },
      onEnterBack: () => {
        currentIndex = index;
        if (index === 0) {
          gsap.to(scrollArrow, { opacity: 0, duration: 0.3 });
        } else if (index === projectItems.length - 1) {
          updateArrowDirection('up');
          gsap.to(scrollArrow, { opacity: 1, duration: 0.3 });
        } else {
          updateArrowDirection('up');
          gsap.to(scrollArrow, { opacity: 1, duration: 0.3 });
        }
      },
      onLeaveBack: () => {
        if (index === 0) {
          gsap.to(scrollArrow, { opacity: 0, duration: 0.3 });
        }
      }
    });
  });

  scrollArrow.addEventListener('click', () => {
    const currentArrowSrc = scrollArrow.querySelector('.arrow-icon').src;
    let targetIndex = currentArrowSrc.includes('arrow-down.svg')
      ? Math.min(currentIndex + 1, projectItems.length - 1)
      : Math.max(currentIndex - 1, 0);

    gsap.to(window, {
      scrollTo: { y: projectItems[targetIndex], autoKill: false },
      duration: 1,
      ease: 'power2.inOut'
    });
  });

  gsap.from(scrollArrow, {
    scrollTrigger: {
      trigger: '.section-projects',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 20,
    duration: 0.5
  });
};

// Timeline Carousel (Mission and Launches Pages)
const initTimeline = () => {
  console.log('Initializing timeline');
  const yearButtons = document.querySelectorAll('.year-btn');
  const slides = document.querySelectorAll('.timeline-slide');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  let currentIndex = 0;

  if (!yearButtons.length || !slides.length) return;

  const showSlide = (index) => {
    gsap.to(slides[currentIndex], {
      opacity: 0,
      x: index > currentIndex ? -50 : 50,
      scale: 0.98,
      duration: 0.8,
      ease: 'sine.inOut',
      onComplete: () => {
        slides.forEach(slide => slide.classList.remove('active'));
        yearButtons.forEach(btn => btn.classList.remove('active'));
        slides[index].classList.add('active');
        yearButtons[index].classList.add('active');
        gsap.fromTo(slides[index], 
          { opacity: 0, x: index > currentIndex ? 50 : -50, scale: 0.98 },
          { 
            opacity: 1, 
            x: 0, 
            scale: 1, 
            duration: 1.2,
            ease: 'sine.inOut'
          }
        );
        currentIndex = index;

        if (leftArrow && rightArrow) {
          leftArrow.classList.toggle('disabled', index === 0);
          rightArrow.classList.toggle('disabled', index === slides.length - 1);
        }
      }
    });
  };

  yearButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => showSlide(index));
    btn.addEventListener('mouseover', () => showSlide(index));
  });

  if (leftArrow && rightArrow) {
    leftArrow.addEventListener('click', () => {
      if (currentIndex > 0) showSlide(currentIndex - 1);
    });
    rightArrow.addEventListener('click', () => {
      if (currentIndex < slides.length - 1) showSlide(currentIndex + 1);
    });
  }

  gsap.from('.timeline-nav, .timeline-content', {
    scrollTrigger: {
      trigger: '.timeline',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2
  });
};

// Success Story (Mission, Project Pages, Career)
const initSuccessStory = () => {
  console.log('Initializing success story');
  const storyItems = document.querySelectorAll('.story-item');

  if (!storyItems.length) return;

  storyItems.forEach(item => {
    const video = item.querySelector('.story-video');
    const image = item.querySelector('.story-image');
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      onStart: () => {
        if (video) video.play().catch(error => console.error(`Error playing video: ${error}`));
      }
    });

    if (image) {
      gsap.from(image, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power2.out'
      });
    }
  });
};

// Facilities Globe and Ticker (Mission Page)
const initFacilities = async () => {
  console.log('Initializing facilities');
  const globeContainer = document.getElementById('globe-container');
  const officeTicker = document.getElementById('office-ticker');

  if (!globeContainer || !officeTicker) {
    console.warn('Globe container or office ticker not found');
    return;
  }

  let facilities = [];
  try {
    const response = await fetch('/public/data/offices.json');
    facilities = await response.json();
  } catch (error) {
    console.error('Error fetching offices.json, using fallback:', error);
    facilities = [
      { name: 'London', lat: 51.5074, lng: -0.1278, index: 0, active: false, hovered: false },
      { name: 'Washington, DC', lat: 38.9072, lng: -77.0369, index: 1, active: false, hovered: false },
      { name: 'Ottawa', lat: 45.4215, lng: -75.6972, index: 2, active: false, hovered: false },
      { name: 'Sandton, Johannesburg', lat: -26.1076, lng: 28.0567, index: 3, active: false, hovered: false }
    ];
  }

  const tickerWrapper = officeTicker.querySelector('.ticker-wrapper');
  const tickerCards = tickerWrapper.querySelectorAll('.ticker-card');

  if (tickerCards.length !== facilities.length) {
    console.warn('Number of ticker cards does not match facilities:', tickerCards.length, facilities.length);
  }

  const totalWidth = tickerWrapper.scrollWidth;
  const containerWidth = officeTicker.offsetWidth;
  const maxScroll = totalWidth - containerWidth;
  console.log('Total ticker width:', totalWidth, 'Container width:', containerWidth, 'Max scroll:', maxScroll);

  let tickerAnimation;
  let isPaused = false;

  const startTickerAnimation = () => {
    if (maxScroll <= 0) {
      console.log('Ticker content fits within container, no scrolling needed.');
      return;
    }

    tickerAnimation = gsap.to(tickerWrapper, {
      x: -maxScroll,
      duration: 20,
      ease: 'linear',
      repeat: -1,
      yoyo: true,
      onRepeat: () => {
        tickerAnimation.pause();
        setTimeout(() => {
          if (!isPaused) {
            tickerAnimation.play();
          }
        }, 1000);
      }
    });
  };

  startTickerAnimation();

  officeTicker.addEventListener('mouseenter', () => {
    if (!isPaused && tickerAnimation) {
      console.log('Pausing ticker animation');
      tickerAnimation.pause();
      isPaused = true;
    }
  });

  officeTicker.addEventListener('mouseleave', () => {
    if (isPaused && tickerAnimation) {
      console.log('Resuming ticker animation');
      tickerAnimation.play();
      isPaused = false;
    }
  });

  try {
    const globe = Globe()(globeContainer)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .backgroundColor('#000000')
      .pointColor(d => {
        if (d.hovered) return '#FFC107';
        if (d.active) return '#FFC107';
        return '#FFFFFF';
      })
      .pointRadius(d => (d.hovered || d.active) ? 1.5 : 1)
      .pointAltitude(0.1)
      .pointsData(facilities);

    const rotationSpeed = 1;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = rotationSpeed;
    globe.controls().enableZoom = false;

    globeContainer.addEventListener('mouseenter', () => {
      globe.controls().autoRotate = false;
    });

    globeContainer.addEventListener('mouseleave', () => {
      globe.controls().autoRotate = true;
    });

    const highlightTickerCard = (index) => {
      console.log('Highlighting ticker card with index:', index);
      tickerCards.forEach(card => card.classList.remove('active'));
      const targetCard = Array.from(tickerCards).find(card => parseInt(card.dataset.index) === index);
      if (targetCard) {
        targetCard.classList.add('active');
        const cardOffset = targetCard.offsetLeft;
        const containerWidth = officeTicker.offsetWidth;
        const cardWidth = targetCard.offsetWidth;
        const scrollPosition = cardOffset - (containerWidth / 2) + (cardWidth / 2);
        if (tickerAnimation) tickerAnimation.kill();
        gsap.to(tickerWrapper, {
          x: -scrollPosition,
          duration: 1,
          ease: 'power2.inOut',
          onComplete: () => {
            console.log('Ticker animation resumed after centering');
            isPaused = false;
            startTickerAnimation();
          }
        });
      } else {
        console.warn('Ticker card not found for index:', index);
      }
    };

    const highlightGlobePoint = (index) => {
      if (index < 0 || index >= facilities.length) {
        console.error('Invalid facility index:', index);
        return;
      }
      facilities.forEach(f => f.active = false);
      const facility = facilities[index];
      if (!facility) {
        console.error('Facility not found for index:', index);
        return;
      }
      facility.active = true;
      console.log('Highlighting globe point:', facility.name, 'Active:', facility.active);
      globe.pointsData([...facilities]);
      setTimeout(() => {
        console.log('Rotating globe to:', facility.lat, facility.lng);
        globe.pointOfView({ lat: facility.lat, lng: facility.lng, altitude: 2.5 }, 1000);
      }, 100);
    };

    let lastHoveredPoint = null;
    globe.onPointHover((point) => {
      facilities.forEach(f => f.hovered = false);
      if (point) {
        lastHoveredPoint = point;
        point.hovered = true;
        console.log('Hovering over point:', point.name, 'Index:', point.index);
      } else {
        lastHoveredPoint = null;
      }
      globe.pointsData([...facilities]);
    });

    globe.onPointClick((point) => {
      console.log('Globe point clicked:', point.name, 'Index:', point.index);
      highlightTickerCard(point.index);
      highlightGlobePoint(point.index);
      globe.controls().autoRotate = false;
    });

    tickerCards.forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        console.log('Ticker card clicked:', index);
        if (isNaN(index) || index < 0 || index >= facilities.length) {
          console.error('Invalid ticker card index:', index);
          return;
        }
        highlightGlobePoint(index);
        highlightTickerCard(index);
      });
    });

    gsap.from(globeContainer, {
      scrollTrigger: {
        trigger: '.facilities',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      scale: 0.8,
      duration: 1
    });

    gsap.from(officeTicker, {
      scrollTrigger: {
        trigger: '.facilities',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      x: -50,
      duration: 1
    });
  } catch (error) {
    console.error('Error initializing globe:', error);
  }
};

// Launches Page Animations
const initLaunches = () => {
  console.log('Initializing launches');
  const launchItems = document.querySelectorAll('.launches .launch-item');

  if (!launchItems.length) return;

  launchItems.forEach(item => {
    const video = item.querySelector('.launch-video');
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      onStart: () => {
        if (video) video.play().catch(error => console.error(`Error playing video: ${error}`));
      }
    });
  });
};

// Career Page Animations
const initCareer = () => {
  console.log('Initializing career');
  const jobItems = document.querySelectorAll('.jobs-list .job-item');
  const impactItems = document.querySelectorAll('.impact-item');

  if (jobItems.length) {
    gsap.from(jobItems, {
      scrollTrigger: {
        trigger: '.jobs-list',
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      stagger: 0.2,
      ease: 'power2.out'
    });
  }

  if (impactItems.length) {
    impactItems.forEach(item => {
      const video = item.querySelector('.impact-video');
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 50,
        duration: 1,
        onStart: () => {
          if (video) video.play().catch(error => console.error(`Error playing video: ${error}`));
        }
      });
    });
  }
};

// Updates Page Animations
const initUpdates = () => {
  console.log('Initializing updates');
  const updateItems = document.querySelectorAll('.update-item');

  if (!updateItems.length) return;

  gsap.from(updateItems, {
    scrollTrigger: {
      trigger: '.updates-list',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.out'
  });
};

// Discover Page Animations
const initDiscover = () => {
  console.log('Initializing discover');
  const productItems = document.querySelectorAll('.product-item');

  if (!productItems.length) return;

  gsap.from(productItems, {
    scrollTrigger: {
      trigger: '.products-grid',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    ease: 'power2.out'
  });

  const discoverSearch = document.querySelector('.discover-search input');
  if (discoverSearch) {
    discoverSearch.addEventListener('focus', () => {
      gsap.to(discoverSearch, { width: '300px', duration: 0.5, ease: 'power2.out' });
    });
    discoverSearch.addEventListener('blur', () => {
      gsap.to(discoverSearch, { width: '150px', duration: 0.5, ease: 'power2.in' });
    });
  }
};

// PDF Viewer for Project Pages
const initPdfViewer = () => {
  console.log('Initializing PDF viewer');
  const pdfContainer = document.getElementById('pdf-viewer');
  const pdfUrl = pdfContainer ? pdfContainer.dataset.pdf : null;

  if (!pdfContainer || !pdfUrl) return;

  // Load PDF.js
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  pdfContainer.appendChild(canvas);

  const renderPage = (num) => {
    pageRendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = pdfContainer.clientWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale: scale });

      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: scaledViewport
      };
      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });

    document.getElementById('page-num').textContent = num;
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  };

  document.getElementById('prev-page').addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  });

  document.getElementById('next-page').addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  });

  pdfjsLib.getDocument(pdfUrl).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.getElementById('page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
  });

  // Animation for PDF viewer
  gsap.from(pdfContainer, {
    scrollTrigger: {
      trigger: '.pdf-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1,
    ease: 'power2.out'
  });
};

// Terms, Privacy, Contact Pages Animations
const initLegalPages = () => {
  console.log('Initializing legal pages');
  const contentSections = document.querySelectorAll('.terms, .privacy, .contact');
  
  contentSections.forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power2.out'
    });
  });

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    gsap.from(contactForm, {
      scrollTrigger: {
        trigger: contactForm,
        start: 'top 80%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power2.out'
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      gsap.to(contactForm, {
        scale: 0.95,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          alert('Message sent successfully!');
          contactForm.reset();
        }
      });
    });
  }
};

// Chatbot
const initChatbot = () => {
  console.log('Initializing chatbot');
  const chatbot = document.querySelector('.chatbot');
  const chatbotBtn = document.querySelector('.chatbot-btn');
  const chatbotClose = document.querySelector('.chatbot-close');
  const chatbotWindow = document.querySelector('.chatbot-window');
  const chatbotMessages = document.querySelector('.chatbot-messages');
  const chatbotInput = document.querySelector('.chatbot-input input');
  const chatbotSend = document.querySelector('.chatbot-input button');

  if (!chatbot || !chatbotBtn || !chatbotClose || !chatbotWindow || !chatbotMessages || !chatbotInput || !chatbotSend) {
    console.warn('Chatbot elements not found:', { chatbot, chatbotBtn, chatbotClose, chatbotWindow, chatbotMessages, chatbotInput, chatbotSend });
    return;
  }

  chatbot.style.display = 'block';
  chatbot.style.opacity = '1';
  chatbot.style.zIndex = '1000';

  const btnRect = chatbotBtn.getBoundingClientRect();
  console.log('Chatbot button position:', btnRect);

  const elementsAtPoint = document.elementsFromPoint(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2);
  console.log('Elements at chatbot button position:', elementsAtPoint);

  let isOpen = false;

  const openChatbot = () => {
    if (!isOpen) {
      console.log('Opening chatbot');
      isOpen = true;
      chatbot.classList.add('active');
      gsap.to(chatbotWindow, {
        transform: 'scale(1)',
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        onStart: () => console.log('Chatbot window animation started'),
        onComplete: () => console.log('Chatbot window fully opened')
      });
    }
  };

  const closeChatbot = () => {
    if (isOpen && document.activeElement !== chatbotInput) {
      console.log('Closing chatbot');
      isOpen = false;
      chatbot.classList.remove('active');
      gsap.to(chatbotWindow, {
        transform: 'scale(0)',
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onStart: () => console.log('Chatbot window closing animation started'),
        onComplete: () => console.log('Chatbot window fully closed')
      });
    }
  };

  chatbotBtn.addEventListener('mouseenter', (e) => {
    console.log('Mouse entered chatbot button', e);
    openChatbot();
  });

  chatbot.addEventListener('mouseleave', (e) => {
    console.log('Mouse left chatbot', e);
    setTimeout(() => {
      if (document.activeElement !== chatbotInput) {
        closeChatbot();
      }
    }, 200);
  });

  chatbotBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Chatbot button clicked', e);
    if (isOpen) {
      closeChatbot();
    } else {
      openChatbot();
    }
  });

  chatbotClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Chatbot close button clicked', e);
    closeChatbot();
  });

  chatbotWindow.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  chatbotInput.addEventListener('focus', () => {
    console.log('Chatbot input focused');
    openChatbot();
  });

  const sendMessage = () => {
    const messageText = chatbotInput.value.trim();
    if (!messageText) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = messageText;
    chatbotMessages.appendChild(userMessage);

    gsap.from(userMessage, { opacity: 0, y: 20, duration: 0.5 });

    chatbotInput.value = '';
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    setTimeout(() => {
      const botMessage = document.createElement('div');
      botMessage.className = 'message bot';
      botMessage.textContent = getBotResponse(messageText);
      chatbotMessages.appendChild(botMessage);
      gsap.from(botMessage, { opacity: 0, y: 20, duration: 0.5 });
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 500);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('nova7')) return 'NOVA7 is our AI-powered platform, mapping minerals with cosmic precision!';
    if (lowerMessage.includes('geotrace')) return 'GEOTRACE tracks geological wonders across the galaxy—pretty stellar, right?';
    if (lowerMessage.includes('mozgis')) return 'MOZGIS brings geological intelligence to Mozambique, unearthing a world of possibilities.';
    if (lowerMessage.includes('drc')) return 'Our DRC project is mining sustainably, one star at a time.';
    if (lowerMessage.includes('mission')) return 'Our mission? To unlock the universe’s resources for humanity’s future!';
    return 'I’m your cosmic guide! Ask me about NOVA7, GEOTRACE, MOZGIS, DRC, or our mission.';
  };

  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
};

// Signup Form
const initSignupForm = () => {
  console.log('Initializing signup form');
  const form = document.querySelector('.signup-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]').value;
    gsap.to(form, {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        alert(`Thank you for signing up with ${email}!`);
        form.reset();
      }
    });
  });

  gsap.from(form, {
    scrollTrigger: {
      trigger: '.signup-footer',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 50,
    duration: 1
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded');
  initHeader();
  initHeroTyping();
  initCounters();
  initProjects();
  initScrollArrow();
  initTimeline();
  initSuccessStory();
  initFacilities();
  initLaunches();
  initCareer();
  initUpdates();
  initDiscover();
  initPdfViewer();
  initLegalPages();
  initChatbot();
  initSignupForm();
});