import View from './View.js'
import previewView from './previewView.js'
import icons from 'url:../../img/icons.svg'

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list')
  _errorMessage = `No bookmarks yet! Please bookmark your favourite recipe :)`
  _message = ``

  addHandlerRender(handler) {
    window.addEventListener('load', handler)
  }

  _generateMarkup() {
    //console.log(this._data)
    return this._data
      .map((bookmark) => previewView.render(bookmark, false))
      .join('')
  }
}

export default new BookmarksView()
