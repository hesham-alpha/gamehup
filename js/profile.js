// ============================================================
// profile.js - code for the profile page (profile.html)
// ============================================================

const user = getCurrentUser();


// ---------- 1. SAMPLE PROFILE DATA ----------
// These numbers and games are sample data for the demo.
// Replace them later when the site has a real database.
const sampleStats = {
  gamesPlayed: 24,
  reviews: 8,
  avgRating: 4.7
};

const recentlyPlayed = [
  { gameId: 1, hours: "120 hours played", lastPlayed: "Last played 2 days ago" },
  { gameId: 2, hours: "85 hours played",  lastPlayed: "Last played 5 days ago" },
  { gameId: 3, hours: "40 hours played",  lastPlayed: "Last played last week" }
];


// ---------- 2. NAME + AVATAR ----------
function showUserInfo() {
  const name = user ? user.name : "Guest Player";

  document.getElementById("profileName").textContent = name;
  document.getElementById("profileAvatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("memberSince").textContent = user
    ? "Member since " + user.joined
    : "Sign in to save your profile";
}


// ---------- 3. STATS ----------
function showStats() {
  document.getElementById("statPlayed").textContent = sampleStats.gamesPlayed;
  document.getElementById("statWishlist").textContent = getWishlist().length;   // real data
  document.getElementById("statReviews").textContent = sampleStats.reviews;
  document.getElementById("statRating").textContent = sampleStats.avgRating;
}


// ---------- 4. LISTS ----------

// One row in a list: picture, title, small text and an arrow
function createListItem(game, smallText) {
  return `
    <a href="game.html?id=${game.id}" class="played-item">
      <img src="${getHeader(game)}" alt="${game.title}" loading="lazy">
      <div class="played-item-info">
        <h4>${game.title}</h4>
        <p>${smallText}</p>
      </div>
      <i class="fa-solid fa-chevron-right"></i>
    </a>
  `;
}

function showRecentlyPlayed() {
  document.getElementById("playedList").innerHTML = recentlyPlayed.map(function (item) {
    const game = findGameById(item.gameId);
    return createListItem(game, item.hours + ", " + item.lastPlayed.toLowerCase());
  }).join("");
}

function showWishlist() {
  const wishlistList = document.getElementById("wishlistList");
  const wishlistIds = getWishlist();

  if (wishlistIds.length === 0) {
    wishlistList.innerHTML = `
      <p class="empty-text">
        Your wishlist is empty. <a href="games.html" class="text-link">Browse games</a> and add some.
      </p>
    `;
    return;
  }

  wishlistList.innerHTML = wishlistIds.map(function (id) {
    const game = findGameById(id);
    return createListItem(game, formatPrice(game.price));
  }).join("");
}


// ---------- 5. SIDEBAR LINKS ----------
// "Wishlist" and "Reviews" in the sidebar open the matching tab
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

document.getElementById("sidebarWishlist").addEventListener("click", function (event) {
  event.preventDefault();
  openTab("wishlist");
  closeSidebar();
});

document.getElementById("sidebarReviews").addEventListener("click", function (event) {
  event.preventDefault();
  openTab("reviews");
  closeSidebar();
});

document.getElementById("logoutLink").addEventListener("click", function (event) {
  event.preventDefault();
  logout();
});


// ---------- 6. START ----------
showUserInfo();
showStats();
showRecentlyPlayed();
showWishlist();
