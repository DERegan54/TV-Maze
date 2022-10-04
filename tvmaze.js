"use strict";

const MISSING_IMAGE_URL = "https://tinyurl.com/missing-tv";
const TVMAZE_API_URL = "http://api.tvmaze.com/";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios({
    url: `${TVMAZE_API_URL}search/shows?q=${term}`,
    method: "GET",
  });
  console.log(response)
  return response.data.map(result => {
    const show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    }; 
  });
}

/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows) {
  $showsList.empty();
  console.log(shows);
  if (shows.length > 0) {
    for (let show of shows) {
      const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 mr-3">
            <div class="media-body">
              <h5 class="text-primary">${show.name}</h5>
              <div><small>${show.summary}</small></div>
              <button class="btn btn-outline-light btn-sm Show-getEpisodes">
                Episodes
             </button>
           </div>
         </div>  
       </div>
      `);
    $showsList.append($show);
    }
  } else {
    alert ("Sorry, no shows match that search term!")
  }
} 



/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios({
    url: `${TVMAZE_API_URL}shows/${id}/episodes`,
    method: "GET",
  });
  console.log(response)
  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number, 
  }));
}

/** Given list of episodes, create markup for each and add to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(
      `<li>
      ${episode.name}
      (season ${episode.season}, episode ${episode.number})
      </li>
      `);
    $episodesList.append($item);
  }
  $episodesArea.show();
}

/** Handle click on episodes button: get episodes for show and display */

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest("[data-show-id]").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  console.log(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);

$('.btn-close, .modal-footer .btn-secondary').click(function() {
  $( "#episodes-area" ).hide();
});
 



