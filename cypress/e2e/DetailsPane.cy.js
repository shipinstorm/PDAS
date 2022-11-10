describe('<DetailsPane>', () => {
  // Set up some constants for the selectors
  const localPort = 3000;
  const metadataButtonSelector = '[id=show-all-metadata]';
  const editTextAreaSelector = '[id=editTextArea]';
  const saveButtonSelector = '[class*="glyphicon-save"]';
  const jobID = 35225742;
  const title = 'SCTEST-02.';

  it('Hide DetailsPane', () => {
      /**
       * Check if DetailsPane exists
       */

      // Arrange
      cy.visit('http://localhost:' + localPort + '/search?q=&sel=&exp=&details=false&log=false')
      // Assert
      cy.get('.object-details-content').should('not.exist');
  })

  it('Show Empty DetailsPane', () => {
      /**
       * Check if DetailsPane shows "Select job to view" string
       * Check if some elements exist(class=panel-default, class=detail-form)
       */

      // Arrange
      cy.visit('http://localhost:' + localPort + '/search?q=&sel=&exp=&details=true&log=false')
      // Assert
      cy.get('.object-details-content').contains('Select job to view');
      cy.get('.panel-default').should('not.exist');
      cy.get('.detail-form').should('not.exist');
  })

  it('Show DetailsPane with Data', () => {
      /**
       * Check if DetailsPane; shows "Select job to view" string
       * Check if some rows exist(Job ID:, Frames)
       * Check if "Show All Metadata" button exist
       * Check if jobID is same
       */

      // Arrange
      cy.visit('http://localhost:' + localPort + '/search?q=&sel=' + jobID + '&exp=&details=true&log=false')
      // Assert
      cy.contains('.object-details-content', 'Select job to view').should('not.exist');
      cy.get('.object-details-content a').should('have.attr', 'href').and('include', jobID);
      cy.get('.object-details-content').contains('Job ID:');
      cy.get('.object-details-content').contains('Frames');
      cy.get(metadataButtonSelector).should('exist');
  })

  it('Expand DetailsPane with Show All MetaData', () => {
      /**
       * Check if show more panel exist
       * Check if there are two jobIDs(jobID on top, jobID from did row) after button click
       * Check if some rows exist(did, icoda_fullname, icoda_username)
       */

      // Arrange
      cy.visit('http://localhost:' + localPort + '/search?q=&sel=' + jobID + '&exp=&details=true&log=false')
      // Assert
      cy.get('.show-more').should('not.exist');
      cy.get('.row:contains("' + jobID + '")').should('have.length', 1);
      // Act
      cy.get(metadataButtonSelector).click()
      // Assert
      cy.get('.show-more').should('exist');
      cy.get('.object-details-content').contains('did');
      cy.get('.object-details-content').contains('icoda_fullname');
      cy.get('.object-details-content').contains('icoda_username');
      cy.get('.row:contains("' + jobID + '")').should('have.length', 2);
  })

  it('DetailsPane Edit, Save, Cancel', () => {
      /**
       * Check if title changes to edit mode after click
       * Check if save button appears after title edit click
       */

      // Arrange
      cy.visit('http://localhost:' + localPort + '/search?q=&sel=' + jobID + '&exp=&details=true&log=false')
      // Assert
      cy.get(editTextAreaSelector).should('not.exist');
      cy.get(saveButtonSelector).should('not.exist');
      // Act
      cy.get('h5.editable').click()
      // Assert
      cy.get(editTextAreaSelector).contains(title);
      cy.get(saveButtonSelector).should('exist');
  })
})