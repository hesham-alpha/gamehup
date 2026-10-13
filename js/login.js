const loginForm = document.getElementById("loginForm");
const nameInput = document.getElementById("name");
const nameField = document.getElementById("nameField");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberBox = document.getElementById("remember");
const formMessage = document.getElementById("formMessage");
const passwordToggle = document.getElementById("passwordToggle");
const submitButton = document.getElementById("submitButton");
const modeToggle = document.getElementById("modeToggle");
const modePrompt = document.getElementById("modePrompt");
const formTitle = document.getElementById("formTitle");
const formSubtitle = document.getElementById("formSubtitle");

let isRegistering = new URLSearchParams(window.location.search).get("mode") === "register";

function showMessage(text) {
  formMessage.textContent = text;
  formMessage.classList.add("show");
}

function hideMessage() {
  formMessage.textContent = "";
  formMessage.classList.remove("show");
}

function setMode(registering) {
  isRegistering = registering;
  nameField.hidden = !registering;
  nameInput.required = registering;
  passwordInput.autocomplete = registering ? "new-password" : "current-password";
  passwordInput.placeholder = registering ? "At least 8 characters" : "Enter your password";
  formTitle.textContent = registering ? "Create Your Account" : "Welcome Back";
  formSubtitle.textContent = registering ? "Create an account to save your wishlist" : "Sign in to your account";
  submitButton.textContent = registering ? "Create Account" : "Sign In";
  modePrompt.textContent = registering ? "Already have an account?" : "Don't have an account?";
  modeToggle.textContent = registering ? "Sign in" : "Sign up";
  modeToggle.href = registering ? "#login" : "#register";
  hideMessage();
}

function getNextPage() {
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next) return "profile.html";

  try {
    const destination = new URL(next, window.location.href);
    const allowedPages = new Set(["index.html", "games.html", "game.html", "profile.html", "search.html"]);
    const page = destination.pathname.slice(1);
    if (destination.origin !== window.location.origin || !allowedPages.has(page)) return "profile.html";
    return page + destination.search + destination.hash;
  } catch {
    return "profile.html";
  }
}

passwordToggle.addEventListener("click", function () {
  const showPassword = passwordInput.type === "password";
  passwordInput.type = showPassword ? "text" : "password";
  passwordToggle.innerHTML = showPassword
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
  passwordToggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
});

modeToggle.addEventListener("click", function (event) {
  event.preventDefault();
  setMode(!isRegistering);
});

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  hideMessage();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (isRegistering && (name.length < 2 || name.length > 60)) {
    showMessage("Your name must be between 2 and 60 characters.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    showMessage("Enter a valid email address.");
    return;
  }
  if (password.length < 8 || password.length > 128) {
    showMessage("Your password must be between 8 and 128 characters.");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = isRegistering ? "Creating account..." : "Signing in...";

  try {
    await authReady;
    await apiRequest(isRegistering ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: {
        name,
        email,
        password,
        remember: rememberBox.checked
      }
    });
    window.location.replace(getNextPage());
  } catch (error) {
    showMessage(error.message || "Could not connect to GameHub. Start the server and try again.");
    submitButton.disabled = false;
    submitButton.textContent = isRegistering ? "Create Account" : "Sign In";
  }
});

setMode(isRegistering);
authReady.then(function () {
  if (getCurrentUser()) window.location.replace(getNextPage());
});
