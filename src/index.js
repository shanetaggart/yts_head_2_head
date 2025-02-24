// Constants (URLs)
const URL_BASE = 'http://127.0.0.1:8082/src/data/';
const URL_LIFETIME_RANKINGS = URL_BASE + 'lifetime_rankings.json';
const URL_LIFETIME_SETS = URL_BASE + 'lifetime_sets.json';
const URL_LIFETIME_GAMES = URL_BASE + 'lifetime_games.json';
const URL_SEASONAL_RANKINGS = URL_BASE + 'seasonal_rankings.json';
const URL_SEASONAL_SETS = URL_BASE + 'seasonal_sets.json';
const URL_SEASONAL_GAMES = URL_BASE + 'seasonal_games.json';


// Constants (elements)
const E_PLAYER_SELECTION_SUBMIT = document.getElementById('player-selection__submit');
const E_P1_SELECT = document.getElementById('p1');
const E_P2_SELECT = document.getElementById('p2');
const E_DATA_OUTPUT = document.getElementById('data_output');
const E_ERROR_MESSAGES = document.getElementById('error_messages');


// Constants (other)
const SEPARATOR_TAG = ' | ';
const SEPARATOR_FIGHTER = ' - ';
const SEPARATOR_SCORE = ' -- ';
const DEFAULT_P1 = 'Player One';
const DEFAULT_P2 = 'Player Two';
const DEFAULT_TAG = 'Y-Town Smash';
const SOCIAL_BRACKET = 'https://start.gg/yts';
const FIGHTER_PREFIX = './public/images/fighters/';
const FIGHTER_SUFFIX = '-00-full.png';
const DEBUG_MODE = true;


async function get_head_to_head_data() {

    
    try {
        

        // Attempt to pull data.
        writeLog('Attempting to pull data...');

        const RESPONSE_LIFETIME_RANKINGS = await fetch(URL_LIFETIME_RANKINGS);
        const RESPONSE_LIFETIME_SETS = await fetch(URL_LIFETIME_SETS);
        const RESPONSE_LIFETIME_GAMES = await fetch(URL_LIFETIME_GAMES);
        const RESPONSE_SEASONAL_RANKINGS = await fetch(URL_SEASONAL_RANKINGS);
        const RESPONSE_SEASONAL_SETS = await fetch(URL_SEASONAL_SETS);
        const RESPONSE_SEASONAL_GAMES = await fetch(URL_SEASONAL_GAMES);


        // Failure to get a response.
        if (!RESPONSE_LIFETIME_RANKINGS.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_LIFETIME_RANKINGS.status}`); }
        if (!RESPONSE_LIFETIME_SETS.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_LIFETIME_SETS.status}`); }
        if (!RESPONSE_LIFETIME_GAMES.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_LIFETIME_GAMES.status}`); }
        if (!RESPONSE_SEASONAL_RANKINGS.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_SEASONAL_RANKINGS.status}`); }
        if (!RESPONSE_SEASONAL_SETS.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_SEASONAL_SETS.status}`); }
        if (!RESPONSE_SEASONAL_GAMES.ok) {throw new Error(`She's broke bahd! Response status: ${RESPONSE_SEASONAL_GAMES.status}`); }


        // Response is good, wait for data to pull.
        writeLog('Responses OK, pulling data...');

        const RESPONSE_LIFETIME_RANKINGS_JSON = await RESPONSE_LIFETIME_RANKINGS.json();
        const RESPONSE_LIFETIME_SETS_JSON = await RESPONSE_LIFETIME_SETS.json();
        const RESPONSE_LIFETIME_GAMES_JSON = await RESPONSE_LIFETIME_GAMES.json();
        const RESPONSE_SEASONAL_RANKINGS_JSON = await RESPONSE_SEASONAL_RANKINGS.json();
        const RESPONSE_SEASONAL_SETS_JSON = await RESPONSE_SEASONAL_SETS.json();
        const RESPONSE_SEASONAL_GAMES_JSON = await RESPONSE_SEASONAL_GAMES.json();


        // Initialize an object to organize all of the data.
        writeLog('Creating Head 2 Head JSON: Building Player structure...');
        
        let head_2_head = {};


        // Build object structure and add Lifetime Rankings data.
        for (const KEY in RESPONSE_LIFETIME_RANKINGS_JSON) {

            let current_player_name = RESPONSE_LIFETIME_RANKINGS_JSON[KEY].Player;
            let current_player_tag = '';

            if (current_player_name.includes(SEPARATOR_TAG)) {

                let current_player_data = current_player_name.split(SEPARATOR_TAG);

                current_player_name = current_player_data[1];
                current_player_tag = current_player_data[0];
            }

            head_2_head[current_player_name] = {

                'Fighters': RESPONSE_LIFETIME_RANKINGS_JSON[KEY].Characters,
                'Country': RESPONSE_LIFETIME_RANKINGS_JSON[KEY].Country,
                'GameData': {
                    'Lifetime': {},
                    'Seasonal': {}
                },
                'PlayerName': current_player_name,
                'PowerRanking': {
                    'Lifetime': {
                        'Points': RESPONSE_LIFETIME_RANKINGS_JSON[KEY].Points,
                        'Rank': RESPONSE_LIFETIME_RANKINGS_JSON[KEY].Rank
                    },
                    'Seasonal': {
                        'Points': '',
                        'Rank': ''
                    }
                },
                'Tag': current_player_tag,
                'SetData': {
                    'Lifetime': {},
                    'Seasonal': {}
                }
            
            }

        }


        // Add Seasonal Rankings data.
        writeLog('Creating Head 2 Head JSON: Seasonal Rankings...');

        for (const KEY in RESPONSE_SEASONAL_RANKINGS_JSON) {

            let current_player_name = RESPONSE_SEASONAL_RANKINGS_JSON[KEY].Player;
            let current_player_points = RESPONSE_SEASONAL_RANKINGS_JSON[KEY].Points;
            let current_player_rank = RESPONSE_SEASONAL_RANKINGS_JSON[KEY].Rank;
            current_player_name = cleanPlayerName(current_player_name);

            head_2_head[current_player_name].PowerRanking.Seasonal.Points = current_player_points;
            head_2_head[current_player_name].PowerRanking.Seasonal.Rank = current_player_rank;

        }


        // Store the headers from the Set and Game data.
        writeLog('Data cleaning: Deleteing header arrays...');
        
        const LIFETIME_SETS_HEADERS = RESPONSE_LIFETIME_SETS_JSON[0];
        const LIFETIME_GAMES_HEADERS = RESPONSE_LIFETIME_GAMES_JSON[0];
        const SEASONAL_SETS_HEADERS = RESPONSE_SEASONAL_SETS_JSON[0];
        const SEASONAL_GAMES_HEADERS = RESPONSE_SEASONAL_GAMES_JSON[0];


        // Delete the headers from the original objects.
        delete RESPONSE_LIFETIME_SETS_JSON[0];
        delete RESPONSE_LIFETIME_GAMES_JSON[0];
        delete RESPONSE_SEASONAL_SETS_JSON[0];
        delete RESPONSE_SEASONAL_GAMES_JSON[0];


        // Replace the keys in the Set and Game data to be the Player Name.
        writeLog('Data cleaning: Lifetime Sets...');

        for (const KEY in RESPONSE_LIFETIME_SETS_JSON) {

            let current_player_name = RESPONSE_LIFETIME_SETS_JSON[KEY]["field2"];

            if (current_player_name == undefined) {
                continue;
            }

            current_player_name = cleanPlayerName(current_player_name);
            RESPONSE_LIFETIME_SETS_JSON[current_player_name] = RESPONSE_LIFETIME_SETS_JSON[KEY];
            delete RESPONSE_LIFETIME_SETS_JSON[KEY];

        }

        writeLog('Data cleaning: Lifetime Games...');

        for (const KEY in RESPONSE_LIFETIME_GAMES_JSON) {

            let current_player_name = RESPONSE_LIFETIME_GAMES_JSON[KEY]["field2"];
            
            if (current_player_name == undefined) {
                continue;
            }
            
            current_player_name = cleanPlayerName(current_player_name);
            RESPONSE_LIFETIME_GAMES_JSON[current_player_name] = RESPONSE_LIFETIME_GAMES_JSON[KEY];
            delete RESPONSE_LIFETIME_GAMES_JSON[KEY];

        }

        writeLog('Data cleaning: Seasonal Sets...');

        for (const KEY in RESPONSE_SEASONAL_SETS_JSON) {

            let current_player_name = RESPONSE_SEASONAL_SETS_JSON[KEY]["field2"];
            
            if (current_player_name == undefined) {
                continue;
            }
            
            current_player_name = cleanPlayerName(current_player_name);
            RESPONSE_SEASONAL_SETS_JSON[current_player_name] = RESPONSE_SEASONAL_SETS_JSON[KEY];
            delete RESPONSE_SEASONAL_SETS_JSON[KEY];

        }

        writeLog('Data cleaning: Seasonal Games...');

        for (const KEY in RESPONSE_SEASONAL_GAMES_JSON) {

            let current_player_name = RESPONSE_SEASONAL_GAMES_JSON[KEY]["field2"];
            
            if (current_player_name == undefined) {
                continue;
            }
            
            current_player_name = cleanPlayerName(current_player_name);
            RESPONSE_SEASONAL_GAMES_JSON[current_player_name] = RESPONSE_SEASONAL_GAMES_JSON[KEY];
            delete RESPONSE_SEASONAL_GAMES_JSON[KEY];

        }


        // Replace the keys for Set and Game results with the Player Name.
        writeLog('Data cleaning: Key replacements for Lifetime Sets...');

        for (const KEY in RESPONSE_LIFETIME_SETS_JSON) {

            for (const VALUE in RESPONSE_LIFETIME_SETS_JSON[KEY]) {

                let current_result = RESPONSE_LIFETIME_SETS_JSON[KEY][VALUE];
                let current_opponent_name = LIFETIME_SETS_HEADERS[VALUE];

                current_opponent_name = cleanPlayerName(current_opponent_name);

                RESPONSE_LIFETIME_SETS_JSON[KEY][current_opponent_name] = current_result;
                delete RESPONSE_LIFETIME_SETS_JSON[KEY][VALUE];

            }

        }

        writeLog('Data cleaning: Key replacements for Lifetime Games...');

        for (const KEY in RESPONSE_LIFETIME_GAMES_JSON) {

            for (const VALUE in RESPONSE_LIFETIME_GAMES_JSON[KEY]) {

                let current_result = RESPONSE_LIFETIME_GAMES_JSON[KEY][VALUE];
                let current_opponent_name = LIFETIME_GAMES_HEADERS[VALUE];

                current_opponent_name = cleanPlayerName(current_opponent_name);
                
                RESPONSE_LIFETIME_GAMES_JSON[KEY][current_opponent_name] = current_result;
                delete RESPONSE_LIFETIME_GAMES_JSON[KEY][VALUE];

            }

        }

        writeLog('Data cleaning: Key replacements for Seasonal Sets...');

        for (const KEY in RESPONSE_SEASONAL_SETS_JSON) {
            
            for (const VALUE in RESPONSE_SEASONAL_SETS_JSON[KEY]) {

                let current_result = RESPONSE_SEASONAL_SETS_JSON[KEY][VALUE];
                let current_opponent_name = SEASONAL_SETS_HEADERS[VALUE];

                current_opponent_name = cleanPlayerName(current_opponent_name);
                
                RESPONSE_SEASONAL_SETS_JSON[KEY][current_opponent_name] = current_result;
                delete RESPONSE_SEASONAL_SETS_JSON[KEY][VALUE];

            }

        }

        writeLog('Data cleaning: Key replacements for Seasonal Games...');

        for (const KEY in RESPONSE_SEASONAL_GAMES_JSON) {

            for (const VALUE in RESPONSE_SEASONAL_GAMES_JSON[KEY]) {

                let current_result = RESPONSE_SEASONAL_GAMES_JSON[KEY][VALUE];
                let current_opponent_name = SEASONAL_GAMES_HEADERS[VALUE];

                current_opponent_name = cleanPlayerName(current_opponent_name);
             
                RESPONSE_SEASONAL_GAMES_JSON[KEY][current_opponent_name] = current_result;
                delete RESPONSE_SEASONAL_GAMES_JSON[KEY][VALUE];

            }

        }


        // Add Lifetime Sets data.
        writeLog('Creating Head 2 Head JSON: Adding Lifetime Sets data...');

        for (const KEY in RESPONSE_LIFETIME_SETS_JSON) {

            if (KEY == 0) {
                delete RESPONSE_LIFETIME_SETS_JSON[KEY];
            } else {

                deleteExtraFields(RESPONSE_LIFETIME_SETS_JSON, KEY);

                head_2_head[KEY]['SetData']['Lifetime'] = RESPONSE_LIFETIME_SETS_JSON[KEY];

            }

        }


        // Add Seasonal Sets data.
        writeLog('Creating Head 2 Head JSON: Adding Seasonal Set data...');

        for (const KEY in RESPONSE_SEASONAL_SETS_JSON) {
            
            if (KEY == 0) {
                delete RESPONSE_SEASONAL_SETS_JSON[KEY];
            } else {

                deleteExtraFields(RESPONSE_SEASONAL_SETS_JSON, KEY);

                head_2_head[KEY]['SetData']['Seasonal'] = RESPONSE_SEASONAL_SETS_JSON[KEY];

            }

        }


        // Add Lifetime Games data.
        writeLog('Creating Head 2 Head JSON: Adding Lifetime Game data...');

        for (const KEY in RESPONSE_LIFETIME_GAMES_JSON) {
            
            if (KEY == 0) {
                delete RESPONSE_LIFETIME_GAMES_JSON[KEY];
            } else {

                deleteExtraFields(RESPONSE_LIFETIME_GAMES_JSON, KEY);

                head_2_head[KEY]['GameData']['Lifetime'] = RESPONSE_LIFETIME_GAMES_JSON[KEY];

            }

        }


        // Add Seasonal Games data.
        writeLog('Creating Head 2 Head JSON: Adding Seasonal Game data...');

        for (const KEY in RESPONSE_SEASONAL_GAMES_JSON) {
            
            if (KEY == 0) {
                delete RESPONSE_SEASONAL_GAMES_JSON[KEY];
            } else {

                deleteExtraFields(RESPONSE_SEASONAL_GAMES_JSON, KEY);

                head_2_head[KEY]['GameData']['Seasonal'] = RESPONSE_SEASONAL_GAMES_JSON[KEY];

            }

        }


        // Insert placeholder option elements into the DOM.
        writeLog('Head 2 Head JSON compiled, creating list of Players...');

        E_P1_SELECT.innerHTML += `<option>${DEFAULT_P1}</option>`;
        E_P2_SELECT.innerHTML += `<option>${DEFAULT_P2}</option>`;


        // Create option elements for each player from the Head to Head object.
        for (const KEY in head_2_head) {

            let current_player = head_2_head[KEY].PlayerName;
            let current_player_rank = head_2_head[KEY].Rank;

            E_P1_SELECT.innerHTML += `<option value="${current_player_rank}">${current_player}</option>`;
            E_P2_SELECT.innerHTML += `<option value="${current_player_rank}">${current_player}</option>`;
                
        }


        // Wait for the user to click Submit.
        writeLog('Finishing up...');

        E_PLAYER_SELECTION_SUBMIT.addEventListener('click', function() {

            // The user needs to select two players.
            if (bothPlayersSelected(E_P1_SELECT, E_P2_SELECT, E_ERROR_MESSAGES)) {

                // Scroll down to hide the player selection elements.
                window.scrollTo({
                    top: document.body.scrollHeight, left: 0, behavior: "smooth"
                });


                // Retrieve the Player Names from the select elements.
                let p1_name = E_P1_SELECT.options[E_P1_SELECT.selectedIndex].innerText;
                let p2_name = E_P2_SELECT.options[E_P2_SELECT.selectedIndex].innerText;


                // Player One and Two Tags.
                let p1_tag = head_2_head[p1_name].Tag;
                let p2_tag = head_2_head[p2_name].Tag;


                // Player One Fighters.
                let p1_fighters = head_2_head[p1_name].Fighters.split(SEPARATOR_FIGHTER);
                let p1_main = FIGHTER_PREFIX + p1_fighters[0] + FIGHTER_SUFFIX;
                let p1_secondary = FIGHTER_PREFIX + p1_fighters[1] + FIGHTER_SUFFIX;


                // Player Two Fighters
                let p2_fighters = head_2_head[p2_name].Fighters.split(SEPARATOR_FIGHTER);
                let p2_main = FIGHTER_PREFIX + p2_fighters[0] + FIGHTER_SUFFIX;
                let p2_secondary = FIGHTER_PREFIX + p2_fighters[1] + FIGHTER_SUFFIX;


                // Player One Power Rankings.
                let p1_seasonal_rank = head_2_head[p1_name].PowerRanking.Seasonal.Rank;
                let p1_seasonal_points = head_2_head[p1_name].PowerRanking.Seasonal.Points;


                // Player Two Power Rankings.
                let p2_seasonal_rank = head_2_head[p2_name].PowerRanking.Seasonal.Rank;
                let p2_seasonal_points = head_2_head[p2_name].PowerRanking.Seasonal.Points;


                // Player One Set/Game Data.
                let p1_seasonal_sets = head_2_head[p1_name].SetData.Seasonal[p2_name];
                let p1_seasonal_games = head_2_head[p1_name].GameData.Seasonal[p2_name];
                
                let p1_lifetime_sets = head_2_head[p1_name].SetData.Lifetime[p2_name];
                let p1_lifetime_games = head_2_head[p1_name].GameData.Lifetime[p2_name];

                if (
                    p1_seasonal_sets != undefined &&
                    p1_seasonal_sets != '0 -- 0'
                ) {
 
                    // Cleaning of Set/Game ratios/scores.
                    let p1_seasonal_sets_array = p1_seasonal_sets.split(SEPARATOR_SCORE);
                    let p1_seasonal_games_array = p1_seasonal_games.split(SEPARATOR_SCORE);

                    let p1_lifetime_sets_array = p1_lifetime_sets.split(SEPARATOR_SCORE);
                    let p1_lifetime_games_array = p1_lifetime_games.split(SEPARATOR_SCORE);

                    let p1_lifetime_set_count = p1_lifetime_sets_array[0];
                    let p1_lifetime_game_count = p1_lifetime_games_array[0];
                    let p1_seasonal_set_count = p1_seasonal_sets_array[0];
                    let p1_seasonal_game_count = p1_seasonal_games_array[0];

                    let p2_lifetime_set_count= p1_lifetime_sets_array[1];
                    let p2_lifetime_game_count= p1_lifetime_games_array[1];
                    let p2_seasonal_set_count= p1_seasonal_sets_array[1];
                    let p2_seasonal_game_count= p1_seasonal_games_array[1];

                    let p1_seasonal_set_score = parseInt(p1_seasonal_sets_array[0]);
                    let p2_seasonal_set_score = parseInt(p1_seasonal_sets_array[1]);

                    let p1_seasonal_game_score = parseInt(p1_seasonal_games_array[0]);
                    let p2_seasonal_game_score = parseInt(p1_seasonal_games_array[1]);

                    let p1_seasonal_set_ratio = Math.round(p1_seasonal_set_score /(p1_seasonal_set_score + p2_seasonal_set_score) * 100);
                    let p1_seasonal_game_ratio = Math.round(p1_seasonal_game_score /(p1_seasonal_game_score + p2_seasonal_game_score) * 100);
                    
                    let p1_lifetime_set_score = parseInt(p1_lifetime_sets_array[0]);
                    let p2_lifetime_set_score = parseInt(p1_lifetime_sets_array[1]);

                    let p1_lifetime_game_score = parseInt(p1_lifetime_games_array[0]);
                    let p2_lifetime_game_score = parseInt(p1_lifetime_games_array[1]);

                    let p1_lifetime_set_ratio = Math.round(p1_lifetime_set_score /(p1_lifetime_set_score + p2_lifetime_set_score) * 100);
                    let p1_lifetime_game_ratio = Math.round(p1_lifetime_game_score /(p1_lifetime_game_score + p2_lifetime_game_score) * 100);


                    // Inversion of Set/Game ratios for Player Two.
                    let p2_seasonal_set_ratio = 100 - p1_seasonal_set_ratio;
                    let p2_seasonal_game_ratio = 100 - p1_seasonal_game_ratio;
                    let p2_lifetime_set_ratio = 100 - p1_lifetime_set_ratio;
                    let p2_lifetime_game_ratio = 100 - p1_lifetime_game_ratio;


                    // Sanitize the image names.
                    p1_main = p1_main.replace(' ', '-').toLowerCase();
                    p1_secondary = p1_secondary.replace(' ', '-').toLowerCase();
                    p2_main = p2_main.replace(' ', '-').toLowerCase();
                    p2_secondary = p2_secondary.replace(' ', '-').toLowerCase();


                    // Storing relevant elements to assign data to.
                    const E_P1_FIGHTER = document.getElementById('p1_fighter');
                    const E_P2_FIGHTER = document.getElementById('p2_fighter');

                    const E_P1_NAME = document.getElementById('p1_name');
                    const E_P2_NAME = document.getElementById('p2_name');

                    const E_P1_TAG = document.getElementById('p1_tag');
                    const E_P2_TAG = document.getElementById('p2_tag');

                    const E_P1_PR = document.getElementById('p1_pr');
                    const E_P2_PR = document.getElementById('p2_pr');

                    const E_P1_SEASONAL_POINTS = document.getElementById('p1_seasonal_points');
                    const E_P2_SEASONAL_POINTS = document.getElementById('p2_seasonal_points');

                    const E_TITLE_HEAD_TO_HEAD = document.getElementById('title_head_to_head');
                    const E_TITLE_STATS = document.getElementById('title_stats');

                    const E_TITLE_WIN_PERCENT = document.querySelectorAll('.title_win_percent');
                    const E_TITLE_PR = document.querySelectorAll('.title_pr');

                    const E_TITLE_SETS = document.querySelectorAll('.sets');
                    const E_TITLE_GAMES = document.querySelectorAll('.games');
                    const E_TITLE_POINTS = document.querySelectorAll('.points');

                    const E_SOCIAL_BRACKET = document.getElementById('social_bracket');

                    const E_TITLE_LIFETIME = document.getElementById('title_lifetime');
                    const E_P1_LIFETIME_SETS = document.getElementById('p1_lifetime_sets_win_count');
                    const E_P2_LIFETIME_SETS = document.getElementById('p2_lifetime_sets_win_count');

                    const E_P1_LIFETIME_GAMES = document.getElementById('p1_lifetime_games_win_count');
                    const E_P2_LIFETIME_GAMES = document.getElementById('p2_lifetime_games_win_count');
                    
                    const E_TITLE_SEASONAL = document.getElementById('title_seasonal');
                    const E_P1_SEASONAL_SETS_WIN_PERCENT = document.getElementById('p1_seasonal_sets_win_percent');
                    const E_P2_SEASONAL_SETS_WIN_PERCENT = document.getElementById('p2_seasonal_sets_win_percent');

                    const E_P1_SEASONAL_SETS_WIN_COUNT = document.getElementById('p1_seasonal_sets_win_count');
                    const E_P2_SEASONAL_SETS_WIN_COUNT = document.getElementById('p2_seasonal_sets_win_count');

                    const E_P1_SEASONAL_GAMES = document.getElementById('p1_seasonal_games_win_count');
                    const E_P2_SEASONAL_GAMES = document.getElementById('p2_seasonal_games_win_count');

                    const E_MAIN_LOGO = document.getElementById('main_logo');


                    // Adding player stats to elements for view.
                    E_DATA_OUTPUT.style.display = 'flex';
                    E_MAIN_LOGO.style.display = 'block';
                    E_SOCIAL_BRACKET.style.display = 'block';

                    E_TITLE_HEAD_TO_HEAD.innerText = 'Head to Head';
                    E_TITLE_WIN_PERCENT.forEach((e) => e.innerText = 'Win %');
                    E_TITLE_PR.forEach((e) => e.innerText = 'PR');

                    E_TITLE_STATS.innerText = 'Stats';
                    E_TITLE_SEASONAL.innerText = 'Seasonal';
                    E_TITLE_LIFETIME.innerText = 'Lifetime';
                    E_TITLE_SETS.forEach((e) => e.innerText = 'Sets');
                    E_TITLE_GAMES.forEach((e) => e.innerText = 'Games');
                    E_TITLE_POINTS.forEach((e) => e.innerText = 'Points');

                    p1_tag == '' ? p1_tag = DEFAULT_TAG : p1_tag;
                    p2_tag == '' ? p2_tag = DEFAULT_TAG : p2_tag;
                    
                    E_P1_TAG.innerHTML = generateTagBanner(p1_tag);
                    E_P2_TAG.innerHTML = generateTagBanner(p2_tag);

                    E_P1_FIGHTER.src = p1_main;
                    E_P2_FIGHTER.src = p2_main;

                    E_P1_NAME.innerText = p1_name;
                    E_P2_NAME.innerText = p2_name;

                    E_P1_PR.innerText = `#${p1_seasonal_rank}`;
                    E_P2_PR.innerText = `#${p2_seasonal_rank}`;

                    E_P1_SEASONAL_SETS_WIN_PERCENT.innerText = `${p1_seasonal_set_ratio}%`;
                    E_P2_SEASONAL_SETS_WIN_PERCENT.innerText = `${p2_seasonal_set_ratio}%`;
                    
                    E_P1_SEASONAL_SETS_WIN_COUNT.innerText = `${p1_seasonal_set_count}`;
                    E_P2_SEASONAL_SETS_WIN_COUNT.innerText = `${p2_seasonal_set_count}`;

                    E_P1_SEASONAL_GAMES.innerText = `${p1_seasonal_game_count}`;
                    E_P2_SEASONAL_GAMES.innerText = `${p2_seasonal_game_count}`;

                    E_P1_SEASONAL_POINTS.innerText = `${p1_seasonal_points}`;
                    E_P2_SEASONAL_POINTS.innerText = `${p2_seasonal_points}`;

                    E_P1_LIFETIME_SETS.innerText = `${p1_lifetime_set_count}`;
                    E_P2_LIFETIME_SETS.innerText = `${p2_lifetime_set_count}`;
                    
                    E_P1_LIFETIME_GAMES.innerText = `${p1_lifetime_game_count}`;
                    E_P2_LIFETIME_GAMES.innerText = `${p2_lifetime_game_count}`;

                    E_SOCIAL_BRACKET.innerText = `${SOCIAL_BRACKET}`;

                } else {
                    
                    E_ERROR_MESSAGES.innerHTML = `<p>These players have not played a set this season!</p>`;
                    console.log('These players have not played a set this season!');

                    // Challenger Approaching.

                }

            };

        });

        writeLog('Ready! Awaiting player selection.');

        // Debug mode to automatically select two players and trigger the click event.
        if (DEBUG_MODE) {
            
            console.group('JSON Responses');
            console.log('RESPONSE_LIFETIME_RANKINGS_JSON: ');
            console.log(RESPONSE_LIFETIME_RANKINGS_JSON);
            console.log('RESPONSE_LIFETIME_SETS_JSON: ');
            console.log(RESPONSE_LIFETIME_SETS_JSON);
            console.log('RESPONSE_LIFETIME_GAMES_JSON: ');
            console.log(RESPONSE_LIFETIME_GAMES_JSON);
            console.log('RESPONSE_SEASONAL_RANKINGS_JSON: ');
            console.log(RESPONSE_SEASONAL_RANKINGS_JSON);
            console.log('RESPONSE_SEASONAL_SETS_JSON: ');
            console.log(RESPONSE_SEASONAL_SETS_JSON);
            console.log('RESPONSE_SEASONAL_GAMES_JSON: ');
            console.log(RESPONSE_SEASONAL_GAMES_JSON);
            console.groupEnd();
    
            console.group('Head 2 Head');
            console.log(head_2_head);
            console.groupEnd();

            E_P1_SELECT.options.selectedIndex = 1;
            E_P2_SELECT.options.selectedIndex = 2;

            let click_event = new Event('click');
            E_PLAYER_SELECTION_SUBMIT.dispatchEvent(click_event);

            const FIGHTER_IMAGES = [
                'banjo-and-kazooie-00-full.png',
                'bayonetta-00-full.png',
                'bowser-00-full.png',
                'bowser-jr-00-full.png',
                'byleth-00-full.png',
                'captain-falcon-00-full.png',
                'chrom-00-full.png',
                'cloud-00-full.png',
                'corrin-00-full.png',
                'daisy-00-full.png',
                'dark-pit-00-full.png',
                'dark-samus-00-full.png',
                'diddy-kong-00-full.png',
                'donkey-kong-00-full.png',
                'dr-mario-00-full.png',
                'duck-hunt-00-full.png',
                'falco-00-full.png',
                'fox-00-full.png',
                'ganondorf-00-full.png',
                'ganondorf-04-full.png',
                'greninja-00-full.png',
                'hero-00-full.png',
                'ice-climbers-00-full.png',
                'ike-00-full.png',
                'incineroar-00-full.png',
                'inkling-00-full.png',
                'isabelle-00-full.png',
                'jigglypuff-00-full.png',
                'joker-00-full.png',
                'kazuya-00-full.png',
                'ken-00-full.png',
                'king-dedede-00-full.png',
                'king-k-rool-00-full.png',
                'kirby-00-full.png',
                'link-00-full.png',
                'little-mac-00-full.png',
                'lucario-00-full.png',
                'lucas-00-full.png',
                'lucina-00-full.png',
                'luigi-00-full.png',
                'mario-00-full.png',
                'marth-00-full.png',
                'mega-man-00-full.png',
                'meta-knight-00-full.png',
                'mewtwo-00-full.png',
                'mii-brawler-00-full.png',
                'mii-gunner-00-full.png',
                'mii-swordfighter-00-full.png',
                'min-min-00-full.png',
                'mr-game-and-watch-00-full.png',
                'ness-00-full.png',
                'olimar-00-full.png',
                'pac-man-00-full.png',
                'palutena-00-full.png',
                'peach-00-full.png',
                'pichu-00-full.png',
                'pikachu-00-full.png',
                'piranha-plant-00-full.png',
                'pit-00-full.png',
                'pokemon-trainer-00-full.png',
                'pyra-and-mythra-00-full.png',
                'richter-00-full.png',
                'ridley-00-full.png',
                'rob-00-full.png',
                'robin-00-full.png',
                'rosalina-and-luma-00-full.png',
                'roy-00-full.png',
                'ryu-00-full.png',
                'samus-00-full.png',
                'sephiroth-00-full.png',
                'sheik-00-full.png',
                'shulk-00-full.png',
                'simon-00-full.png',
                'snake-00-full.png',
                'sonic-00-full.png',
                'sora-00-full.png',
                'steve-00-full.png',
                'terry-00-full.png',
                'toon-link-00-full.png',
                'villager-00-full.png',
                'wario-00-full.png',
                'wii-fit-trainer-00-full.png',
                'wolf-00-full.png',
                'yoshi-00-full.png',
                'young-link-00-full.png',
                'zelda-00-full.png',
                'zero-suit-samus-00-full.png'
            ];

            let p1_fighter = document.querySelector('.p1_fighter');
            let p2_fighter = document.querySelector('.p2_fighter');
            let fighter_counter = 0;

            document.addEventListener('keydown', (e) => {

                if (e.code == 'Space') {

                    p1_fighter.src = FIGHTER_PREFIX + FIGHTER_IMAGES[fighter_counter];
                    p2_fighter.src = FIGHTER_PREFIX + FIGHTER_IMAGES[fighter_counter];
                    
                    if (fighter_counter == FIGHTER_IMAGES.length -1) {
                        fighter_counter = 0;
                    } else {
                        fighter_counter++;
                    }

                }

            });
        }


    // Pulling data failed.
    } catch (error) {


        console.error(error.message);


    }


}


function cleanPlayerName(player_name) {

    if (player_name.includes(' | ')) {

        player_name = player_name.split(' | ').pop();   

    }

    player_name == undefined ? player_name = false : null ;

    return player_name;

}


function writeLog(message) {

    E_ERROR_MESSAGES.innerHTML = message;
    console.log(message);

};


function deleteExtraFields(json, key) {

    delete json[key]['field1'];
    delete json[key]['field2'];
    delete json[key]['field21'];
    delete json[key]['field22'];

}


function bothPlayersSelected(p1, p2, E_ERROR_MESSAGES) {

    if (p1.value != DEFAULT_P1 && p2.value !== DEFAULT_P2) {

        E_ERROR_MESSAGES.innerHTML = '';
        E_ERROR_MESSAGES.style.display = 'none';
        return true;
    
    } else {

        E_ERROR_MESSAGES.innerHTML = `<p>Please select two players!</p>`;
        E_ERROR_MESSAGES.style.display = 'flex';
        return false;
    
    }

}


function generateTagBanner(tag) {

    let tag_generation = 102;
    let tag_output = '';
    let highlighted_tag = `<span class="tag_highlight">${tag}</span>`;

    for (let i = 0; i < tag_generation; i++) { 

        if (i % 2 == 0) {

            tag_output += (highlighted_tag + '&nbsp;' + tag + '&nbsp;').repeat(6) + tag + '&nbsp;';

        } else {

            tag_output += (tag + '&nbsp;' + highlighted_tag + '&nbsp;').repeat(6) + tag + '&nbsp;';

        }

    }
    
    return tag_output;

}


get_head_to_head_data();