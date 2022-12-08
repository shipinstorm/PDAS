describe('<LogPane>', () => {
    // Set up some constants for the selectors
    const localPort = 3000;
    const logButtonSelector = '[id=logPaneButton]';
  
    it('Hide LogPane', () => {
        // Check if LogPane exists

        // Arrange
        cy.visit('http://localhost:' + localPort + '/search?q=&sel=&exp=&details=false&log=false')
        // Assert
        cy.get('.app-sidebar').invoke('outerHeight').should('be.lt', 10);
    })
  
    it('Show Empty LogPane', () => {
        /**
         * Check if LogPane shows "Select job to view" string
         * Check if some elements exist(class=panel-default, class=detail-form)
         */
  
        // Arrange
        cy.visit('http://localhost:' + localPort + '/search?q=&sel=&exp=&details=false&log=true')
        // Assert
        cy.get('.app-sidebar').invoke('outerHeight').should('be.gt', 199);
        // Act
        cy.get(logButtonSelector).click();
        // Assert
        cy.get('.app-sidebar').invoke('outerHeight').should('be.lt', 10);
    })
})