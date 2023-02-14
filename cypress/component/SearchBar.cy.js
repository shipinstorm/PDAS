import SearchBar from '../../src/components/SearchBar/SearchBar.js';
import { Provider } from 'react-redux'
import store from '../../src/store/store.js'

describe('<SearchBar>', () => {
  it('mounts', () => {
    // Set up some constants for the selectors
    const tagsStandardSelector = '[id=tags-standard]';
    const searchFilterButtonSelector = '[id=demo-customized-button]';

    // Arrange
    cy.mount(
      <Provider store={store}>
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
      </Provider>
    )
    // Assert
    cy.get(tagsStandardSelector).should('have.length', 1)
    cy.get(searchFilterButtonSelector).should('have.length', 1)
  })
})