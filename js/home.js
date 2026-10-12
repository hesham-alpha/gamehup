// ============================================================
// home.js - code for the home page (index.html)
// ============================================================


// ---------- 1. HERO SLIDER ----------

// ids of the games shown in the slider (see data.js)
const heroGameIds = [3, 1, 2];

const heroSlidesBox = document.getElementById("heroSlides");
const heroDotsBox = document.getElementById("heroDots");

let currentSlide = 0;
let slideTimer;

// Creates one image and one dot for every game in heroGameIds
function buildHeroSlider() {
  heroGameIds.forEach(function (gameId, index) {
    const game = findGameById(gameId);

    // the big background image
    const image = document.createElement("img");
    image.src = getBanner(game);
    image.alt = game.title;
    image.className = "hero-image";
    heroSlidesBox.appendChild(image);

    // the small dot at the bottom
    const dot = document.createElement("button");
    dot.className = "hero-dot";
    dot.setAttribute("aria-label", "Show slide " + (index + 1));
    dot.addEventListener("click", function () {
      showSlide(index);
      restartTimer();
    });
    heroDotsBox.appendChild(dot);
  });

  showSlide(0);
  startTimer();
}

// Shows one slide and hides the others
function showSlide(index) {
  const images = document.querySelectorAll(".hero-image");
  const dots = document.querySelectorAll(".hero-dot");

  // go around: after the last slide, show the first one again
  if (index < 0) index = images.length - 1;
  if (index >= images.length) index = 0;

  images.forEach(function (image) {
    image.classList.remove("active");
  });
  dots.forEach(function (dot) {
    dot.classList.remove("active");
  });

  images[index].classList.add("active");
  dots[index].classList.add("active");
  currentSlide = index;
}

// Change the slide automatically every 6 seconds
// (skipped if the visitor asked their system for less motion)
function startTimer() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  slideTimer = setInterval(function () {
    showSlide(currentSlide + 1);
  }, 6000);
}

function restartTimer() {
  clearInterval(slideTimer);
  startTimer();
}

// Arrow buttons
document.getElementById("heroPrev").addEventListener("click", function () {
  showSlide(currentSlide - 1);
  restartTimer();
});

document.getElementById("heroNext").addEventListener("click", function () {
  showSlide(currentSlide + 1);
  restartTimer();
});

buildHeroSlider();


// ---------- 2. POPULAR GAMES ----------
const popularRow = document.getElementById("popularRow");

// the first 5 games in data.js are the most popular ones
const popularGames = games.slice(0, 5);

popularRow.innerHTML = popularGames.map(function (game) {
  return createGameCard(game, getPoster(game));
}).join("");


// ---------- 3. FEATURED CATEGORIES ----------
const categoryRow = document.getElementById("categoryRow");

// show the first 6 categories from data.js
const featuredCategories = categories.slice(0, 6);

categoryRow.innerHTML = featuredCategories.map(function (category) {
  const game = findGameById(category.gameId);

  return `
    <a href="games.html?genre=${category.name}" class="category-tile">
      <img src="${getHeader(game)}" alt="" loading="lazy">
      <div class="category-label">
        <i class="${category.icon}"></i>
        <span>${category.name}</span>
      </div>
    </a>
  `;
}).join("");
