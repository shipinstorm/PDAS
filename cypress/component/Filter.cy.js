import Filter from '../../src/components/SearchBar/Filter.js';

describe('<Filter>', () => {
  it('mounts', () => {
    // Set up some constants for the selectors
    const filterButtonSelector = '[id=demo-customized-button]';

    // Arrange
    cy.mount(
      <div>
        <Filter
          elementRef={{
            current: parent
          }}
          filterQueryFlag={{
            show: "All Shows",
          }}
        />
      </div>
    )
    // Assert
    cy.get(filterButtonSelector).should('have.text', 'Filter')
  })

  it('filter button clicking + fires open event with filter settings', () => {
    // Set up some constants for the selectors
    const filterButtonSelector = '[id=demo-customized-button]';
    const filterSearchSelector = '[id=filter-search]';
    const filterTitleSelector = '[class*="filter-title"]';
    const filterCheckLookSelector = '[class*="filter-check-look"]';

    // Arrange
    cy.mount(
      <div>
        <Filter
          elementRef={{
            current: parent
          }}
          filterQueryFlag={{
            show: "LEGACY",
          }}
        />
      </div>
    )
    // Act
    cy.get(filterButtonSelector).click()
    // Assert
    cy.get(filterSearchSelector).should('have.text', 'LEGACY')
    cy.get(filterTitleSelector).should('have.length', 4)
    cy.get(filterTitleSelector).should('contains.text', 'Display')
    cy.get(filterTitleSelector).should('contains.text', 'Status')
    cy.get(filterCheckLookSelector).should('contains.text', 'Look')
  })

  it('filter settings click + fires event with filter settings', () => {
    // Set up some constants for the selectors
    const filterButtonSelector = '[id=demo-customized-button]';
    const filterClearButtonSelector = '[class=filter-clear-button]';

    // Arrange
    const onFilterClearSpy = cy.spy().as('onFilterClearSpy')
    cy.mount(
      <div>
        <Filter
          elementRef={{
            current: parent
          }}
          filterQueryFlag={{
            show: "LEGACY",
            dept: {
              Anim: true
            },
          }}
          autoCompleteValue={[]}
          handleAutoCompleteValueChange={onFilterClearSpy}
        />
      </div>
    )
    // Act
    cy.get(filterButtonSelector).click()
    // Assert
    cy.get('.filter-check-anim > input').should('be.checked')
    cy.get('.filter-check-crowd > input').should('not.be.checked')
    // Act
    cy.get('.filter-check-crowd > input').click()
    // Assert
    cy.get('.filter-check-crowd > input').should('be.checked')
    cy.get('@onFilterClearSpy').should('have.been.calledWith', [
      {
        header: "dept",
        title: "Crowd"
      }
    ])
    // Act
    cy.get('.filter-check-crowd > input').click()
    // Assert
    cy.get('.filter-check-crowd > input').should('not.be.checked')
    cy.get('@onFilterClearSpy').should('have.been.calledWith', [])
    // Act
    cy.get(filterClearButtonSelector).click()
    // Assert
    cy.get('@onFilterClearSpy').should('have.been.calledWith', [])
  })
})