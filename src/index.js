// Constants (URLs)
const base_url = 'http://127.0.0.1:8082/src/data/';
const lifetime_rankings_url = base_url + 'lifetime_rankings.json';
const lifetime_sets_url = base_url + 'lifetime_sets.json';
const lifetime_games_url = base_url + 'lifetime_games.json';
const seasonal_rankings_url = base_url + 'seasonal_rankings.json';
const seasonal_sets_url = base_url + 'seasonal_sets.json';
const seasonal_games_url = base_url + 'seasonal_games.json';

// Constants (elements)
const player_selection_submit = document.getElementById('player-selection__submit');
const player_one_select = document.getElementById('player_one');
const player_two_select = document.getElementById('player_two');
const data_output = document.getElementById('data');
const progress_log = document.getElementById('progress-log');

// Constants (other)
const tag_separator = ' | ';
const player_one_default = 'Player One';
const player_two_default = 'Player Two';
const character_delimiter = ' - ';
const character_prefix = './public/images/fighters/';
const character_suffix = '-00-full.png';
const score_delimiter = ' -- ';

async function get_data() {

    try {
        
        writeLog('Attempting to pull data...');
        
        // Attempt to pull data.
        const lifetime_rankings_response = await fetch(lifetime_rankings_url);
        const lifetime_sets_response = await fetch(lifetime_sets_url);
        const lifetime_games_response = await fetch(lifetime_games_url);
        const seasonal_rankings_response = await fetch(seasonal_rankings_url);
        const seasonal_sets_response = await fetch(seasonal_sets_url);
        const seasonal_games_response = await fetch(seasonal_games_url);

        // Failure to get a response.
        if (!lifetime_rankings_response.ok) {throw new Error(`She's broke bahd! Response status: ${lifetime_rankings_response.status}`); }
        if (!lifetime_sets_response.ok) {throw new Error(`She's broke bahd! Response status: ${lifetime_sets_response.status}`); }
        if (!lifetime_games_response.ok) {throw new Error(`She's broke bahd! Response status: ${lifetime_games_response.status}`); }
        if (!seasonal_rankings_response.ok) {throw new Error(`She's broke bahd! Response status: ${seasonal_rankings_response.status}`); }
        if (!seasonal_sets_response.ok) {throw new Error(`She's broke bahd! Response status: ${seasonal_sets_response.status}`); }
        if (!seasonal_games_response.ok) {throw new Error(`She's broke bahd! Response status: ${seasonal_games_response.status}`); }

        writeLog('Responses OK, pulling data...');

        // Response is good, wait for data to pull.
        const lifetime_rankings_response_json = await lifetime_rankings_response.json();
        const lifetime_sets_response_json = await lifetime_sets_response.json();
        const lifetime_games_response_json = await lifetime_games_response.json();
        const seasonal_rankings_response_json = await seasonal_rankings_response.json();
        const seasonal_sets_response_json = await seasonal_sets_response.json();
        const seasonal_games_response_json = await seasonal_games_response.json();

        writeLog('Creating Head 2 Head JSON: Building Player structure...');
        
        // Initialize an object to organize all of the data.
        let head_2_head = {};

        // Lifetime Rankings.
        for (const player in lifetime_rankings_response_json) {

            let current_player = lifetime_rankings_response_json[player].Player;
            let current_player_tag = '';

            if (current_player.includes(tag_separator)) {

                let current_player_data = current_player.split(tag_separator);

                current_player = current_player_data[1];
                current_player_tag = current_player_data[0];
            }

            head_2_head[current_player] = {

                'Characters': lifetime_rankings_response_json[player].Characters,
                'Country': lifetime_rankings_response_json[player].Country,
                'GameData': {
                    'Lifetime': {},
                    'Seasonal': {}
                },
                'PlayerName': current_player,
                'PowerRanking': {
                    'Lifetime': {
                        'Points': lifetime_rankings_response_json[player].Points,
                        'Rank': lifetime_rankings_response_json[player].Rank
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

        writeLog('Creating Head 2 Head JSON: Seasonal Rankings...');

        // Seasonal Rankings.
        for (const player in seasonal_rankings_response_json) {

            let current_player = seasonal_rankings_response_json[player].Player;
            let current_player_points = seasonal_rankings_response_json[player].Points;
            let current_player_rank = seasonal_rankings_response_json[player].Rank;
            current_player = cleanPlayerName(current_player);

            head_2_head[current_player].PowerRanking.Seasonal.Points = current_player_points;
            head_2_head[current_player].PowerRanking.Seasonal.Rank = current_player_rank;

        }

        writeLog('Data cleaning: Deleteing header arrays...');
        
        // Store the headers from the Set and Game data.
        const lifetime_sets_headers = lifetime_sets_response_json[0];
        const lifetime_games_headers = lifetime_games_response_json[0];
        const seasonal_sets_headers = seasonal_sets_response_json[0];
        const seasonal_games_headers = seasonal_games_response_json[0];

        // Delete the headers from the original objects.
        delete lifetime_sets_response_json[0];
        delete lifetime_games_response_json[0];
        delete seasonal_sets_response_json[0];
        delete seasonal_games_response_json[0];

        writeLog('Data cleaning: Lifetime Sets...');

        // Replace the keys in the Set and Game data to be the Player Name.
        for (const player in lifetime_sets_response_json) {

            let player_name = lifetime_sets_response_json[player]["field2"];

            if (player_name == undefined) {
                continue;
            }

            player_name = cleanPlayerName(player_name);
            lifetime_sets_response_json[player_name] = lifetime_sets_response_json[player];
            delete lifetime_sets_response_json[player];

        }

        writeLog('Data cleaning: Lifetime Games...');

        for (const player in lifetime_games_response_json) {

            let player_name = lifetime_games_response_json[player]["field2"];
            
            if (player_name == undefined) {
                continue;
            }
            
            player_name = cleanPlayerName(player_name);
            lifetime_games_response_json[player_name] = lifetime_games_response_json[player];
            delete lifetime_games_response_json[player];

        }

        writeLog('Data cleaning: Seasonal Sets...');

        for (const player in seasonal_sets_response_json) {

            let player_name = seasonal_sets_response_json[player]["field2"];
            
            if (player_name == undefined) {
                continue;
            }
            
            player_name = cleanPlayerName(player_name);
            seasonal_sets_response_json[player_name] = seasonal_sets_response_json[player];
            delete seasonal_sets_response_json[player];

        }

        writeLog('Data cleaning: Seasonal Games...');

        for (const player in seasonal_games_response_json) {

            let player_name = seasonal_games_response_json[player]["field2"];
            
            if (player_name == undefined) {
                continue;
            }
            
            player_name = cleanPlayerName(player_name);
            seasonal_games_response_json[player_name] = seasonal_games_response_json[player];
            delete seasonal_games_response_json[player];

        }

        writeLog('Data cleaning: Key replacements for Lifetime Sets...');

        // Replace the keys for Set and Game results with the Player Name.
        for (const player in lifetime_sets_response_json) {

            for (const result in lifetime_sets_response_json[player]) {

                let current_result = lifetime_sets_response_json[player][result];
                let current_result_opponent = lifetime_sets_headers[result];

                current_result_opponent = cleanPlayerName(current_result_opponent);

                lifetime_sets_response_json[player][current_result_opponent] = current_result;
                delete lifetime_sets_response_json[player][result];

            }

        }

        writeLog('Data cleaning: Key replacements for Lifetime Games...');

        for (const player in lifetime_games_response_json) {

            for (const result in lifetime_games_response_json[player]) {

                let current_result = lifetime_games_response_json[player][result];
                let current_result_opponent = lifetime_games_headers[result];

                current_result_opponent = cleanPlayerName(current_result_opponent);
                
                lifetime_games_response_json[player][current_result_opponent] = current_result;
                delete lifetime_games_response_json[player][result];

            }

        }

        writeLog('Data cleaning: Key replacements for Seasonal Sets...');

        for (const player in seasonal_sets_response_json) {
            
            for (const result in seasonal_sets_response_json[player]) {

                let current_result = seasonal_sets_response_json[player][result];
                let current_result_opponent = seasonal_sets_headers[result];

                current_result_opponent = cleanPlayerName(current_result_opponent);
                
                seasonal_sets_response_json[player][current_result_opponent] = current_result;
                delete seasonal_sets_response_json[player][result];

            }

        }

        writeLog('Data cleaning: Key replacements for Seasonal Games...');

        for (const player in seasonal_games_response_json) {

            for (const result in seasonal_games_response_json[player]) {

                let current_result = seasonal_games_response_json[player][result];
                let current_result_opponent = seasonal_games_headers[result];

                current_result_opponent = cleanPlayerName(current_result_opponent);
             
                seasonal_games_response_json[player][current_result_opponent] = current_result;
                delete seasonal_games_response_json[player][result];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Lifetime Sets data...');

        // Lifetime Sets.
        for (const player in lifetime_sets_response_json) {

            if (player == 0) {
                delete lifetime_sets_response_json[player];
            } else {

                deleteExtraFields(lifetime_sets_response_json, player);

                head_2_head[player]['SetData']['Lifetime'] = lifetime_sets_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Seasonal Set data...');

        // Seasonal Sets.
        for (const player in seasonal_sets_response_json) {
            
            if (player == 0) {
                delete seasonal_sets_response_json[player];
            } else {

                deleteExtraFields(seasonal_sets_response_json, player);

                head_2_head[player]['SetData']['Seasonal'] = seasonal_sets_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Lifetime Game data...');

        // Lifetime Games.
        for (const player in lifetime_games_response_json) {
            
            if (player == 0) {
                delete lifetime_games_response_json[player];
            } else {

                deleteExtraFields(lifetime_games_response_json, player);

                head_2_head[player]['GameData']['Lifetime'] = lifetime_games_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Seasonal Game data...');

        // Seasonal Games.
        for (const player in seasonal_games_response_json) {
            
            if (player == 0) {
                delete seasonal_games_response_json[player];
            } else {

                deleteExtraFields(seasonal_games_response_json, player);

                head_2_head[player]['GameData']['Seasonal'] = seasonal_games_response_json[player];

            }

        }

        writeLog('Head 2 Head JSON compiled, creating list of Players...');

        // Insert placeholder option elements.
        player_one_select.innerHTML += `<option>${player_one_default}</option>`;
        player_two_select.innerHTML += `<option>${player_two_default}</option>`;

        // Create option elements for each player from the fact sheet.
        for (const player in head_2_head) {

            let current_player = head_2_head[player].PlayerName;
            let current_player_rank = head_2_head[player].Rank;

            player_one_select.innerHTML += `<option value="${current_player_rank}">${current_player}</option>`;
            player_two_select.innerHTML += `<option value="${current_player_rank}">${current_player}</option>`;
                
        }

        writeLog('Finishing up...');

        // Wait for the user to click Submit.
        player_selection_submit.addEventListener("click", function() {

            if (bothPlayersSelected(player_one_select, player_two_select)) {

                // Scroll down to hide the player selection elements.
                window.scrollTo(0, document.body.scrollHeight);

                // Retrieve the Player Names from the select elements.
                let player_one_name = player_one_select.options[player_one_select.selectedIndex].innerText;
                let player_two_name = player_two_select.options[player_two_select.selectedIndex].innerText;

                // Player One and Two Tags.
                let player_one_tag = head_2_head[player_one_name].Tag;
                let player_two_tag = head_2_head[player_two_name].Tag;

                // Player One Characters.
                let player_one_characters = head_2_head[player_one_name].Characters.split(character_delimiter);
                let player_one_main = character_prefix + player_one_characters[0] + character_suffix;
                let player_one_secondary = character_prefix + player_one_characters[1] + character_suffix;

                // Player Two Characters
                let player_two_characters = head_2_head[player_two_name].Characters.split(character_delimiter);
                let player_two_main = character_prefix + player_two_characters[0] + character_suffix;
                let player_two_secondary = character_prefix + player_two_characters[1] + character_suffix;

                // Player One Power Rankings.
                let player_one_seasonal_rank = head_2_head[player_one_name].PowerRanking.Seasonal.Rank;

                let player_one_lifetime_points = head_2_head[player_one_name].PowerRanking.Lifetime.Points;
                let player_one_seasonal_points = head_2_head[player_one_name].PowerRanking.Seasonal.Points;

                // Player Two Power Rankings.
                let player_two_seasonal_rank = head_2_head[player_two_name].PowerRanking.Seasonal.Rank;

                let player_two_lifetime_points = head_2_head[player_two_name].PowerRanking.Lifetime.Points;
                let player_two_seasonal_points = head_2_head[player_two_name].PowerRanking.Seasonal.Points;

                // Player One Set/Game Data.
                let player_one_seasonal_sets = head_2_head[player_one_name].SetData.Seasonal[player_two_name];
                let player_one_seasonal_games = head_2_head[player_one_name].GameData.Seasonal[player_two_name];
                
                let player_one_lifetime_sets = head_2_head[player_one_name].SetData.Lifetime[player_two_name];
                let player_one_lifetime_games = head_2_head[player_one_name].GameData.Lifetime[player_two_name];

                if (
                    player_one_seasonal_sets != undefined &&
                    player_one_seasonal_sets != '0 -- 0'
                ) {

                    // Cleaning of Set/Game ratios/scores.
                    let player_one_seasonal_sets_array = player_one_seasonal_sets.split(score_delimiter);
                    let player_one_seasonal_games_array = player_one_seasonal_games.split(score_delimiter);

                    let player_one_lifetime_sets_array = player_one_lifetime_sets.split(score_delimiter);
                    let player_one_lifetime_games_array = player_one_lifetime_games.split(score_delimiter);

                    let player_one_lifetime_set_count = player_one_lifetime_sets_array[0];
                    let player_one_lifetime_game_count = player_one_lifetime_games_array[0];
                    let player_one_seasonal_set_count = player_one_seasonal_sets_array[0];
                    let player_one_seasonal_game_count = player_one_seasonal_games_array[0];

                    let player_two_lifetime_set_count= player_one_lifetime_sets_array[1];
                    let player_two_lifetime_game_count= player_one_lifetime_games_array[1];
                    let player_two_seasonal_set_count= player_one_seasonal_sets_array[1];
                    let player_two_seasonal_game_count= player_one_seasonal_games_array[1];

                    let player_one_seasonal_set_score = parseInt(player_one_seasonal_sets_array[0]);
                    let player_two_seasonal_set_score = parseInt(player_one_seasonal_sets_array[1]);

                    let player_one_seasonal_game_score = parseInt(player_one_seasonal_games_array[0]);
                    let player_two_seasonal_game_score = parseInt(player_one_seasonal_games_array[1]);

                    let player_one_seasonal_set_ratio = Math.round(player_one_seasonal_set_score /(player_one_seasonal_set_score + player_two_seasonal_set_score) * 100);
                    let player_one_seasonal_game_ratio = Math.round(player_one_seasonal_game_score /(player_one_seasonal_game_score + player_two_seasonal_game_score) * 100);
                    
                    let player_one_lifetime_set_score = parseInt(player_one_lifetime_sets_array[0]);
                    let player_two_lifetime_set_score = parseInt(player_one_lifetime_sets_array[1]);

                    let player_one_lifetime_game_score = parseInt(player_one_lifetime_games_array[0]);
                    let player_two_lifetime_game_score = parseInt(player_one_lifetime_games_array[1]);

                    let player_one_lifetime_set_ratio = Math.round(player_one_lifetime_set_score /(player_one_lifetime_set_score + player_two_lifetime_set_score) * 100);
                    let player_one_lifetime_game_ratio = Math.round(player_one_lifetime_game_score /(player_one_lifetime_game_score + player_two_lifetime_game_score) * 100);

                    // Inversion of Set/Game ratios for Player Two.
                    let player_two_seasonal_set_ratio = 100 - player_one_seasonal_set_ratio;
                    let player_two_seasonal_game_ratio = 100 - player_one_seasonal_game_ratio;
                    let player_two_lifetime_set_ratio = 100 - player_one_lifetime_set_ratio;
                    let player_two_lifetime_game_ratio = 100 - player_one_lifetime_game_ratio;

                    // Sanitize the image names.
                    player_one_main = player_one_main.replace(' ', '-').toLowerCase();
                    player_one_secondary = player_one_secondary.replace(' ', '-').toLowerCase();
                    player_two_main = player_two_main.replace(' ', '-').toLowerCase();
                    player_two_secondary = player_two_secondary.replace(' ', '-').toLowerCase();

                    // Storing relevant elements to assign data to.
                    const player_one_character_element = document.getElementById('player_one_character');
                    const player_two_character_element = document.getElementById('player_two_character');

                    const player_one_name_element = document.getElementById('player_one_name');
                    const player_two_name_element = document.getElementById('player_two_name');

                    const player_one_tag_element = document.getElementById('player_one_tag');
                    const player_two_tag_element = document.getElementById('player_two_tag');

                    const player_one_pr_element = document.getElementById('player_one_pr');
                    const player_two_pr_element = document.getElementById('player_two_pr');

                    const player_one_points_seasonal_element = document.getElementById('player_one_points_seasonal');
                    const player_two_points_seasonal_element = document.getElementById('player_two_points_seasonal');

                    const player_one_points_lifetime_element = document.getElementById('player_one_points_lifetime');
                    const player_two_points_lifetime_element = document.getElementById('player_two_points_lifetime');

                    const lifetime_sets_title = document.getElementById('lifetime_sets_title');
                    const player_one_lifetime_sets_element = document.getElementById('player_one_lifetime_sets');
                    const player_two_lifetime_sets_element = document.getElementById('player_two_lifetime_sets');

                    const lifetime_games_title = document.getElementById('lifetime_games_title');
                    const player_one_lifetime_games_element = document.getElementById('player_one_lifetime_games');
                    const player_two_lifetime_games_element = document.getElementById('player_two_lifetime_games');
                    
                    const seasonal_sets_title = document.getElementById('seasonal_sets_title');
                    const player_one_seasonal_sets_element = document.getElementById('player_one_seasonal_sets');
                    const player_two_seasonal_sets_element = document.getElementById('player_two_seasonal_sets');

                    const seasonal_games_title = document.getElementById('seasonal_games_title');
                    const player_one_seasonal_games_element = document.getElementById('player_one_seasonal_games');
                    const player_two_seasonal_games_element = document.getElementById('player_two_seasonal_games');

                    const main_logo = document.getElementById('main_logo');
                    const player_one_details = document.getElementById('player_one_details');
                    const player_two_details = document.getElementById('player_two_details');

                    // Adding player stats to elements for view.
                    main_logo.style.display = 'block';

                    player_one_character_element.src = player_one_main;
                    player_two_character_element.src = player_two_main;

                    player_one_details.style.display = 'block';
                    player_two_details.style.display = 'block';

                    player_one_tag_element.innerText = player_one_tag;
                    player_two_tag_element.innerText = player_two_tag;

                    player_one_name_element.innerText = player_one_name;
                    player_two_name_element.innerText = player_two_name;

                    player_one_pr_element.innerText = `#${player_one_seasonal_rank}`;
                    player_two_pr_element.innerText = `#${player_two_seasonal_rank}`;
                    
                    player_one_points_seasonal_element.innerText = `Seasonal: ${player_one_seasonal_points} pts`;
                    player_one_points_lifetime_element.innerText = `Lifetime: ${player_one_lifetime_points} pts`;

                    player_two_points_seasonal_element.innerText = `Seasonal: ${player_two_seasonal_points} pts`;
                    player_two_points_lifetime_element.innerText = `Lifetime: ${player_two_lifetime_points} pts`;

                    player_one_seasonal_sets_element.innerText = `${player_one_seasonal_set_ratio}% (${player_one_seasonal_set_count})`;
                    seasonal_sets_title.innerText = 'Seasonal Sets';
                    player_two_seasonal_sets_element.innerText = `${player_two_seasonal_set_ratio}% (${player_two_seasonal_set_count})`;

                    player_one_seasonal_games_element.innerText = `${player_one_seasonal_game_ratio}% (${player_one_seasonal_game_count})`;
                    seasonal_games_title.innerText = 'Seasonal Games';
                    player_two_seasonal_games_element.innerText = `${player_two_seasonal_game_ratio}% (${player_two_seasonal_game_count})`;

                    player_one_lifetime_sets_element.innerText = `${player_one_lifetime_set_ratio}% (${player_one_lifetime_set_count})`;
                    lifetime_sets_title.innerText = 'Lifetime Sets';
                    player_two_lifetime_sets_element.innerText = `${player_two_lifetime_set_ratio}% (${player_two_lifetime_set_count})`;
                    
                    player_one_lifetime_games_element.innerText = `${player_one_lifetime_game_ratio}% (${player_one_lifetime_game_count})`;
                    lifetime_games_title.innerText = 'Lifetime Games';
                    player_two_lifetime_games_element.innerText = `${player_two_lifetime_game_ratio}% (${player_two_lifetime_game_count})`;

                } else {

                    seasonal_sets_title.innerText = 'These players have not played a set this season!';
                    console.log('These players have not played a set this season!');

                }

            };

        });

        writeLog('Ready! Awaiting player selection.');

        console.group('Head 2 Head');
        console.log(head_2_head);
        console.groupEnd();

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

    // progress_log.innerHTML = message;

    console.log(message);

};


function deleteExtraFields(json, key) {

    delete json[key]['field1'];
    delete json[key]['field2'];
    delete json[key]['field21'];
    delete json[key]['field22'];

}


function bothPlayersSelected(player_one, player_two) {

    if (player_one.value != player_one_default && player_two.value !== player_two_default) {
        return true;
    } else {
        return false;
    }

}


get_data();