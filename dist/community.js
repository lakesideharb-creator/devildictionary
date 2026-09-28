const $ = (id) => document.getElementById(id);
let cardUrl = null;
let current = null,
  page = 0,
  first = null,
  grid = [],
  size = 0,
  path = [];
async function api(action, data, query = "") {
  const response = await fetch(
    `/api/community?action=${action}${query}`,
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : {},
  );
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "Please try again.");
  return result;
}
const notice = (message) => {
  $("notice").textContent = message;
};
function tile(entry) {
  const article = document.createElement("article");
  article.className = "entry";
  const kicker = document.createElement("small");
  kicker.textContent = "COMMUNITY ENTRY";
  const title = document.createElement("h2");
  title.textContent = entry.word;
  const by = document.createElement("small");
  by.textContent = `By ${entry.author}`;
  const button = document.createElement("button");
  button.textContent = "FIND IT. FACE IT. ↗";
  button.onclick = () => play(entry);
  article.append(kicker, title, by, button);
  return article;
}
async function list() {
  try {
    const data = await api("entries", null, `&page=${page}`);
    data.entries.forEach((entry) => $("collection").append(tile(entry)));
    $("more").hidden = !data.hasMore;
    if (page === 0 && !data.entries.length)
      $("collection").textContent =
        "The first page is still unwritten. Send the editor your definition below.";
  } catch (error) {
    if (page > 0) page--;
    notice(error.message);
  }
}
function play(entry) {
  current = entry;
  $("card-preview").hidden = true;
  first = null;
  $("play").hidden = false;
  $("reveal").hidden = true;
  $("play-word").textContent = entry.word;
  $("play-word").focus();
  $("puzzle-status").textContent = "";
  size = Math.max(5, entry.word.length);
  grid = Array.from({ length: size * size }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26)),
  );
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [0, -1],
    [-1, 0],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];
  const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
  const range = (d) =>
    d === 1
      ? Math.floor(Math.random() * (size - entry.word.length + 1))
      : d === -1
        ? entry.word.length -
          1 +
          Math.floor(Math.random() * (size - entry.word.length + 1))
        : Math.floor(Math.random() * size);
  const r = range(dr),
    c = range(dc);
  path = Array.from(entry.word, (_, i) => (r + i * dr) * size + c + i * dc);
  path.forEach((n, i) => (grid[n] = entry.word[i]));
  $("community-board").style.gridTemplateColumns = `repeat(${size},1fr)`;
  $("community-board").replaceChildren();
  grid.forEach((letter, index) => {
    const button = document.createElement("button");
    button.textContent = letter;
    button.setAttribute(
      "aria-label",
      `${letter}, row ${Math.floor(index / size) + 1}, column ${(index % size) + 1}`,
    );
    button.onclick = () => select(index);
    $("community-board").append(button);
  });
  history.replaceState(null, "", `?entry=${entry.id}#play`);
}
function select(index) {
  const cells = [...$("community-board").children];
  if (first === null) {
    first = index;
    cells.forEach((x) => x.classList.remove("selected"));
    cells[index].classList.add("selected");
    $("puzzle-status").textContent = "Now choose the last letter.";
    return;
  }
  const r1 = Math.floor(first / size),
    c1 = first % size,
    r2 = Math.floor(index / size),
    c2 = index % size;
  const count = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
  const straight =
    r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1);
  const route = Array.from(
    { length: count },
    (_, i) =>
      (r1 + i * Math.sign(r2 - r1)) * size + c1 + i * Math.sign(c2 - c1),
  );
  first = null;
  if (straight && route.map((i) => grid[i]).join("") === current.word) {
    route.forEach((i) => cells[i].classList.add("selected"));
    $("reveal").hidden = false;
    $("definition").textContent = `“${current.definition}”`;
    $("byline").textContent = `${current.pos} · By ${current.author}`;
    $("puzzle-status").textContent = "Found. Here is the uncomfortable part.";
  } else {
    $("puzzle-status").textContent =
      "Not quite. Choose a first letter and try again.";
    cells.forEach((x) => x.classList.remove("selected"));
  }
}
$("hint").onclick = () => {
  first = null;
  [...$("community-board").children].forEach((x, i) =>
    x.classList.toggle("selected", i === path[0]),
  );
  $("puzzle-status").textContent = "The first letter is marked.";
};
$("submission").onsubmit = async (event) => {
  event.preventDefault();
  const button = event.target.querySelector("button");
  button.disabled = true;
  const data = Object.fromEntries(new FormData(event.target));
  data.consent = data.consent === "on";
  try {
    const result = await api("submit", data);
    $("submission-status").textContent = result.message;
    event.target.reset();
  } catch (error) {
    $("submission-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
};
$("more").onclick = async () => {
  $("more").disabled = true;
  page++;
  await list();
  $("more").disabled = false;
};
$("copy").onclick = async () => {
  try {
    await navigator.clipboard.writeText(
      `${current.word}: ${current.definition}\n— ${current.author} · Community Edition\nhttps://devildictionary.com/community?entry=${current.id}`,
    );
    $("puzzle-status").textContent = "Copied. Ready for X.";
  } catch {
    $("puzzle-status").textContent =
      "Could not copy. You can copy this page’s link from your browser.";
  }
};
$("report").onclick = async () => {
  const reason = prompt(
    "Tell the editor what needs attention (5–500 characters):",
  );
  if (!reason) return;
  try {
    const result = await api("report", { id: current.id, reason });
    $("puzzle-status").textContent = result.message;
  } catch (error) {
    $("puzzle-status").textContent = error.message;
  }
};
$("save-card").onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4e7cb";
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = "#ad9169";
  ctx.lineWidth = 2;
  ctx.strokeRect(35, 35, 1010, 1010);
  ctx.strokeRect(45, 45, 990, 990);
  ctx.textAlign = "center";
  ctx.fillStyle = "#803b31";
  ctx.font = "18px Georgia";
  ctx.fillText("THE DEVIL’S DICTIONARY · COMMUNITY EDITION", 540, 145);
  let titleSize = 80;
  while (titleSize > 32) {
    ctx.font = `bold ${titleSize}px Georgia`;
    if (ctx.measureText(current.word).width < 900) break;
    titleSize -= 2;
  }
  ctx.fillText(current.word, 540, 285);
  ctx.font = "italic 25px Georgia";
  ctx.fillText(current.pos, 540, 345);
  let lines = [], fontSize = 58;
  const wrap = () => {
    const result = []; let line = "";
    for (const word of current.definition.split(/\s+/)) {
      if (ctx.measureText((line ? line + " " : "") + word).width > 840 && line) { result.push(line); line = ""; }
      if (ctx.measureText(word).width > 840) {
        for (const char of word) { if (ctx.measureText(line + char).width > 840) { result.push(line); line = ""; } line += char; }
      } else line += (line ? " " : "") + word;
    }
    if (line) result.push(line);
    return result;
  };
  do { ctx.font = `${fontSize}px Georgia`; lines = wrap(); if (lines.length * fontSize * 1.3 <= 390) break; fontSize -= 2; } while (fontSize >= 30);
  ctx.fillStyle = "#34271e";
  const lineHeight = fontSize * 1.3;
  const firstLine = 590 - (lines.length - 1) * lineHeight / 2;
  lines.forEach((value, i) => ctx.fillText(value, 540, firstLine + i * lineHeight));
  ctx.font = "italic 26px Georgia";
  ctx.fillText(`By ${current.author}`, 540, 900, 880);
  ctx.font = "22px Georgia";
  ctx.fillText("devildictionary.com", 540, 980);
  canvas.toBlob((blob) => {
    if (!blob) return;
    if (cardUrl) URL.revokeObjectURL(cardUrl);
    cardUrl = URL.createObjectURL(blob);
    $("card-image").src = cardUrl;
    $("card-preview").hidden = false;
    const a = $("card-download");
    a.href = cardUrl;
    a.download = `devils-dictionary-${current.word.toLowerCase()}.png`;
    $("puzzle-status").textContent = "Your card is ready. Preview it below and select Download PNG.";
  });
};
const id = new URLSearchParams(location.search).get("entry");
if (id) {
  api("entries", null, `&id=${encodeURIComponent(id)}`)
    .then((data) => play(data.entries[0]))
    .catch((error) => notice(error.message));
}
list();
