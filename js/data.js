// ============================================================
// data.js - all the game data for the website lives here
// To add a new game: copy one block, change the values, done.
// ============================================================


// ---------- 1. IMAGES ----------

// Steam hosts the official artwork of every game.
// We only need the game's Steam "appId" to build all the image links.
// (If the images ever stop loading, this is the only line to change.)
const STEAM_IMAGES = "https://cdn.akamai.steamstatic.com/steam/apps/";

// Icons used for each platform (Font Awesome)
const platformIcons = {
  PC: "fa-brands fa-windows",
  PlayStation: "fa-brands fa-playstation",
  Xbox: "fa-brands fa-xbox"
};


// ---------- 2. GAMES ----------
// NOTE: ratings, review counts and prices are sample values for the demo.
// The games are listed from most popular to least popular.

const games = [
  {
    id: 1,
    title: "Elden Ring",
    appId: 1245620,
    rating: 9.5,
    reviews: "12k",
    price: 59.99,
    genres: ["Action", "RPG"],
    tags: ["Action RPG", "Open World", "Fantasy"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Feb 25, 2022",
    developer: "FromSoftware",
    publisher: "Bandai Namco",
    description: "Rise as a Tarnished and explore the vast Lands Between in an open-world action RPG made by FromSoftware with story input from George R. R. Martin. Hunt for powerful weapons, face towering bosses and shape your own build."
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    appId: 1091500,
    rating: 9.0,
    reviews: "9k",
    price: 59.99,
    genres: ["RPG", "Action"],
    tags: ["RPG", "Open World", "Sci-Fi"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Dec 10, 2020",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT",
    description: "Step into Night City, a dangerous megalopolis obsessed with power, glamour and body modification. Play as V, a mercenary chasing a one-of-a-kind implant that holds the key to immortality."
  },
  {
    id: 3,
    title: "God of War Ragnarök",
    appId: 2322010,
    rating: 9.3,
    reviews: "8k",
    price: 59.99,
    genres: ["Action", "Adventure"],
    tags: ["Action", "Adventure", "Mythology"],
    platforms: ["PC", "PlayStation"],
    releaseDate: "Nov 9, 2022",
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    description: "Kratos and Atreus journey across the Nine Realms as Fimbulwinter tightens its grip and Ragnarök draws near. A cinematic, story-driven action adventure with brutal close combat."
  },
  {
    id: 4,
    title: "Red Dead Redemption 2",
    appId: 1174180,
    rating: 9.7,
    reviews: "15k",
    price: 59.99,
    genres: ["Adventure", "Action"],
    tags: ["Adventure", "Open World", "Western"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Oct 26, 2018",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    description: "America, 1899. Outlaw Arthur Morgan and the Van der Linde gang run from the law across a huge open world, while the Wild West fades around them."
  },
  {
    id: 5,
    title: "Hogwarts Legacy",
    appId: 990080,
    rating: 8.8,
    reviews: "7k",
    price: 59.99,
    genres: ["RPG", "Adventure"],
    tags: ["Action RPG", "Open World", "Fantasy"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Feb 10, 2023",
    developer: "Avalanche Software",
    publisher: "Warner Bros. Games",
    description: "Live your own wizarding-world adventure as a student at Hogwarts in the 1800s. Learn spells, brew potions, tame magical beasts and uncover a secret that threatens the wizarding world."
  },
  {
    id: 6,
    title: "The Witcher 3",
    appId: 292030,
    rating: 9.6,
    reviews: "14k",
    price: 39.99,
    genres: ["RPG", "Adventure"],
    tags: ["RPG", "Open World", "Fantasy"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "May 19, 2015",
    developer: "CD PROJEKT RED",
    publisher: "CD PROJEKT",
    description: "Play as Geralt of Rivia, a monster hunter searching for his adopted daughter in a war-torn open world. Every choice you make changes the story around you."
  },
  {
    id: 7,
    title: "Forza Horizon 5",
    appId: 1551360,
    rating: 9.2,
    reviews: "6k",
    price: 59.99,
    genres: ["Racing"],
    tags: ["Racing", "Open World", "Driving"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Nov 9, 2021",
    developer: "Playground Games",
    publisher: "Xbox Game Studios",
    description: "Drive through a vibrant, ever-changing recreation of Mexico in this open-world racing festival. Hundreds of cars, dozens of events and plenty of room to explore at full speed."
  },
  {
    id: 8,
    title: "Call of Duty: Modern Warfare II",
    appId: 1938090,
    rating: 8.0,
    reviews: "5k",
    price: 69.99,
    genres: ["Action"],
    tags: ["Shooter", "Multiplayer", "Action"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Oct 28, 2022",
    developer: "Infinity Ward",
    publisher: "Activision",
    description: "Join Task Force 141 in a modern-day military campaign, then take the fight online with fast multiplayer modes and cooperative Special Ops missions."
  },
  {
    id: 9,
    title: "Baldur's Gate 3",
    appId: 1086940,
    rating: 9.7,
    reviews: "13k",
    price: 59.99,
    genres: ["RPG", "Strategy"],
    tags: ["RPG", "Turn-Based", "Co-op"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Aug 3, 2023",
    developer: "Larian Studios",
    publisher: "Larian Studios",
    description: "Gather your party and return to the Forgotten Realms in a turn-based RPG built on Dungeons & Dragons rules. Play alone or with friends, and decide how your story ends."
  },
  {
    id: 10,
    title: "Skyrim Special Edition",
    appId: 489830,
    rating: 9.4,
    reviews: "11k",
    price: 39.99,
    genres: ["RPG", "Adventure"],
    tags: ["RPG", "Open World", "Fantasy"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Oct 28, 2016",
    developer: "Bethesda Game Studios",
    publisher: "Bethesda Softworks",
    description: "Become the Dragonborn and explore the snowy province of Skyrim in this remastered classic. Fight dragons, join factions and play the way you want in an enormous world."
  },
  {
    id: 11,
    title: "Dragon Age: Inquisition",
    appId: 1222690,
    rating: 8.5,
    reviews: "4k",
    price: 19.99,
    genres: ["RPG"],
    tags: ["RPG", "Fantasy", "Story Rich"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Nov 18, 2014",
    developer: "BioWare",
    publisher: "Electronic Arts",
    description: "Become the Inquisitor and close the Breach, a rift in the sky that unleashes demons across Thedas. Lead an army, build your party and shape the fate of the world."
  },
  {
    id: 12,
    title: "Mass Effect Legendary Edition",
    appId: 1328670,
    rating: 9.1,
    reviews: "5k",
    price: 59.99,
    genres: ["RPG", "Action"],
    tags: ["RPG", "Sci-Fi", "Story Rich"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "May 14, 2021",
    developer: "BioWare",
    publisher: "Electronic Arts",
    description: "Command Shepard and the crew of the Normandy in the full Mass Effect trilogy, remastered in one collection. Fight to save the galaxy from the Reapers."
  },
  {
    id: 13,
    title: "Resident Evil 4",
    appId: 2050650,
    rating: 9.3,
    reviews: "6k",
    price: 59.99,
    genres: ["Horror", "Action"],
    tags: ["Horror", "Survival", "Action"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Mar 24, 2023",
    developer: "Capcom",
    publisher: "Capcom",
    description: "Leon S. Kennedy travels to a remote European village to rescue the president's daughter. A modern remake of the survival horror classic with tense combat and an unsettling atmosphere."
  },
  {
    id: 14,
    title: "Civilization VI",
    appId: 289070,
    rating: 8.8,
    reviews: "7k",
    price: 59.99,
    genres: ["Strategy"],
    tags: ["Strategy", "Turn-Based", "Historical"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Oct 21, 2016",
    developer: "Firaxis Games",
    publisher: "2K",
    description: "Build an empire to stand the test of time. Found cities, grow your culture, wage war or win through diplomacy in this turn-based strategy game."
  },
  {
    id: 15,
    title: "EA Sports FC 24",
    appId: 2195250,
    rating: 7.5,
    reviews: "3k",
    price: 69.99,
    genres: ["Sports"],
    tags: ["Sports", "Football", "Multiplayer"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "Sep 29, 2023",
    developer: "EA Vancouver",
    publisher: "Electronic Arts",
    description: "Play football with licensed clubs, leagues and players. Build your Ultimate Team, take on career mode or jump into online matches with friends."
  },
  {
    id: 16,
    title: "Microsoft Flight Simulator",
    appId: 1250410,
    rating: 8.4,
    reviews: "4k",
    price: 59.99,
    genres: ["Simulation"],
    tags: ["Simulation", "Flight", "Open World"],
    platforms: ["PC", "Xbox"],
    releaseDate: "Aug 18, 2020",
    developer: "Asobo Studio",
    publisher: "Xbox Game Studios",
    description: "Fly anywhere on Earth in a detailed simulation of the whole planet, with live weather and thousands of airports. Pilot everything from light planes to airliners."
  },
  {
    id: 17,
    title: "Dota 2",
    appId: 570,
    rating: 8.6,
    reviews: "10k",
    price: 0,
    genres: ["Strategy"],
    tags: ["Strategy", "MOBA", "Multiplayer"],
    platforms: ["PC"],
    releaseDate: "Jul 9, 2013",
    developer: "Valve",
    publisher: "Valve",
    description: "Millions of players enter battle every day as one of over a hundred heroes. A free-to-play team strategy game with deep tactics and a huge competitive scene."
  },
  {
    id: 18,
    title: "Resident Evil Village",
    appId: 1196590,
    rating: 8.9,
    reviews: "5k",
    price: 39.99,
    genres: ["Horror", "Adventure"],
    tags: ["Horror", "Survival", "First-Person"],
    platforms: ["PC", "PlayStation", "Xbox"],
    releaseDate: "May 7, 2021",
    developer: "Capcom",
    publisher: "Capcom",
    description: "Ethan Winters searches for his missing daughter in a mysterious village haunted by monsters. A first-person survival horror adventure packed with scares."
  }
];


// ---------- 3. CATEGORIES ----------
// "gameId" is the game whose picture is used on the category tile.
const categories = [
  { name: "Action",     icon: "fa-solid fa-burst",          gameId: 3 },
  { name: "RPG",        icon: "fa-solid fa-hat-wizard",     gameId: 9 },
  { name: "Adventure",  icon: "fa-solid fa-compass",        gameId: 4 },
  { name: "Racing",     icon: "fa-solid fa-flag-checkered", gameId: 7 },
  { name: "Sports",     icon: "fa-solid fa-futbol",         gameId: 15 },
  { name: "Strategy",   icon: "fa-solid fa-chess",          gameId: 14 },
  { name: "Simulation", icon: "fa-solid fa-plane",          gameId: 16 },
  { name: "Horror",     icon: "fa-solid fa-ghost",          gameId: 13 }
];


// ---------- 4. HELPER FUNCTIONS ----------

// Image links (all built from the game's Steam appId)
function getPoster(game)  { return STEAM_IMAGES + game.appId + "/library_600x900.jpg"; }  // tall cover
function getBanner(game)  { return STEAM_IMAGES + game.appId + "/library_hero.jpg"; }     // wide banner
function getHeader(game)  { return STEAM_IMAGES + game.appId + "/header.jpg"; }           // small wide image
function getCapsule(game) { return STEAM_IMAGES + game.appId + "/capsule_616x353.jpg"; }  // medium wide image

// Link to the game's page on Steam (used by the "Buy Now" button)
function getStoreLink(game) {
  return "https://store.steampowered.com/app/" + game.appId;
}

// 59.99 -> "$59.99"   and   0 -> "Free"
function formatPrice(price) {
  return price === 0 ? "Free" : "$" + price.toFixed(2);
}

// Find one game using its id
function findGameById(id) {
  return games.find(function (game) {
    return game.id === id;
  });
}
