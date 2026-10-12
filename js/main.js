// ============================================================
// main.js - code shared by every page
// (load it AFTER data.js and BEFORE the page's own js file)
// ============================================================


// ---------- 1. BROKEN IMAGE FALLBACK ----------
// If a game image cannot load (no internet, wrong link...),
// show our placeholder instead of a broken icon.
document.addEventListener("error", function (event) {
  const image = event.target;

  if (image.tagName === "IMG" && !image.dataset.failed) {
    image.dataset.failed = "true";   // so we never try twice
    image.src = "images/placeholder.svg";
  }
}, true);


// ---------- 2. SAVED DATA (user + wishlist) ----------
// The browser's storage keeps this data even after closing the page.
const USER_KEY = "gamehub_user";
const WISHLIST_KEY = "gamehub_wishlist";

// Returns the logged in user, or null if nobody is logged in
function getCurrentUser() {
  const saved = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

function logout() {
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.location.href = "login.html";
}

// Returns a list of game ids, for example [1, 4, 9]
function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
}

function isInWishlist(gameId) {
  return getWishlist().includes(gameId);
}

// Add the game if it is not in the wishlist, remove it if it is
function toggleWishlist(gameId) {
  let wishlist = getWishlist();

  if (wishlist.includes(gameId)) {
    wishlist = wishlist.filter(function (id) {
      return id !== gameId;
    });
  } else {
    wishlist.push(gameId);
  }

  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
}


// ---------- 3. SMALL HTML BUILDERS ----------

// ["RPG", "Open World"] -> <span class="tag">RPG</span> <span class="tag">Open World</span>
function createTags(tags) {
  return tags.map(function (tag) {
    return `<span class="tag">${tag}</span>`;
  }).join("");
}

// ["PC", "Xbox"] -> a Windows icon and an Xbox icon
function createPlatformIcons(platforms) {
  return platforms.map(function (platform) {
    return `<i class="${platformIcons[platform]}" title="${platform}"></i>`;
  }).join("");
}

// The game card used on the home page and the games page.
// "imageUrl" decides which picture is shown (tall cover or wide image).
function createGameCard(game, imageUrl) {
  return `
    <a href="game.html?id=${game.id}" class="game-card">
      <div class="game-card-image">
        <img src="${imageUrl}" alt="${game.title}" loading="lazy">
      </div>
      <div class="game-card-body">
        <h3 class="game-card-title">${game.title}</h3>
        <div class="rating"><i class="fa-solid fa-star"></i> ${game.rating}</div>
        <div class="tag-list">${createTags(game.tags.slice(0, 2))}</div>
      </div>
    </a>
  `;
}


// ---------- 4. MOBILE MENU ----------
// On phones the menu button opens the sidebar (if the page has one)
// or the navbar links (if the page has a navbar).
function setupMobileMenu() {
  const menuButton = document.getElementById("menuBtn");
  const navbarLinks = document.getElementById("navbarLinks");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!menuButton) return;

  menuButton.addEventListener("click", function () {
    if (sidebar) {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    } else {
      navbarLinks.classList.toggle("open");
    }
  });

  // tapping the dark area closes the sidebar
  if (overlay) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  }
}


// ---------- 5. AVATAR (top right circle) ----------
// Logged in  -> first letter of the name, links to the profile page
// Logged out -> user icon, links to the login page
function setupAvatars() {
  const user = getCurrentUser();

  document.querySelectorAll(".avatar").forEach(function (avatar) {
    if (user) {
      avatar.textContent = user.name.charAt(0).toUpperCase();
      avatar.href = "profile.html";
    } else {
      avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
      avatar.href = "login.html";
    }
  });
}


// ---------- 6. TABS ----------
// Used on the game details page and the profile page.
// A button with data-tab="info" opens the panel with id="tab-info".
function openTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(function (button) {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });

  document.querySelectorAll(".tab-panel").forEach(function (panel) {
    panel.classList.toggle("active", panel.id === "tab-" + tabName);
  });
}

function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      openTab(button.dataset.tab);
    });
  });
}


// ---------- 7. START ----------
setupMobileMenu();
setupAvatars();
setupTabs();
