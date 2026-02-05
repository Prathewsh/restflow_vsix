let bodyType = "raw";
let formFields = [{ key: "", value: "" }];

const rawTab = document.getElementById("tab-raw");
const formTab = document.getElementById("tab-form");
const rawBody = document.getElementById("raw-body");
const formBody = document.getElementById("form-body");
const formFieldsEl = document.getElementById("form-fields");

rawTab.onclick = () => switchTab("raw");
formTab.onclick = () => switchTab("form");

function switchTab(type) {
  bodyType = type;
  rawTab.classList.toggle("active", type === "raw");
  formTab.classList.toggle("active", type === "form");
  rawBody.style.display = type === "raw" ? "block" : "none";
  formBody.style.display = type === "form" ? "block" : "none";
}

document.getElementById("add-field").onclick = () => {
  formFields.push({ key: "", value: "" });
  renderFormFields();
};

function renderFormFields() {
  formFieldsEl.innerHTML = "";
  formFields.forEach((f, i) => {
    const row = document.createElement("div");
    row.className = "form-row";
    row.innerHTML = `
      <input placeholder="key" value="${f.key}">
      <input placeholder="value" value="${f.value}">
      <button class="danger">✕</button>
    `;
    row.querySelector("button").onclick = () => {
      formFields.splice(i, 1);
      renderFormFields();
    };
    row.querySelectorAll("input")[0].oninput = e => f.key = e.target.value;
    row.querySelectorAll("input")[1].oninput = e => f.value = e.target.value;
    formFieldsEl.appendChild(row);
  });
}

renderFormFields();

document.getElementById("send").onclick = async () => {
  const method = document.getElementById("method").value;
  const url = document.getElementById("url").value;

  let headers = {};
  let body = null;

  if (bodyType === "raw") {
    body = rawBody.value;
    headers["Content-Type"] = "application/json";
  }

  if (bodyType === "form") {
    const fd = new FormData();
    formFields.forEach(f => f.key && fd.append(f.key, f.value));
    body = fd;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? null : body
    });

    const text = await res.text();
    showResponse(res.status, text);
  } catch (e) {
    showError(e.message);
  }
};

function showResponse(status, text) {
  document.getElementById("response-empty").style.display = "none";
  document.getElementById("response-meta").style.display = "flex";
  document.getElementById("response-body").style.display = "block";

  const pill = document.getElementById("status-pill");
  pill.textContent = status;
  pill.className = "status " +
    (status >= 500 ? "error" :
      status >= 400 ? "warn" : "ok");

  try {
    text = JSON.stringify(JSON.parse(text), null, 2);
  } catch { }

  document.getElementById("response-body").textContent = text;
}

function showError(msg) {
  showResponse("ERR", msg);
}
