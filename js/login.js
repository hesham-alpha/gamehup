// ============================================================
// login.js - code for the login page (login.html)
// This is a front-end demo only: there is no real server,
// so any valid-looking email and password will sign you in.
// ============================================================

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberBox = document.getElementById("remember");
const formMessage = document.getElementById("formMessage");
const passwordToggle = document.getElementById("passwordToggle");
const socialButtons = document.querySelectorAll(".social-btn");


// ---------- 1. SHOW / HIDE PASSWORD ----------
passwordToggle.addEventListener("click", function () {
  const isHidden = passwordInput.type === "password";

  // switch between dots and readable text
  passwordInput.type = isHidden ? "text" : "password";

  passwordToggle.innerHTML = isHidden
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
  passwordToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});


// ---------- 2. ERROR MESSAGE ----------
function showMessage(text) {
  formMessage.textContent = text;
  formMessage.classList.add("show");
}

function hideMessage() {
  formMessage.classList.remove("show");
}


// ---------- 3. SIGN IN ----------
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the page from reloading
  hideMessage();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // check the fields
  if (!email.includes("@") || !email.includes(".")) {
    showMessage("Enter a valid email address, for example you@example.com.");
    return;
  }

  if (password.length < 6) {
    showMessage("Your password must have at least 6 characters.");
    return;
  }

  // the name is the part of the email before the @, with a capital first letter
  const emailName = email.split("@")[0];
  const name = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const user = {
    name: name,
    email: email,
    joined: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
  };

  // "Remember me" ticked -> keep the user after closing the browser
  // not ticked           -> forget the user when the browser closes
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);

  const storage = rememberBox.checked ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));

  window.location.href = "profile.html";
});


// ---------- 4. SOCIAL BUTTONS ----------
// They are only for the design, so they just explain that
socialButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    alert("Social sign in is not connected in this demo. Use your email and password instead.");
  });
});
