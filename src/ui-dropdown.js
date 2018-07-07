import convertService from './convert.service.js';

const convert = new convertService();

export default class Dropdown {

  constructor( element, users, error ) {
    if( !users ) {
      element.innerText = error;
      element.className = 'dpd--error';
      return;
    }
    this.usersCollection = JSON.parse( users );
    this.dropdownBlock = element;
    this.isMultiselect = element.getAttribute( 'multiselect' ) !== null;
    this.isNeedPhoto = element.getAttribute( 'photo' ) !== null;
    this.isServerSearch = element.getAttribute( 'serversearch' ) !== null;
    this.placeholder = element.getAttribute( 'placeholder' ) || "Введите имя друга";
    this.buttonText = element.getAttribute( 'button-text' ) || "Добавить";
    this.notFoundText = element.getAttribute( 'not-found-text' ) || "Пользователь не найден";
    this.usersListActiveItem = null;
    this.render();
    this.selectionBlock = this.dropdownBlock.querySelector( '#dpd-selection' );
    this.usersListBlock = this.dropdownBlock.querySelector( '#dpd-users' );
    this.usersList = this.dropdownBlock.querySelector( '#dpd-users-list' );
    this.input = this.dropdownBlock.querySelector( '#dpd-input' );
    this.addButton = this.dropdownBlock.querySelector( '#dpd-add-button' );
    this.selectedUsersCollection = [];
    this.setListeners();

  }

  filterUsers( data, query ){

    let correctQuery = query;
    const stringifyData = JSON.stringify( data.map(( item ) => item.first_name.toLowerCase() + item.last_name.toLowerCase()));
    let filteredData;
    const queryesWithCorrection = {
      wrongEnToEn: convert.wrongEnToEn( query ),
      wrongRuToRu: convert.wrongRuToRu( query ),
      translitEnToRu: convert.translitEnToRu( query ),
      translitRuToEn: convert.translitRuToEn( query )
    };
    for( let key in queryesWithCorrection ) {
      if(stringifyData.indexOf( queryesWithCorrection[key] ) !== -1) correctQuery = queryesWithCorrection[key];
    }
    filteredData = data.filter(( item ) => {
      return item.first_name.toLowerCase().indexOf( correctQuery ) !== -1 || item.last_name.toLowerCase().indexOf( correctQuery ) !== -1;
    })
    return filteredData.length ? filteredData : null;

  }

  createUsersList( data ){

    const ul = document.createElement( 'ul' );
    ul.setAttribute( 'id', 'dpd-users-list' );
    ul.className = 'dpd__users-list';
    if( data ){
      data.forEach(( user ) => {
        ul.appendChild( this.createUsersListItem( `${user.first_name} ${user.last_name}`, user.id, user.photo_50 ));
      });
      const activeItem = ul.children[0]
      activeItem.classList.add( 'pd__users-list-item--active' );
      this.usersListActiveItem = activeItem;

      return ul;
    }
    ul.appendChild(this.createUsersListItem());
    return ul;

  }

  updateUsersList( data ){

    const newUsersList = this.createUsersList( data );
    newUsersList.setAttribute( 'id', 'dpd-users-list' );
    newUsersList.className = 'dpd__users-list';
    this.usersListBlock.replaceChild( newUsersList, this.usersList );
    this.usersList = newUsersList;

  }

  createUsersListItem( name, id, photo ){

    const li = document.createElement( 'li' );
    if( !name ){
      li.textContent = this.notFoundText;
      li.setAttribute( 'disabled', 'true' );
      return li;
    }
    if ( this.isNeedPhoto ) {
      const img = document.createElement( 'img' );
      img.setAttribute( 'src', photo );
      img.setAttribute( 'user-id', id );
      li.appendChild( img );
    }
    const span = document.createElement( 'span' );
    span.innerText = name;
    span.setAttribute( 'user-id', id );
    li.setAttribute( 'user-id', id );
    li.className = 'pd__users-list-item';
    li.appendChild( span );
    return li;

  }

  deleteUser( id, element ){

    this.selectionBlock.removeChild( element.parentElement );
    let user;
    for(let i = 0; i < this.selectedUsersCollection.length; i++){
      if(this.selectedUsersCollection[i].id === id){
        user = this.selectedUsersCollection[i];
        this.selectedUsersCollection.splice( i, 1 );
        break;
      }
    }
    if(!this.selectedUsersCollection.length) {
      this.input.classList.remove( 'dpd__input--disabled' );
      this.addButton.classList.remove( 'dpd__add-button--show' );
      this.input.focus();
    }
    this.usersCollection.push( user );
    this.updateUsersList( this.usersCollection );
  }

  selectUser( id ){

    let indexOfUser = 0;
    for( let i = 0; i < this.usersCollection.length; i++ ){
      if( this.usersCollection[i].id === id ){
        indexOfUser = i;
        break;
      }
    }
    if( !this.isMultiselect ){
      if( this.selectedUsersCollection.length ) this.usersCollection.push( this.usersCollection[indexOfUser] );
      this.selectedUsersCollection[0] = this.usersCollection.splice( indexOfUser, 1 )[0];
      this.input.classList.add('dpd__input--disabled');

    } else {
        this.selectedUsersCollection.push( this.usersCollection.splice( indexOfUser, 1 )[0] );
        this.addButton.classList.add( 'dpd__add-button--show' );
        this.input.classList.add( 'dpd__input--disabled' );
    }
    this.updateUsersList( this.usersCollection );
    this.createSelection();
    this.input.value = '';
  }

  createSelection(){ // create => render Посмотреть что лучше: fragment или insert.

    this.selectionBlock.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for( let i = 0; i < this.selectedUsersCollection.length; i++ ){
      fragment.appendChild( this.createSelectionButton( this.selectedUsersCollection[i] ) );
    }
    fragment.appendChild(this.input);
    fragment.appendChild(this.addButton);
    this.selectionBlock.appendChild(fragment);

  }

  createSelectionButton( user ){

    const label = document.createElement( 'span' );
    const deleteBtn = document.createElement( 'button' );
    label.innerText = `${user.first_name} ${user.last_name}`;
    deleteBtn.setAttribute( 'user-id', user.id );
    label.className = 'dpd__user-label';
    deleteBtn.className = 'dpd__user-button';
    label.appendChild( deleteBtn );
    return label;
  }

  setListeners(){

    document.addEventListener( 'keydown', ( event ) => {
      if( !this.usersList.classList.contains( 'dpd__users-list--show' ) ) return;
      switch ( event.key ){
        case ( 'Escape' ):
          this.usersList.classList.remove( 'dpd__users-list--show' );
          this.input.focus();
        break;
        case ( 'Enter' ):
          this.selectUser( this.usersListActiveItem.getAttribute('user-id') );
        break;
        case ( 'ArrowDown' ):
          event.preventDefault();
          const next = this.usersListActiveItem.nextElementSibling;
          if(next){
            this.usersListActiveItem.classList.remove( 'pd__users-list-item--active' );
            next.classList.add( 'pd__users-list-item--active' );
            this.usersListActiveItem = next;
          }
        break;
        case ( 'ArrowUp' ):
          event.preventDefault();
          const prev = this.usersListActiveItem.previousElementSibling;
          if( prev ){
            this.usersListActiveItem.classList.remove( 'pd__users-list-item--active' );
            prev.classList.add( 'pd__users-list-item--active' );
            this.usersListActiveItem = prev;
          }
        break;
      }
    });

    this.input.addEventListener( 'input', ( event ) => {
      this.updateUsersList(this.filterUsers(this.usersCollection, event.target.value));
      this.usersList.classList.add( 'dpd__users-list--show' );
    });

    document.addEventListener( 'click', ( event ) => {
      let clickOutside = true;
      for( let i = 0; i < event.path.length; i++ ){
        if( event.path[i] === this.dropdownBlock ){
          clickOutside = false;
          break;
        }
      }
      if( clickOutside ) this.usersList.classList.remove('dpd__users-list--show');
    });

    this.usersListBlock.addEventListener('click', ( event ) => {
      let userId = Number( event.target.getAttribute( 'user-id' ) );
      this.selectUser( userId );
    });

    this.usersListBlock.addEventListener( 'mouseover', ( event ) => {
      const target = event.target.tagName === 'LI' ? event.target : event.target.parentElement;
      this.usersListActiveItem.classList.remove( 'pd__users-list-item--active' );
      target.classList.add( 'pd__users-list-item--active' );
      this.usersListActiveItem = target;
    });

    this.selectionBlock.addEventListener('click', ( event ) => {
      const target = event.target;
      if( target === event.currentTarget ) {
        this.usersList.classList.toggle( 'dpd__users-list--show' );
        this.addButton.classList.remove( 'dpd__add-button--show' );
        if( this.isMultiselect ){
          this.input.classList.remove( 'dpd__input--disabled' );
          this.input.focus();
        }
        if( this.isMultiselect
          && this.selectedUsersCollection.length
          && !this.usersList.classList.contains( 'dpd__users-list--show' ) ){
          this.input.classList.add('dpd__input--disabled');
          this.addButton.classList.add('dpd__add-button--show');
        }
      }
      else if( target.id === 'dpd-add-button' ){
        this.addButton.classList.remove( 'dpd__add-button--show' );
        this.input.classList.remove( 'dpd__input--disabled' );
        this.input.focus();
      }
      else if( target.tagName === "BUTTON"
        && target.id !== 'dpd-add-button' ){
        let userId = Number(target.getAttribute( 'user-id' ) );
        this.deleteUser( userId, target );
      }
    });
  }

  render(){

    const fragment = document.createDocumentFragment();
    const selection = document.createElement( 'div' );
    const users = document.createElement( 'div' );
    const addButton = document.createElement( 'button' );
    const input = document.createElement( 'input' );
    const list = this.createUsersList( this.usersCollection );
    selection.setAttribute( 'id', 'dpd-selection' );
    selection.className = 'dpd__selection';
    users.setAttribute( 'id', 'dpd-users' );
    users.className = 'dpd__users';
    addButton.setAttribute( 'id', 'dpd-add-button' );
    addButton.className = 'dpd__add-button';
    addButton.innerText = this.buttonText;
    input.setAttribute( 'id', 'dpd-input' );
    input.className = 'dpd__input';
    input.setAttribute( 'placeholder', this.placeholder );
    selection.appendChild( addButton );
    selection.appendChild( input );
    users.appendChild( list );
    fragment.appendChild( selection );
    fragment.appendChild( users );
    this.dropdownBlock.appendChild( fragment );

    if( input === document.getElementsByTagName( 'input' )[0] ){
      input.focus();
    }

  }

}

// scroll в списке
// может сделать preloader?
// подсветка букв при поиске
// пользователь не найден - стили
