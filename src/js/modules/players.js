import { decodeCrosshairShareCode } from './sharecode.js';
import { settings } from './settings.js';
import { updateCrosshair } from './background.js';
import { updateUI } from './ui.js';

// Updated player data with images
export const players = [
    { 
        name: "s1mple", 
        crosshair: "CSGO-5JNHh-BjXE9-zbQ3r-NLftu-wzUrC",
        image: "https://prosettings.net/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=contain%2Cgravity=top%2Cheight=240%2Cq=99%2Csharpen=1%2Cwidth=240/wp-content/uploads/s1mple.png"
    },
    { 
        name: "NiKo", 
        crosshair: "CSGO-XUUUD-qw4wB-NQf9H-hKnkA-JdRqJ",
        image: "https://prosettings.net/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=contain%2Cgravity=top%2Cheight=240%2Cq=99%2Csharpen=1%2Cwidth=240/wp-content/uploads/niko.png"
    },
    { 
        name: "ZywOo", 
        crosshair: "CSGO-Ki3rs-mS8Mv-zTqqc-mOyXo-uTaUN",
        image: "https://prosettings.net/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=contain%2Cgravity=top%2Cheight=240%2Cq=99%2Csharpen=1%2Cwidth=240/wp-content/uploads/zywoo.png"
    },
    { 
        name: "m0NESY", 
        crosshair: "CSGO-8nb3d-Et6WE-QsF6B-V3E7j-WphrM",
        image: "https://prosettings.net/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=contain%2Cgravity=top%2Cheight=240%2Cq=99%2Csharpen=1%2Cwidth=240/wp-content/uploads/m0nesy.png"
    },
    { 
        name: "ropz", 
        crosshair: "CSGO-MMQuh-Hs3Sj-Qv9zd-VaCmc-3QqNO",
        image: "https://prosettings.net/cdn-cgi/image/dpr=1%2Cf=auto%2Cfit=contain%2Cgravity=top%2Cheight=240%2Cq=99%2Csharpen=1%2Cwidth=240/wp-content/uploads/m0nesy.png"
    }
];

function populatePlayersList(searchTerm = '') {
    const playersList = document.getElementById('playersList');
    const filteredPlayers = players.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    playersList.innerHTML = filteredPlayers.map(player => `
        <div class="player-item" data-crosshair="${player.crosshair}">
            <img src="${player.image}" alt="${player.name}" onerror="this.src='/players/default.png'">
            <span>${player.name}</span>
        </div>
    `).join('');
    
    // Add click handlers
    playersList.querySelectorAll('.player-item').forEach(item => {
        item.addEventListener('click', () => {
            const shareCode = item.dataset.crosshair;
            try {
                const importedSettings = decodeCrosshairShareCode(shareCode.trim());
                Object.assign(settings, importedSettings);
                updateCrosshair();
                updateUI();
            } catch (error) {
                console.error("Invalid share code", error);
            }
            document.getElementById('playerDropdown').classList.remove('show');
        });
    });
}

export function initializePlayerSearch() {
    const searchButton = document.getElementById('searchPlayers');
    const dropdown = document.getElementById('playerDropdown');
    const searchInput = document.getElementById('playerSearchInput');

    searchButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !searchButton.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Initial population
    populatePlayersList();
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        populatePlayersList(e.target.value);
    });
}
