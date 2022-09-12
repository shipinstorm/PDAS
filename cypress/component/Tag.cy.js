import Tag from '../../src/components/SearchBar/Tag.js';

describe('<Tag>', () => {
  it('mounts', () => {
    // Set up some constants for the selectors
    const tagHeaderSelector = '[class=autocomplete-tag-header]';
    const tagTitleSelector = '[aria-label=autocomplete-tag-title]';

    // Arrange
    cy.mount(<Tag value={{header: "user", title: "lean"}} />)
    // Assert
    cy.get(tagHeaderSelector).should('contain.text', 'user')
    cy.get(tagTitleSelector).should('have.text', 'lean')
  })

  it('clicking + fires a removeTag event with header and title', () => {
    // Set up some constants for the selectors
    const tagCloseSelector = '[class=autocomplete-tag-close]';

    // Arrange
    const onRemoveTagSpy = cy.spy().as('onRemoveTagSpy')
    cy.mount(<Tag value={{header: "user", title: "lean"}} removeTag={onRemoveTagSpy} />)
    // Act
    cy.get(tagCloseSelector).click()
    // Assert
    cy.get('@onRemoveTagSpy').should('have.been.calledWith', 'user', 'lean')
  })
})