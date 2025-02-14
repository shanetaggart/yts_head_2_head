// Constants (URLs)
const base_url = 'http://127.0.0.1:8082/src/data/';
const all_time_sets_url = base_url + 'all_time_sets.json';
const all_time_games_url = base_url + 'all_time_games.json';
const seasonal_sets_url = base_url + 'season_to_date_sets.json';
const seasonal_games_url = base_url + 'season_to_date_games.json';
const all_time_rankings_url = base_url + 'all_time_rankings.json';

// Constants (elements)
const player_select_elements = document.querySelectorAll('select');
const player_one_select = document.getElementById('player_one');
const player_two_select = document.getElementById('player_two');
const data_output = document.getElementById('data');
const tag_separator = ' | ';
const player_one_default = 'Player One';
const player_two_default = 'Player Two';

async function get_data() {

    try {
        
        writeLog('Attempting to pull data...');
        
        // Attempt to pull data.
        const ats_response = await fetch(all_time_sets_url);
        const atg_response = await fetch(all_time_games_url);
        const stds_response = await fetch(seasonal_sets_url);
        const stdg_response = await fetch(seasonal_games_url);
        const atr_response = await fetch(all_time_rankings_url);

        // Failure to get a response.
        if (!ats_response.ok) { throw new Error(`She's broke bahd! Response status: ${ats_response.status}`); }
        if (!atg_response.ok) { throw new Error(`She's broke bahd! Response status: ${atg_response.status}`); }
        if (!stds_response.ok) { throw new Error(`She's broke bahd! Response status: ${stds_response.status}`); }
        if (!stdg_response.ok) { throw new Error(`She's broke bahd! Response status: ${stdg_response.status}`); }
        if (!atr_response.ok) { throw new Error(`She's broke bahd! Response status: ${atr_response.status}`); }

        writeLog('Responses OK, pulling data...');

        // Response is good, wait for data to pull.
        const ats_response_json = await ats_response.json();
        const atg_response_json = await atg_response.json();
        const stds_response_json = await stds_response.json();
        const stdg_response_json = await stdg_response.json();
        const atr_response_json = await atr_response.json();

        writeLog('Creating Head 2 Head JSON: Adding players...');
        
        // Initialize an object to organize all of the data.
        let head_2_head = {};

        // Lifetime Rankings.
        for (const player in atr_response_json) {

            let current_player = atr_response_json[player].Player;
            let current_player_tag = '';

            if (current_player.includes(tag_separator)) {
                
                let current_player_data = current_player.split(tag_separator);

                current_player = current_player_data[1];
                current_player_tag = current_player_data[0];
            }

            head_2_head[current_player] = {

                'Characters': atr_response_json[player].Characters,
                'Country': atr_response_json[player].Country,
                'GameData': {
                    'Lifetime' : {},
                    'Seasonal': {}
                },
                'Points': atr_response_json[player].Points,
                'PlayerName': current_player,
                'Rank': atr_response_json[player].Rank,
                'Tag': current_player_tag,
                'SetData': {
                    'Lifetime' : {},
                    'Seasonal': {}
                }
            
            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Lifetime Sets data...');

        // Lifetime Sets.
        for (const player in ats_response_json) {
            
            if (player == 0) {
                delete ats_response_json[player];
            } else {

                let current_player = ats_response_json[player]["field2"];

                if (ats_response_json[player]["field2"].includes(' | ')) {
                    current_player = ats_response_json[player]["field2"].split(' | ').pop();
                }

                deleteExtraFields(ats_response_json, player);

                head_2_head[current_player]['SetData']['Lifetime'] = ats_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Seasonal Set data...');

        // Seasonal Sets.
        for (const player in stds_response_json) {
            
            if (player == 0) {
                delete stds_response_json[player];
            } else {

                let current_player = stds_response_json[player]["field2"];

                if (stds_response_json[player]["field2"].includes(' | ')) {
                    current_player = stds_response_json[player]["field2"].split(' | ').pop();
                }

                deleteExtraFields(stds_response_json, player);

                head_2_head[current_player]['SetData']['Seasonal'] = stds_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Lifetime Game data...');

        // Lifetime Games.
        for (const player in atg_response_json) {
            
            if (player == 0) {
                delete atg_response_json[player];
            } else {

                let current_player = atg_response_json[player]["field2"];

                if (atg_response_json[player]["field2"].includes(' | ')) {
                    current_player = atg_response_json[player]["field2"].split(' | ').pop();
                }

                deleteExtraFields(atg_response_json, player);

                head_2_head[current_player]['GameData']['Lifetime'] = atg_response_json[player];

            }

        }

        writeLog('Creating Head 2 Head JSON: Adding Seasonal Game data...');

        // Seasonal Games.
        for (const player in stdg_response_json) {
            
            if (player == 0) {
                delete stdg_response_json[player];
            } else {

                let current_player = stdg_response_json[player]["field2"];

                if (stdg_response_json[player]["field2"].includes(' | ')) {
                    current_player = stdg_response_json[player]["field2"].split(' | ').pop();
                }

                deleteExtraFields(stdg_response_json, player);

                head_2_head[current_player]['GameData']['Seasonal'] = stdg_response_json[player];

            }

        }

        writeLog('Head 2 Head JSON compiled, creating option elements...');

        // Debugging.
        console.group('Head 2 Head JSON');
        console.log(head_2_head);
        console.groupEnd();

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

        // Watch select elements for changes.
        player_select_elements.forEach(select_element => {

            select_element.addEventListener("change", function() {

                if (bothPlayersSelected(player_one_select, player_two_select)) {

                    // Retrieve the player names from the select elements.
                    let player_one_name = player_one_select.options[player_one_select.selectedIndex].innerText;
                    let player_two_name = player_two_select.options[player_two_select.selectedIndex].innerText;

                    // Initialize the remainder of the player data.
                    let player_one_pr;
                    let player_one_characters;
                    let player_one_lts;
                    let player_one_stds;
                    let player_one_ltg;
                    let player_one_stdg;
                    let player_two_pr;
                    let player_two_characters;
                    
                    for (const player in head_2_head) {

                        if (player == player_one_name) {

                            player_one_pr = head_2_head[player].Rank;
                            player_one_characters = head_2_head[player].Characters;
                            player_one_lts = head_2_head[player].SetData.Lifetime;
                            player_one_stds = head_2_head[player].SetData.Seasonal;
                            player_one_ltg = head_2_head[player].GameData.Lifetime;
                            player_one_stdg = head_2_head[player].GameData.Seasonal;

                        }

                        if (player == player_two_name) {

                            player_two_pr = head_2_head[player].Rank;
                            player_two_characters = head_2_head[player].Characters;

                        }

                    } 
                    
                    // Final debugging. Need to replace the keys in the set and game data with the names of the second player.
                    console.group('P1 LTG');
                    console.log(player_one_ltg);
                    console.groupEnd();

                    data_output.innerHTML = 
                    `
                    <article class="player-stats">
                        <p>
                            P1: ${player_one_name} (${player_one_characters})
                            <br>
                            PR #${player_one_pr}
                            <br>
                            <br>
                            Lifetime Stats
                            <br>
                            Lifetime Sets: ${player_one_lts}
                            <br>
                            Lifetime Games: ${player_one_ltg}
                            <br>
                            <br>
                            Seasonal Stats
                            <br>
                            Seasonal Sets: ${player_one_stds}
                            <br>
                            Seasonal Games: ${player_one_stdg}
                        </p>
                        <p>VS</p>
                        <p>
                            P1: ${player_two_name} (${player_two_characters})
                            <br>
                            PR #${player_two_pr}
                        </p>
                    </article>
                    `;

                };

            });

        });

        writeLog('Ready! Awaiting player selection.');

    // Pulling data failed.
    } catch (error) {

        console.error(error.message);

    }

}


function cleanPlayerName(player_name) {

    if (player_name.includes(' | ')) {

        player_name = player_name.split(' | ').pop();   

    }

    return player_name;

}


function writeLog(message) {

    data_output.innerHTML = message;

    console.log(message);

};


function deleteExtraFields(json, key) {

    delete json[key]['field1'];
    delete json[key]['field2'];
    delete json[key]['field22'];

}


function bothPlayersSelected(player_one_element, player_two_element) {

    if (
        player_one_element.options[player_one_element
            .selectedIndex].value != player_one_default &&
            player_two_element.options[player_two_element
            .selectedIndex].value != player_two_default
    ) {
        return true;
    } else {
        return false;
    }

};


get_data();