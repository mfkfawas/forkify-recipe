// we are importing the icons from this file, we explicitly given this bcoz otherwise parcel cant understand
//tut - 288 - Rendering the recipe - 16:00
import icons from 'url:../../img/icons.svg'

//we exporting the class itself bcz we r not going to create any instance of this View.
//We will only use it as a parent class of other child views.
export default class View {
  _data

  //when we want to insert a new element use render, when we want to update certain
  //parts of existing or displayed element use update.
  //Standard JSdoc format
  /**
   *Render the recieved obj to DOM
   * @param {Object | Object[]} data The data to be rendered(e.g. a recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @author mfkfawas
   * @todo Finish implementation
   */
  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError()

    this._data = data
    const markup = this._generateMarkup()

    if (!render) return markup

    this._clear()
    this._parentElement.insertAdjacentHTML('afterbegin', markup)
  }

  //when we want to insert a new element use render, when we want to update certain
  //parts of existing or displayed element use update.
  //This method will only update text and attributes in DOM, so without having to
  //rerender the entire view.
  update(data) {
    // if (!data || (Array.isArray(data) && data.length === 0))
    //   return this.renderError()

    this._data = data
    //here we create new markup but donot render it, instead then compare the new HTML
    //to the current HTML and then only change text and attributes that actually have
    //changed from old version to the new version
    const newMarkup = this._generateMarkup()

    //convert the string to real DOM node objects(Virtual DOM),
    //DOM that lives on m/y not on page.
    const newDOM = document.createRange().createContextualFragment(newMarkup)

    //converting nodeList to Array
    const newElements = Array.from(newDOM.querySelectorAll('*'))
    const curElements = Array.from(this._parentElement.querySelectorAll('*'))

    //we need index to loop over two arrays
    newElements.forEach((newEl, i) => {
      const curEl = curElements[i]
      //isEqualNode compares the content of both node
      //console.log(curEl, newEl.isEqualNode(curEl))

      //Updates changed text.
      //if we didnt used the second condition here, bcz when som changes happen to a
      //node, the code inside this if block replace the entire container's content
      //(here div.recipe__details) with the newEl.textContent. So all other
      //child elements(thier classes have much UI styling) are replaced(like overrided).
      //So 2nd condition is to determine if the elements that are text, bcz that is
      //the only thing we want to replace.
      //This if block is only exec on elements that contains text directly.
      if (
        !newEl.isEqualNode(curEl) &&
        //nodeValue property is available on all nodes, value of it will be null if the
        //node is an element(look MDN), but if it is text then it return the content of
        //the text node
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        //This wil only update the text of an element. We also want to update the
        // attribute(dataset attr have the value), so next if block is to update
        //attribute of changed elements
        curEl.textContent = newEl.textContent
      }

      //updates changed attribute
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value)
        )
      }
    })
  }

  _clear() {
    this._parentElement.innerHTML = ''
  }

  renderSpinner() {
    const markup = `
    <div class="spinner">
    <svg>
      <use href="${icons}#icon-loader"></use>
    </svg>
  </div>
    `
    this._clear()
    this._parentElement.insertAdjacentHTML('afterbegin', markup)
  }

  renderError(message = this._errorMessage) {
    const markup = `
    <div class="error">
    <div>
      <svg>
        <use href="${icons}#icon-alert-triangle"></use>
      </svg>
    </div>
    <p>${message}</p>
  </div>
    `
    this._clear()
    this._parentElement.insertAdjacentHTML('afterbegin', markup)
  }

  renderMessage(message = this._message) {
    const markup = `
    <div class="message">
    <div>
      <svg>
        <use href="${icons}#icon-smile"></use>
      </svg>
    </div>
    <p>${message}</p>
  </div>
    `
    this._clear()
    this._parentElement.insertAdjacentHTML('afterbegin', markup)
  }
}
