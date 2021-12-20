import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

import { MODAL_CLOSE_SEC } from './config.js'

//imports for polyfills
import 'core-js/stable' //polyfilling es6 features except async fn
import 'regenerator-runtime/runtime' //polyfilling async fn

if (module.hot) {
  module.hot.accept()
}

// https://forkify-api.herokuapp.com/v2

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)
    //console.log(id)

    //when we are loading 1st time, only root url without id will be haven, so if this guard clause not
    //given the spinner will displayed forever bcz we fetch with empty id.
    if (!id) return

    recipeView.renderSpinner()

    // 0)Update result view to mark selected result
    resultsView.update(model.getSearchResultsPage())

    // 1) update bookmark view to mark selected recipe
    //debugger
    bookmarksView.update(model.state.bookmarks)

    // 2) Loading Recipe
    await model.loadRecipe(id)

    // 3 ) Rendering recipe
    recipeView.render(model.state.recipe)
  } catch (err) {
    console.error(err)
    recipeView.renderError()
  }
}

const controlSearchResults = async () => {
  try {
    // 1) Get search query
    const query = searchView.getQuery()
    if (!query) return

    resultsView.renderSpinner()
    //console.log(resultsView)

    // 2) Load search Results
    await model.loadSearchResults(query)

    // 3) Render search results
    resultsView.render(model.getSearchResultsPage())

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search)
  } catch (err) {
    console.error(err)
  }
}

const controlPagination = (goToPage) => {
  // 3) Render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage))

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search)
}

const controlServings = (newServings) => {
  //Update the recipe servings (in state)
  model.updateServings(newServings)

  //Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = () => {
  // 1) Add/Remove a bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)

  // 2) Update recipe view
  recipeView.update(model.state.recipe)

  // 4) Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async (newRecipe) => {
  try {
    //load spinner
    addRecipeView.renderSpinner()

    //Only by using async/await we are handling this fn as a fn that returns a promise
    //so the rejected promise can actually get caught in the catch block.
    //Upload the new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    // Render recipe
    recipeView.render(model.state.recipe)

    // Success message
    addRecipeView.renderMessage()

    // Render bookmarkview
    //we are not using update here bcz we want to insert a new element.
    bookmarksView.render(model.state.bookmarks)

    // Change ID in the URL.
    //This will allow us to change the URL without reloading the page, pushState
    //takes 3 arg, 1st state, 2nd title, 3rd URL.
    //We could also do all kinds of other stuff with the history API, like for eg going
    //back and forth just like we clicking fwd & bwd buttons in the browser.
    //window.history.back() (automatically going back to the last page).
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window to see the rendered recipe
    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    console.error('🤢🤢🤢', err)
    addRecipeView.renderError(err.message)
  }
}

//Subscriber
const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()
