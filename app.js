let dataSaver = false;

const GITHUB_API = "https://api.github.com";

async function fetchUser(username) {
    if (!username) return null;
    const res = await fetch(`\( {GITHUB_API}/users/ \){username}`);
    if (!res.ok) throw new Error(`${username} পাওয়া যায়নি`);
    return res.json();
}

async function fetchRepos(username) {
    const res = await fetch(`\( {GITHUB_API}/users/ \){username}/repos?per_page=100`);
    if (!res.ok) return [];
    return res.json();
}

function toggleSaver() {
    dataSaver = !dataSaver;
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

async function startFight() {
    const u1 = document.getElementById('user1').value.trim();
    const u2 = document.getElementById('user2').value.trim();

    if (!u1 || !u2) {
        alert("দুইজনের GitHub username দিতে হবে!");
        return;
    }

    try {
        const [user1, user2] = await Promise.all([
            fetchUser(u1),
            fetchUser(u2)
        ]);

        const [repos1, repos2] = await Promise.all([
            fetchRepos(u1),
            fetchRepos(u2)
        ]);

        renderPlayer(1, user1, repos1);
        renderPlayer(2, user2, repos2);

        document.getElementById('result').classList.remove('hidden');
        declareWinner(user1, user2, repos1, repos2);

    } catch (err) {
        alert(err.message);
    }
}

function renderPlayer(num, user, repos) {
    const container = document.getElementById(`player${num}`);
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    container.innerHTML = `
        <div class="flex flex-col items-center text-center">
            ${dataSaver ? 
                `<div class="w-32 h-32 bg-zinc-700 rounded-3xl flex items-center justify-center text-6xl mb-6">👤</div>` : 
                `<img src="${user.avatar_url}" class="w-32 h-32 rounded-3xl object-cover border-4 border-cyan-400 mb-6">`
            }
            <h2 class="text-3xl font-bold">${user.name || user.login}</h2>
            <a href="\( {user.html_url}" target="_blank" class="text-cyan-400">@ \){user.login}</a>
            
            <div class="grid grid-cols-2 gap-6 w-full mt-10">
                <div class="bg-zinc-900 rounded-2xl p-6">
                    <div class="text-4xl font-bold">${user.followers}</div>
                    <div class="text-sm text-zinc-400">Followers</div>
                </div>
                <div class="bg-zinc-900 rounded-2xl p-6">
                    <div class="text-4xl font-bold">${user.public_repos}</div>
                    <div class="text-sm text-zinc-400">Repositories</div>
                </div>
                <div class="bg-zinc-900 rounded-2xl p-6">
                    <div class="text-4xl font-bold">${totalStars}</div>
                    <div class="text-sm text-zinc-400">Total Stars</div>
                </div>
                <div class="bg-zinc-900 rounded-2xl p-6">
                    <div class="text-4xl font-bold">${user.public_gists || 0}</div>
                    <div class="text-sm text-zinc-400">Gists</div>
                </div>
            </div>
        </div>
    `;
}

function declareWinner(u1, u2, r1, r2) {
    const stars1 = r1.reduce((a, b) => a + b.stargazers_count, 0);
    const stars2 = r2.reduce((a, b) => a + b.stargazers_count, 0);

    const score1 = (u1.followers * 2) + (u1.public_repos * 1.5) + stars1;
    const score2 = (u2.followers * 2) + (u2.public_repos * 1.5) + stars2;

    const winner = score1 > score2 ? u1 : u2;
    const isDraw = Math.abs(score1 - score2) < 50;

    const winnerDiv = document.getElementById('winner');
    winnerDiv.classList.remove('hidden');

    winnerDiv.innerHTML = isDraw ? `
        <div class="inline-flex items-center gap-4 bg-yellow-500/10 border border-yellow-400 text-yellow-400 px-10 py-6 rounded-3xl text-3xl font-bold">
            🏆 IT'S A DRAW! 🏆
        </div>
    ` : `
        <div class="inline-flex flex-col items-center">
            <div class="text-7xl mb-4 trophy">🏆</div>
            <h2 class="text-5xl font-bold text-cyan-400">${winner.name || winner.login} জিতেছে!</h2>
            <p class="text-zinc-400 mt-3">GitHub Fight Champion</p>
        </div>
    `;

    // Confetti Effect
    createConfetti();
}

function createConfetti() {
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.textContent = ['⚔️','🏆','⭐','🔥'][Math.floor(Math.random()*4)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-50px';
        confetti.style.fontSize = '2rem';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 4s linear';
        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.style.transform = `translateY(\( {window.innerHeight + 100}px) rotate( \){Math.random()*800}deg)`;
        }, 50);

        setTimeout(() => confetti.remove(), 5000);
    }
}
