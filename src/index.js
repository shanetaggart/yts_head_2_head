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

        data_output.innerHTML = 'Attempting to pull data...';
        console.log('Attempting to pull data...');

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

        data_output.innerHTML = 'Responses OK, pulling data...';
        console.log('Responses OK, pulling data...');

        // Response is good, wait for data to pull.
        const ats_response_json = await ats_response.json();
        const atg_response_json = await atg_response.json();
        const stds_response_json = await stds_response.json();
        const stdg_response_json = await stdg_response.json();
        const atr_response_json = await atr_response.json();

        data_output.innerHTML = 'Storing data for use...';
        console.log('Storing data for use...');

        // Store the sets of data.
        const lifetime_set_data = ats_response_json;
        const lifetime_game_data = atg_response_json;
        const seasonal_set_data = stds_response_json;
        const seasonal_game_data = stdg_response_json;
        const lifetime_rankings_data = atr_response_json;

        // Insert placeholder option elements.
        player_one_select.innerHTML += `<option>Player One</option>`;
        player_two_select.innerHTML += `<option>Player Two</option>`;

        data_output.innerHTML = 'Creating list of players...';
        console.log('Creating list of players...');

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

        // Debugging
        console.group('DEBUGGING:');
        console.log('--------------------------------');
        console.log(`lifetime_set_data: `);
        console.log(lifetime_set_data);
        console.log(`lifetime_game_data: `);
        console.log(lifetime_game_data);
        console.log(`seasonal_set_data: `);
        console.log(seasonal_set_data);
        console.log(`seasonal_game_data: `);
        console.log(seasonal_game_data);
        console.log(`lifetime_rankings_data: `);
        console.log(lifetime_rankings_data);
        console.groupEnd('--------------------------------');

        // Assembling complete data structure.
        for (const key in lifetime_rankings_data) {
            
            let player_name = lifetime_rankings_data[key].Player;

            for (const key in lifetime_set_data) {

                if (lifetime_set_data[key] == player_name) {

                    lifetime_rankings_data.Sets.Lifetime = lifetime_set_data[key];

                }

            }

            for (const key in lifetime_game_data) {

                if (lifetime_game_data[key] == player_name) {

                    lifetime_rankings_data.Games.Lifetime = lifetime_rankings_data[key];

                }

            }

            for (const key in seasonal_set_data) {

                if (seasonal_set_data[key] == player_name) {

                    lifetime_rankings_data.Sets.Seasonal = seasonal_set_data[key];

                }

            }

            for (const key in seasonal_game_data) {

                if (seasonal_game_data[key] == player_name) {

                    lifetime_rankings_data.Games.Seasonal = seasonal_game_data[key];

                }
                
            }
        
        }

        // DEBUGGING AGAIN
        console.group('DEBUGGING AGAIN:');
        console.log('--------------------------------');
        console.log(`lifetime_rankings_data: `);
        console.log(lifetime_rankings_data);
        console.groupEnd('--------------------------------');

        // Watch select elements for changes.
        player_select_elements.forEach(select_element => {

            select_element.addEventListener("change", function() {

                // Store relevant player data.
                let player_one_name = player_one_select.options[player_one_select.selectedIndex].innerText;
                let player_two_name = player_two_select.options[player_two_select.selectedIndex].innerText;
                let player_one_rank = player_one_select.options[player_one_select.selectedIndex].value;
                let player_two_rank = player_two_select.options[player_two_select.selectedIndex].value;
                
                // Attempting to pull correct character data... need to establish fact sheet and combine data logically by player name otherwise the IDs don't match.
                // let set_data = lifetime_set_data[player_one_id][player_two_id];
                // let set_result = set_data.replace(' -- ', '|').split('|');
                // let player_one_win_ratio = parseFloat(set_result[0]) / (parseFloat(set_result[0]) + parseFloat(set_result[1]));
                // let player_two_win_ratio = parseFloat(set_result[1]) / (parseFloat(set_result[0]) + parseFloat(set_result[1]));
                // let player_one_character = atr_response_json[0].Characters;
                // let player_two_character = atr_response_json[1].Characters;
                
                // console.group(`New player selected for ${select_element.name}!`);
                // console.log(`${player_one_name} (${player_one_rank}) VS ${player_two_name} (${player_two_rank})`);
                // console.log(`${player_one_character} VS ${player_two_character}`);
                // console.log(`${set_result[0]} : ${set_result[1]}`);
                // console.groupEnd();

                data_output.innerHTML = 
                `
                <article class="player-stats">
                    <p class="player-stats__player_character">${player_one_rank}</p>
                    <p class="player-stats__player_character">${player_two_rank}</p>
                </article>
                <article class="player-stats">
                    <p class="player-stats__player_name">${player_one_name}</p>
                    <p class="player-stats__versus">VS</p>
                    <p class="player-stats__player_name">${player_two_name}</p>
                </article>
                `;
                // <article class="player-stats">
                //     <p class="player-stats__sets">${(player_one_win_ratio * 100).toFixed(2)}%</p>    
                //     <p class="player-stats__sets">${set_result[0]} -- ${set_result[1]}</p>
                //     <p class="player-stats__sets">${(player_two_win_ratio * 100).toFixed(2)}%</p>
                // </article>
                // `;

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

function getObjectByValue(array, key, value) {
    return array.filter(function (object) {
        return object[key] === value;
    });
};

get_data();