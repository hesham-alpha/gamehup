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


// ---------- 2. API + ACCOUNT STATE ----------
const API_BASE = window.GAMEHUB_API_BASE || "";
let currentUser = null;
let currentWishlist = [];

async function apiRequest(path, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  const request = { ...options, credentials: "same-origin", headers };
  if (options.body !== undefined && typeof options.body !== "string") {
    headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(API_BASE + path, request);
  } catch {
    throw new Error("GameHub can't reach its server. Start the Node server and try again.");
  }

  const data = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new Error(data.error || "The request could not be completed.");
  return data;
}

async function loadAccountState() {
  try {
    const result = await apiRequest("/api/auth/me");
    currentUser = result.user;
    if (currentUser) {
      const wishlist = await apiRequest("/api/wishlist");
      currentWishlist = wishlist.gameIds;
    } else {
      currentWishlist = [];
    }
  } catch (error) {
    currentUser = null;
    currentWishlist = [];
    console.warn(error.message);
  }
  setupAvatars();
}

const authReady = loadAccountState();

function getCurrentUser() {
  return currentUser;
}

function getWishlist() {
  return currentWishlist.slice();
}

function isInWishlist(gameId) {
  return currentWishlist.includes(Number(gameId));
}

function loginUrlForCurrentPage() {
  const next = window.location.pathname.slice(1) + window.location.search;
  return "login.html?next=" + encodeURIComponent(next || "profile.html");
}

async function toggleWishlist(gameId) {
  await authReady;
  if (!currentUser) {
    window.location.href = loginUrlForCurrentPage();
    return false;
  }

  const id = Number(gameId);
  const method = isInWishlist(id) ? "DELETE" : "PUT";
  const result = await apiRequest("/api/wishlist/" + encodeURIComponent(id), { method });
  currentWishlist = result.gameIds;
  document.dispatchEvent(new CustomEvent("wishlist:updated", { detail: getWishlist() }));
  return true;
}

async function logout() {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn(error.message);
  } finally {
    currentUser = null;
    currentWishlist = [];
    window.location.href = "login.html";
  }
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
// Logged in -> first letter of the name; signed out -> account icon
function setupAvatars() {
  const user = getCurrentUser();

  document.querySelectorAll(".avatar").forEach(function (avatar) {
    if (user) {
      avatar.textContent = user.name.trim().charAt(0).toUpperCase();
      avatar.href = "profile.html";
      avatar.setAttribute("aria-label", "Account: " + user.name);
      avatar.title = user.name;
    } else {
      avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
      avatar.href = "login.html";
      avatar.setAttribute("aria-label", "Sign in");
      avatar.removeAttribute("title");
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
setupTabs();
