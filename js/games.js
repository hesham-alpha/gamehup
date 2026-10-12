// ============================================================
// games.js - code for the games library page (games.html)
// ============================================================

const gamesGrid = document.getElementById("gamesGrid");
const pageTitle = document.getElementById("pageTitle");
const sidebarCategories = document.getElementById("sidebarCategories");
const allGamesLink = document.getElementById("allGamesLink");
const sortSelect = document.getElementById("sortSelect");
const platformButtons = document.querySelectorAll("#platformFilters .chip");


// ---------- 1. CURRENT FILTERS ----------
// These 3 variables describe what the visitor is looking at right now.

// The genre comes from the link, for example games.html?genre=RPG
const urlParams = new URLSearchParams(window.location.search);
let selectedGenre = urlParams.get("genre") || "All";

let selectedPlatform = "All";
let selectedSort = "popularity";


// ---------- 2. SIDEBAR CATEGORIES ----------
function buildSidebarCategories() {
  sidebarCategories.innerHTML = categories.map(function (category) {
    const activeClass = category.name === selectedGenre ? "active" : "";

    return `
      <a href="games.html?genre=${category.name}" class="${activeClass}">
        <i class="${category.icon}"></i> ${category.name}
      </a>
    `;
  }).join("");

  // when a category is selected, the "Games" link is no longer the active one
  if (selectedGenre !== "All") {
    allGamesLink.classList.remove("active");
  }
}


// ---------- 3. FILTER + SORT ----------
// Returns only the games that match the current filters, in the right order
function getFilteredGames() {
  const result = games.filter(function (game) {
    const genreMatch = selectedGenre === "All" || game.genres.includes(selectedGenre);
    const platformMatch = selectedPlatform === "All" || game.platforms.includes(selectedPlatform);

    return genreMatch && platformMatch;
  });

  // "popularity" keeps the original order from data.js
  if (selectedSort === "rating") {
    result.sort(function (a, b) {
      return b.rating - a.rating;
    });
  } else if (selectedSort === "name") {
    result.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (selectedSort === "price") {
    result.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  return result;
}


// ---------- 4. SHOW THE GAMES ----------
function renderGames() {
  const filteredGames = getFilteredGames();

  // page title: "All Games" or "RPG Games"
  pageTitle.textContent = selectedGenre === "All" ? "All Games" : selectedGenre + " Games";

  if (filteredGames.length === 0) {
    gamesGrid.innerHTML = '<p class="empty-message">No games found for this filter.</p>';
    return;
  }

  gamesGrid.innerHTML = filteredGames.map(function (game) {
    return createGameCard(game, getCapsule(game));
  }).join("");
}


// ---------- 5. EVENTS ----------

// Platform chips (All / PC / PlayStation / Xbox)
platformButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    platformButtons.forEach(function (other) {
      other.classList.remove("active");
    });
    button.classList.add("active");

    selectedPlatform = button.dataset.platform;
    renderGames();
  });
});

// Sort dropdown
sortSelect.addEventListener("change", function () {
  selectedSort = sortSelect.value;
  renderGames();
});


// ---------- 6. START ----------
buildSidebarCategories();
renderGames();
