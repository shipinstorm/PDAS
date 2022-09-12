import SearchBar from '../../src/components/SearchBar/SearchBar.js';

describe('<SearchBar>', () => {
  it('mounts', () => {
    // Set up some constants for the selectors
    const tagsStandardSelector = '[id=tags-standard]';
    const searchFilterButtonSelector = '[id=demo-customized-button]';

    // Arrange
    cy.mount(
      <SearchBar
        filterQueryFlag={
          {
            status: {},
            dept: {},
            type: {},
            display: {},
            show: "All Shows",
            after: "2022-09-08T16:02"
          }
        }
        autoCompleteValue={[]}
      />
    )
    // Assert
    cy.get(tagsStandardSelector).should('have.length', 1)
    cy.get(searchFilterButtonSelector).should('have.length', 1)
  })
})