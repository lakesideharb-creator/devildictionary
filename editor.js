const $ = (id) => document.getElementById(id);
let page = 0;
async function api(action, data) {
  const res = await fetch(
    `/api/community?action=${action}&status=${$("status").value}&page=${page}`,
    data
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      : {},
  );
  const result = await res.json();
  if (res.status === 401) {
    $("desk").hidden = true;
    $("login").hidden = false;
  }
  if (!res.ok) throw Error(result.error);
  return result;
}
function button(label, fn) {
  const b = document.createElement("button");
  b.textContent = label;
  b.onclick = async () => {
    b.disabled = true;
    try {
      await fn();
      await load();
    } catch (e) {
      $("notice").textContent = e.message;
    } finally {
      b.disabled = false;
    }
  };
  return b;
}
async function load() {
  const data = await api("desk");
  $("desk").hidden = false;
  $("login").hidden = true;
  $("entries").replaceChildren();
  $("reports").replaceChildren();
  $("previous").disabled = page === 0;
  $("next").disabled = data.entries.length <= 20;
  for (const entry of data.entries.slice(0, 20)) {
    const card = document.createElement("article");
    card.className = "desk-entry";
    const title = document.createElement("h2");
    title.textContent = entry.word;
    const definition = document.createElement("p");
    definition.textContent = entry.definition;
    const by = document.createElement("p");
    by.textContent = `${entry.pos} · ${entry.author} · ${entry.status}`;
    card.append(title, definition, by);
    const actions = document.createElement("div");
    actions.className = "actions";
    for (const [label, status] of entry.status === "pending"
      ? [
          ["APPROVE", "approved"],
          ["REJECT", "rejected"],
        ]
      : entry.status === "approved"
        ? [["UNPUBLISH", "removed"]]
        : [])
      actions.append(
        button(label, () => api("moderate", { id: entry.id, status })),
      );
    card.append(actions);
    $("entries").append(card);
  }
  if (!data.entries.length)
    $("entries").textContent = "No entries in this queue.";
  for (const report of data.reports) {
    const card = document.createElement("article");
    card.className = "desk-entry";
    const p = document.createElement("p");
    p.textContent = `${report.word || report.entry_id}: ${report.reason}`;
    card.append(
      p,
      button("RESOLVE", () => api("resolve", { id: report.id })),
      button("UNPUBLISH ENTRY", () =>
        api("moderate", { id: report.entry_id, status: "removed" }),
      ),
    );
    $("reports").append(card);
  }
  if (!data.reports.length) $("reports").textContent = "No open reports.";
}
$("login").onsubmit = async (event) => {
  event.preventDefault();
  try {
    await api("login", { password: $("password").value });
    $("password").value = "";
    $("notice").textContent = "";
    await load();
  } catch (e) {
    $("notice").textContent = e.message;
  }
};
$("logout").onclick = async () => {
  try {
    await api("logout", {});
    $("desk").hidden = true;
    $("login").hidden = false;
    $("entries").replaceChildren();
    $("reports").replaceChildren();
  } catch (e) {
    $("notice").textContent = e.message;
  }
};
$("status").onchange = () => {
  page = 0;
  load().catch((e) => ($("notice").textContent = e.message));
};
$("previous").onclick = () => {
  page--;
  load().catch((e) => ($("notice").textContent = e.message));
};
$("next").onclick = () => {
  page++;
  load().catch((e) => ($("notice").textContent = e.message));
};
load().catch((e) => ($("notice").textContent = e.message));
