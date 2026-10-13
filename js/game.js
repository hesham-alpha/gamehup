// ============================================================
// game.js - code for the game details page (game.html)
// ============================================================

// ---------- 1. FIND THE GAME ----------
// The link looks like game.html?id=1, so we read the id from it
const urlParams = new URLSearchParams(window.location.search);
const gameId = Number(urlParams.get("id"));
const game = findGameById(gameId);

const wishlistButton = document.getElementById("wishlistBtn");


// ---------- 2. FILL THE PAGE ----------
function showGame() {
  document.title = game.title + " - GameHub";

  // Pictures
  const banner = document.getElementById("gameBanner");
  banner.src = getBanner(game);
  banner.alt = game.title;

  const cover = document.getElementById("gameCover");
  cover.src = getPoster(game);
  cover.alt = game.title + " cover";

  // Title, rating, tags, price
  document.getElementById("gameTitle").textContent = game.title;
  document.getElementById("gameRating").textContent = game.rating;
  document.getElementById("gameReviews").textContent = "(" + game.reviews + " reviews)";
  document.getElementById("gameTags").innerHTML = createTags(game.tags);
  document.getElementById("gamePrice").textContent = formatPrice(game.price);

  // Platforms: icon + name
  document.getElementById("gamePlatforms").innerHTML = game.platforms.map(function (platform) {
    return `<span><i class="${platformIcons[platform]}"></i>${platform}</span>`;
  }).join("");

  // About section
  document.getElementById("gameDescription").textContent = game.description;
  document.getElementById("gameRelease").textContent = game.releaseDate;
  document.getElementById("gameDeveloper").textContent = game.developer;
  document.getElementById("gamePublisher").textContent = game.publisher;

  // Links to Steam and YouTube
  const storeLink = getStoreLink(game);
  const youtubeLink = "https://www.youtube.com/results?search_query=" + encodeURIComponent(game.title);

  document.getElementById("buyBtn").href = storeLink;
  document.getElementById("requirementsLink").href = storeLink;
  document.getElementById("reviewsLink").href = storeLink + "#app_reviews_hash";
  document.getElementById("videosLink").href = youtubeLink;
  document.getElementById("scoreBig").textContent = game.rating;

  showVideos(youtubeLink);
  showScreenshots();
  setupWishlistButton();
}


// ---------- 3. VIDEO THUMBNAILS ----------
// Two pictures with a play button. They open a YouTube search.
function showVideos(youtubeLink) {
  const videos = [
    { image: getCapsule(game), link: youtubeLink + "+trailer" },
    { image: getHeader(game),  link: youtubeLink + "+gameplay" }
  ];

  document.getElementById("gameVideos").innerHTML = videos.map(function (video) {
    return `
      <a href="${video.link}" class="video-thumb" target="_blank" rel="noopener" aria-label="Watch on YouTube">
        <img src="${video.image}" alt="" loading="lazy">
        <span class="play-icon"><i class="fa-solid fa-play"></i></span>
      </a>
    `;
  }).join("");
}


// ---------- 4. SCREENSHOTS TAB ----------
// These are the game's official artwork from Steam.
// To use real in-game screenshots, put their image links in this list.
function showScreenshots() {
  const pictures = [getBanner(game), getCapsule(game), getHeader(game)];

  document.getElementById("screenshotGrid").innerHTML = pictures.map(function (picture) {
    return `<img src="${picture}" alt="${game.title} artwork" loading="lazy">`;
  }).join("");
}


// ---------- 5. WISHLIST BUTTON ----------

// Update the button text and heart icon to match the saved wishlist
function updateWishlistButton() {
  const icon = wishlistButton.querySelector("i");
  const text = wishlistButton.querySelector("span");

  if (isInWishlist(game.id)) {
    icon.className = "fa-solid fa-heart";
    text.textContent = "In Your Wishlist";
  } else {
    icon.className = "fa-regular fa-heart";
    text.textContent = "Add to Wishlist";
  }
}

async function setupWishlistButton() {
  await authReady;
  updateWishlistButton();

  wishlistButton.addEventListener("click", async function () {
    const message = document.getElementById("wishlistMessage");
    wishlistButton.disabled = true;
    message.textContent = "";
    try {
      const updated = await toggleWishlist(game.id);
      if (updated) updateWishlistButton();
    } catch (error) {
      message.textContent = error.message || "Could not update your wishlist. Try again.";
    } finally {
      wishlistButton.disabled = false;
    }
  });
}


// ---------- 6. START ----------
// No game with this id -> show the "not found" message instead
if (!game) {
  document.getElementById("gameContent").hidden = true;
  document.getElementById("notFound").hidden = false;
} else {
  showGame();
}
