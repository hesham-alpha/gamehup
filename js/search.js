// ============================================================
// search.js - code for the search results page (search.html)
// ============================================================

const searchInputs = document.querySelectorAll(".search-box input");
const resultsGrid = document.getElementById("resultsGrid");
const resultsInfo = document.getElementById("resultsInfo");
const filterBoxes = document.querySelectorAll(".filters input");


// ---------- 1. READ THE SEARCH WORD ----------
// The link looks like search.html?q=rpg, so the search word is "rpg"
const urlParams = new URLSearchParams(window.location.search);
const searchWord = (urlParams.get("q") || "").trim();

// keep the word inside the search boxes (the navbar one and the phone one)
searchInputs.forEach(function (input) {
  input.value = searchWord;
});


// ---------- 2. FILTERS ----------

// Returns the values of the ticked checkboxes, for example ["RPG", "Action"]
function getCheckedValues(name) {
  const checkedBoxes = document.querySelectorAll('.filters input[name="' + name + '"]:checked');

  return Array.from(checkedBoxes).map(function (box) {
    return box.value;
  });
}

// Returns the games that match the search word AND the ticked filters.
// If nothing is ticked in a group, that group does not filter anything.
function searchGames() {
  const text = searchWord.toLowerCase();
  const genreList = getCheckedValues("genre");
  const platformList = getCheckedValues("platform");
  const priceList = getCheckedValues("price");

  return games.filter(function (game) {

    // 1. Does the search word appear in the title, studio, genres or tags?
    const searchableText = [game.title, game.developer, game.publisher]
      .concat(game.genres, game.tags)
      .join(" ")
      .toLowerCase();
    const textMatch = searchableText.includes(text);

    // 2. Genre
    const genreMatch = genreList.length === 0 || game.genres.some(function (genre) {
      return genreList.includes(genre);
    });

    // 3. Platform
    const platformMatch = platformList.length === 0 || game.platforms.some(function (platform) {
      return platformList.includes(platform);
    });

    // 4. Price
    const priceType = game.price === 0 ? "free" : "paid";
    const priceMatch = priceList.length === 0 || priceList.includes(priceType);

    return textMatch && genreMatch && platformMatch && priceMatch;
  });
}


// ---------- 3. SHOW THE RESULTS ----------

// One result card: cover on the left, details on the right
function createResultCard(game) {
  return `
    <a href="game.html?id=${game.id}" class="result-card">
      <img src="${getPoster(game)}" alt="${game.title}" loading="lazy">
      <div class="result-info">
        <h3>${game.title}</h3>
        <div class="rating"><i class="fa-solid fa-star"></i> ${game.rating}</div>
        <div class="tag-list">${createTags(game.tags.slice(0, 2))}</div>
        <div class="result-bottom">
          <div class="result-platforms">${createPlatformIcons(game.platforms)}</div>
          <span class="result-price">${formatPrice(game.price)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderResults() {
  const results = searchGames();

  // text under the title (textContent keeps the search word safe)
  const countText = results.length + (results.length === 1 ? " game found" : " games found");
  resultsInfo.textContent = searchWord
    ? 'Showing results for "' + searchWord + '" - ' + countText
    : "Showing all games - " + countText;

  if (results.length === 0) {
    resultsGrid.innerHTML = '<p class="empty-message">No games match your search. Try removing a filter.</p>';
    return;
  }

  resultsGrid.innerHTML = results.map(createResultCard).join("");
}


// ---------- 4. EVENTS ----------
// Update the results every time a checkbox is ticked or unticked
filterBoxes.forEach(function (box) {
  box.addEventListener("change", renderResults);
});


// ---------- 5. START ----------
renderResults();
