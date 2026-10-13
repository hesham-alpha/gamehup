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

function showWishlist() {
  const wishlistList = document.getElementById("wishlistList");
  const wishlistIds = getWishlist();

  document.getElementById("statWishlist").textContent = wishlistIds.length;
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
    return game ? createListItem(game, formatPrice(game.price)) : "";
  }).join("");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

function setupProfileLinks() {
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
}

authReady.then(function () {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace("login.html?next=profile.html");
    return;
  }

  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileAvatar").textContent = user.name.trim().charAt(0).toUpperCase();
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("memberSince").textContent = "Member since " + user.joined;

  document.getElementById("statPlayed").textContent = "0";
  document.getElementById("statReviews").textContent = "0";
  document.getElementById("statRating").textContent = "—";
  document.getElementById("playedList").innerHTML = '<p class="empty-text">You have not added any recently played games yet.</p>';

  showWishlist();
  setupProfileLinks();
});

document.addEventListener("wishlist:updated", showWishlist);
