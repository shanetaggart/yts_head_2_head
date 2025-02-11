async function get_data() {

    // Constants
    const url = 'http://127.0.0.1:8082/src/data/all_time_sets.json';
    const player_select_elements = document.querySelectorAll('select');
    const player_one_select = document.getElementById('player_one');
    const player_two_select = document.getElementById('player_two');
    const data_output = document.getElementById('data');

    // Attempt to pull data.
    try {

        const response = await fetch(url);

        // Failure to get a response.
        if (!response.ok) {

            throw new Error(`Response status: ${response.status}`);

        }

        // Response is good, wait for data to pull.
        const json = await response.json();

        // Store the full set of data.
        const lifetime_set_data = json;

        // Build players array.
        const players = json[0]
        const players_array = [];

        for (const key in players) {
        
            players_array.push([key, players[key]]);
                
        }

        // Create option elements for each player.
        players_array.forEach(player => {

            if(player[1] != ''){

                player_one_select.innerHTML += `<option value="${player[0]}">${player[1]}</option>`;
                player_two_select.innerHTML += `<option value="${player[0]}">${player[1]}</option>`;

            }

        });

        // Watch select elements for changes.
        player_select_elements.forEach(select_element => {

            select_element.addEventListener("change", function() {

                // player_one | player_two
                let player_one_id = player_one_select.value;
                let player_two_id = player_two_select.value;
                let player_one_name = player_one_select.options[player_one_select.selectedIndex].innerText;
                let player_two_name = player_two_select.options[player_two_select.selectedIndex].innerText;
                let set_data = lifetime_set_data[player_one_id][player_two_id];
                let set_result = set_data.replace(' -- ', '|').split('|');
                let player_one_win_ratio = parseFloat(set_result[0]) / (parseFloat(set_result[0]) + parseFloat(set_result[1]));
                let player_two_win_ratio = parseFloat(set_result[1]) / (parseFloat(set_result[0]) + parseFloat(set_result[1]));

                console.group(`New player selected for ${select_element.name}!`);
                console.log(`${player_one_name} (${player_one_id}) VS ${player_two_name} (${player_two_id})`);
                console.log(`${set_result[0]} : ${set_result[1]}`);
                console.groupEnd();

                data_output.innerHTML = 
                `
                <article class="player-stats">
                    <p class="player-stats__player_name">${player_one_name}</p>
                    <p class="player-stats__versus">VS</p>
                    <p class="player-stats__player_name">${player_two_name}</p>
                </article>
                <article class="player-stats">
                    <p class="player-stats__sets">${(player_one_win_ratio * 100).toFixed(2)}%</p>    
                    <p class="player-stats__sets">${set_result[0]} -- ${set_result[1]}</p>
                    <p class="player-stats__sets">${(player_two_win_ratio * 100).toFixed(2)}%</p>
                </article>
                `;

            });

        });

    // Pulling data failed.
    } catch (error) {

        console.error(error.message);

    }

}

get_data();