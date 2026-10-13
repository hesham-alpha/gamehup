// ============================================================
// main.js - shared code loaded on every page
// ============================================================

document.addEventListener("error", function (event) {
  const image = event.target;
  if (image.tagName === "IMG" && !image.dataset.failed) {
    image.dataset.failed = "true";
    image.src = "images/placeholder.svg";
  }
}, true);


// ---------- ACCOUNT AND WISHLIST ----------
const supabaseClient = window.gameHubSupabase;
let currentUser = null;
let currentWishlist = [];

function requireSupabase() {
  if (!supabaseClient) {
    throw new Error("GameHub could not connect to Supabase. Check the Supabase client script and project settings.");
  }
  return supabaseClient;
}

function normalizeUser(user) {
  if (!user) return null;
  const name = user.user_metadata && typeof user.user_metadata.name === "string"
    ? user.user_metadata.name.trim()
    : "";
  return {
    id: user.id,
    name: name || (user.email ? user.email.split("@")[0] : "Player"),
    email: user.email || "",
    joined: new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
  };
}

async function refreshWishlist() {
  if (!currentUser) {
    currentWishlist = [];
    return;
  }
  const { data, error } = await requireSupabase()
    .from("wishlist")
    .select("game_id")
    .order("created_at", { ascending: false });
  if (error) throw error;
  currentWishlist = data.map(function (row) { return Number(row.game_id); });
}

async function loadAccountState() {
  try {
    const { data, error } = await requireSupabase().auth.getSession();
    if (error) throw error;
    currentUser = normalizeUser(data.session && data.session.user);
    if (currentUser) {
      try {
        await refreshWishlist();
      } catch (wishlistError) {
        currentWishlist = [];
        console.warn("Could not load the wishlist. Make sure supabase/schema.sql has been run.", wishlistError.message);
      }
    }
  } catch (error) {
    currentUser = null;
    currentWishlist = [];
    console.warn(error.message || "Could not load the GameHub account.");
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
  const page = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
  const next = page + window.location.search + window.location.hash;
  return "login.html?next=" + encodeURIComponent(next);
}

async function toggleWishlist(gameId) {
  await authReady;
  if (!currentUser) {
    window.location.href = loginUrlForCurrentPage();
    return false;
  }

  const id = Number(gameId);
  let result;
  if (isInWishlist(id)) {
    result = await requireSupabase().from("wishlist").delete()
      .eq("user_id", currentUser.id)
      .eq("game_id", id);
  } else {
    result = await requireSupabase().from("wishlist").upsert(
      { user_id: currentUser.id, game_id: id },
      { onConflict: "user_id,game_id", ignoreDuplicates: true }
    );
  }
  if (result.error) throw result.error;
  await refreshWishlist();
  document.dispatchEvent(new CustomEvent("wishlist:updated", { detail: getWishlist() }));
  return true;
}

async function logout() {
  try {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.warn(error.message || "Could not sign out.");
  } finally {
    currentUser = null;
    currentWishlist = [];
    window.location.href = "login.html";
  }
}


// ---------- SMALL HTML BUILDERS ----------
function createTags(tags) {
  return tags.map(function (tag) {
    return `<span class="tag">${tag}</span>`;
  }).join("");
}

function createPlatformIcons(platforms) {
  return platforms.map(function (platform) {
    return `<i class="${platformIcons[platform]}" title="${platform}"></i>`;
  }).join("");
}

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


// ---------- MOBILE MENU ----------
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
    } else if (navbarLinks) {
      navbarLinks.classList.toggle("open");
    }
  });
  if (overlay && sidebar) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    });
  }
}


// ---------- ACCOUNT AVATARS ----------
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


// ---------- TABS ----------
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

setupMobileMenu();
setupTabs();
