async function get_data() {

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

    // Attempt to pull data.
    try {

        // writeLog('Attempting to pull data...');

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

        // writeLog('Responses OK, pulling data...');

        // Response is good, wait for data to pull.
        const ats_response_json = await ats_response.json();
        const atg_response_json = await atg_response.json();
        const stds_response_json = await stds_response.json();
        const stdg_response_json = await stdg_response.json();
        const atr_response_json = await atr_response.json();

        // writeLog('Storing data for use...');

        // Store the sets of data.
        const lifetime_set_data = ats_response_json;
        const lifetime_game_data = atg_response_json;
        const seasonal_set_data = stds_response_json;
        const seasonal_game_data = stdg_response_json;
        const lifetime_rankings_data = atr_response_json;

        // Insert placeholder option elements.
        player_one_select.innerHTML += `<option>Player One</option>`;
        player_two_select.innerHTML += `<option>Player Two</option>`;

        // writeLog('Creating list of players...');

        // Create option elements for each player from the fact sheet.
        for (const key in atr_response_json) {

            let player = atr_response_json[key].Player;
            let rank = atr_response_json[key].Rank

            if (atr_response_json[key].Player.includes(' | ')) {

                player = atr_response_json[key].Player.split(' | ');
                player = player[1];

            }

            player_one_select.innerHTML += `<option value="${rank}">${player}</option>`;
            player_two_select.innerHTML += `<option value="${rank}">${player}</option>`;
                
        }

        // writeLog('Normalizing data...');

        // Replacing key references with player names.
        for (const key in lifetime_set_data) {
            let player_name = cleanPlayerName(lifetime_set_data[key]["field2"]);
            lifetime_set_data[`${player_name}`] = lifetime_set_data[key];
            delete lifetime_set_data[key];
        }

        for (const key in lifetime_game_data) {
            let player_name = cleanPlayerName(lifetime_game_data[key]["field2"]);
            lifetime_game_data[`${player_name}`] = lifetime_game_data[key];
            delete lifetime_game_data[key];
        }

        for (const key in seasonal_set_data) {
            let player_name = cleanPlayerName(seasonal_set_data[key]["field2"]);
            seasonal_set_data[`${player_name}`] = seasonal_set_data[key];
            delete seasonal_set_data[key];
        }

        for (const key in seasonal_game_data) {
            let player_name = cleanPlayerName(seasonal_game_data[key]["field2"]);
            seasonal_game_data[`${player_name}`] = seasonal_game_data[key];
            delete seasonal_game_data[key];
        }

        delete lifetime_set_data[""];
        delete lifetime_game_data[""];
        delete seasonal_set_data[""];
        delete seasonal_game_data[""];

        // Assembling complete data structure.
        for (const ltr_key in lifetime_rankings_data) {
            
            // Initialize the new objects for later assignment.
            lifetime_rankings_data[ltr_key].Sets = {Lifetime: {}, Seasonal: {}};
            lifetime_rankings_data[ltr_key].Games = {Lifetime: {}, Seasonal: {}};

            let player_name = lifetime_rankings_data[ltr_key].Player;

            for (const lts_key in lifetime_set_data) {
            
                if (lifetime_set_data[lts_key]["field2"] == player_name) {
                    
                    lifetime_rankings_data[ltr_key].Sets.Lifetime = lifetime_set_data[lts_key];

                }
                
            }

            for (const ltg_key in lifetime_game_data) {

                if (lifetime_game_data[ltg_key]["field2"] == player_name) {

                    lifetime_rankings_data[ltr_key].Games.Lifetime = lifetime_game_data[ltg_key];

                }

            }

            for (const ss_key in seasonal_set_data) {

                if (seasonal_set_data[ss_key]["field2"] == player_name) {

                    lifetime_rankings_data[ltr_key].Sets.Seasonal = seasonal_set_data[ss_key];

                }

            }

            for (const sg_key in seasonal_game_data) {

                if (seasonal_game_data[sg_key]["field2"] == player_name) {

                    lifetime_rankings_data[ltr_key].Games.Seasonal = seasonal_game_data[sg_key];

                }
                
            }
        
        }

        // Debugging
        // console.group('DEBUGGING:');
        // console.log('--------------------------------');
        // console.log(`lifetime_set_data: `);
        // console.log(lifetime_set_data);
        // console.log(`lifetime_game_data: `);
        // console.log(lifetime_game_data);
        // console.log(`seasonal_set_data: `);
        // console.log(seasonal_set_data);
        // console.log(`seasonal_game_data: `);
        // console.log(seasonal_game_data);
        // console.log(`lifetime_rankings_data: `);
        // console.log(lifetime_rankings_data);
        // console.groupEnd('--------------------------------');

        // writeLog('Ready!');

        // Watch select elements for changes.
        player_select_elements.forEach(select_element => {

            select_element.addEventListener("change", function() {

                // Store player data from the select elements.
                let player_one_name = player_one_select.options[player_one_select.selectedIndex].innerText;
                let player_one_pr = player_one_select.options[player_one_select.selectedIndex].value;
                let player_two_name = player_two_select.options[player_two_select.selectedIndex].innerText;
                let player_two_pr = player_two_select.options[player_two_select.selectedIndex].value;

                console.log(lifetime_rankings_data);
                
                for (const key in lifetime_rankings_data) {
                    
                    if (lifetime_rankings_data[key].Player == player_one_name) {
                        
                        // Store relevant player data.
                        let player_one_characters = lifetime_rankings_data[key].Characters;
                        let player_one_lts = lifetime_rankings_data[key].Lifetime.Sets;
                        let player_one_ltg = lifetime_rankings_data[key].Lifetime.Games;
                        let player_one_ss = lifetime_rankings_data[key].Seasonal.Sets;
                        let player_one_sg = lifetime_rankings_data[key].Seasonal.Games;

                    }
                    
                }

                console.log('this is what I found:');
                console.log(player_one_name, player_one_pr, player_one_characters, player_one_lts, player_one_ltg, player_one_ss, player_one_sg);
                
                let player_two_characters;
                let player_two_lts;
                let player_two_ltg;
                let player_two_ss;
                let player_two_sg;

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
                        Seasonal Stats
                        <br>
                        <br>
                        Seasonal Sets: ${player_one_ss}
                        <br>
                        Seasonal Games: ${player_one_sg}
                    </p>
                    <p>VS</p>
                    <p>
                        P1: ${player_two_name} (${player_two_characters})
                        <br>
                        PR #${player_two_pr}
                        <br>
                        <br>
                        Lifetime Stats
                        <br>
                        Lifetime Sets: ${player_two_lts}
                        <br>
                        Lifetime Games: ${player_two_ltg}
                        <br>
                        Seasonal Stats
                        <br>
                        <br>
                        Seasonal Sets: ${player_two_ss}
                        <br>
                        Seasonal Games: ${player_two_sg}
                    </p>
                </article>
                `;

            });

        });

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

function getObjectByValue(array, key, value) {
    return array.filter(function (object) {
        return object[key] === value;
    });
};

get_data();