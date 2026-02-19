const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const profileContainer = document.getElementById("profileContainer");
const repoList = document.getElementById("repoList");
const loader = document.getElementById("loader");
const repoTitle = document.getElementById("repoTitle");

/* ---------------- LOCAL STORAGE ---------------- */
window.onload = () => {
    let lastUser = localStorage.getItem("lastUser");
    if (lastUser) fetchUser(lastUser);
};

/* ---------------- SEARCH EVENT ---------------- */
searchBtn.addEventListener("click", () => {
    const username = searchInput.value.trim();
    if (username === "") {
        shakeInput();
        return;
    }
    fetchUser(username);
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

/* ---------------- SHAKE ANIMATION ---------------- */
function shakeInput() {
    searchInput.classList.add("error");
    setTimeout(() => searchInput.classList.remove("error"), 400);
}

/* ---------------- FETCH USER ---------------- */
async function fetchUser(username) {
    loader.classList.remove("hidden");
    profileContainer.innerHTML = "";
    repoList.innerHTML = "";
    repoTitle.classList.add("hidden");

    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (res.status === 404) {
            showError("User Not Found!");
            loader.classList.add("hidden");
            return;
        }

        const data = await res.json();
        displayProfile(data);
        fetchRepos(username);

        localStorage.setItem("lastUser", username);
    } 
    catch {
        showError("Something went wrong");
    } 
    finally {
        loader.classList.add("hidden");
    }
}

/* ---------------- DISPLAY PROFILE ---------------- */
function displayProfile(data) {
    profileContainer.innerHTML = `
        <div class="profile-card">
            <img src="${data.avatar_url}" alt="Avatar">
            <h2>${data.name || "No Name"}</h2>
            <p>@${data.login}</p>
            <p>${data.bio || "No bio available"}</p>

            <div class="stats">
                <div class="stat-box">
                    <h3 id="repoCount">0</h3>
                    <p>Repos</p>
                </div>
                <div class="stat-box">
                    <h3 id="followersCount">0</h3>
                    <p>Followers</p>
                </div>
                <div class="stat-box">
                    <h3 id="followingCount">0</h3>
                    <p>Following</p>
                </div>
            </div>

            <p><strong>Location:</strong> ${data.location || "Unknown"}</p>
            <p><strong>Joined:</strong> ${new Date(data.created_at).toDateString()}</p>

            <a href="${data.html_url}" class="btn-profile" target="_blank">View on GitHub</a>
        </div>
    `;

    animateCounter("repoCount", data.public_repos);
    animateCounter("followersCount", data.followers);
    animateCounter("followingCount", data.following);
}

/* ---------------- COUNTER ANIMATION ---------------- */
function animateCounter(id, value) {
    let count = 0;
    const speed = value / 40;

    const interval = setInterval(() => {
        count += speed;
        if (count >= value) {
            document.getElementById(id).innerText = value;
            clearInterval(interval);
        } else {
            document.getElementById(id).innerText = Math.floor(count);
        }
    }, 20);
}

/* ---------------- FETCH REPOS ---------------- */
async function fetchRepos(username) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=created`);
    const repos = await res.json();

    repoTitle.classList.remove("hidden");

    repos.slice(0, 5).forEach(repo => {
        repoList.innerHTML += `
            <div class="repo-card">
                <h3>${repo.name}</h3>
                <p>${repo.description || "No description"}</p>
            </div>
        `;
    });
}

/* ---------------- ERROR CARD ---------------- */
function showError(msg) {
    profileContainer.innerHTML = `
        <div class="error-card">${msg}</div>
    `;
}

/* ---------------- LIGHT/DARK MODE ---------------- */
document.getElementById("theme-toggle").addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
});
