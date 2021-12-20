import { async } from 'regenerator-runtime'
import { API_URL, RES_PER_PAGE, KEY } from './config'
// import { getJSON, sendJSON } from './helpers'
import { AJAX } from './helpers'

export const state = {
  recipe: {},
  search: {
    query: {},
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
}

const createRecipeObject = (data) => {
  const { recipe } = data.data
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    //this is a nice trick to conditionally add properties to object
    ...(recipe.key && { key: recipe.key }),
  }
}

export const loadRecipe = async (id) => {
  try {
    //await is used bcz getJSON() is an asyn fn, thus return a promise.
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`)
    state.recipe = createRecipeObject(data)

    //we are loading the recipe to display directly from API, so there will be no 'bookmarked' property
    //on it. So if a bookmarked recipe rerendered(again loading from recipe) we want to set its
    //bookmarked property to true.
    //Also by exec this if-else block every loading recipe will get a bookmarked property either true or
    //false
    if (state.bookmarks.some((bookmark) => bookmark.id === id))
      state.recipe.bookmarked = true
    else state.recipe.bookmarked = false
  } catch (err) {
    //console.error(err)
    throw err
  }
}

export const loadSearchResults = async (query) => {
  try {
    state.search.query = query

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)
    //console.log(data)

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        //this is a nice trick to conditionally add properties to object
        ...(rec.key && { key: rec.key }),
      }
    })

    //to reset to page 1 when loading a search term's result for 1st time
    state.search.page = 1
  } catch (err) {
    //console.error(err)
    throw err
  }
}

// implementing pagination
export const getSearchResultsPage = (page = state.search.page) => {
  state.search.page = page

  const start = (page - 1) * state.search.resultsPerPage // 0
  const end = page * state.search.resultsPerPage // 10

  return state.search.results.slice(start, end)
}

export const updateServings = (newServings) => {
  state.recipe.ingredients.forEach((ing) => {
    //newQt = (oldQt * newServings)/ oldServings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings
  })

  state.recipe.servings = newServings
}

const persistBookmarks = () => {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = (recipe) => {
  //Add bookmark
  state.bookmarks.push(recipe)

  //mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true

  persistBookmarks()
}

export const deleteBookmark = (id) => {
  //delete bookmark
  const index = state.bookmarks.findIndex((el) => el.id === id)
  state.bookmarks.splice(index, 1)

  //mark current recipe as not bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false

  persistBookmarks()
}

const init = () => {
  //Not storing it directly to state bcz if the bookmarks is empty, it will be not defined.
  const storage = localStorage.getItem('bookmarks')
  if (storage) state.bookmarks = JSON.parse(storage)
}

init()
//console.log(state.bookmarks)

//Debugger fn, only need in dev mode
const clearBookmarks = () => {
  localStorage.clear('bookmarks')
}

export const uploadRecipe = async (newRecipe) => {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map((ing) => {
        ingArr = ing[1].split(',').map((el) => el.trim())
        // ingArr = ing[1].replaceAll(' ', '').split(',')
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong Ingredient format! Please use the correct format :)'
          )

        const [quantity, unit, description] = ingArr

        return { quantity: quantity ? +quantity : null, unit, description }
      })
    //This Obj will be opp of state.recipe(considering property names), we want to send
    // recipe as like how it is stored in API.
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    }
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe)
    state.recipe = createRecipeObject(data)
    addBookmark(state.recipe)
  } catch (err) {
    throw err
  }
}
