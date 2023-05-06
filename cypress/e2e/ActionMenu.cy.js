describe("<ActionMenu>", () => {
  // Set up some constants for the selectors
  const localPort = 3000;
  const jobID = "35225741";
  const graphDataSelector = "[id=jobID-" + jobID + "]";
  const killActionSelector = "[class*=killAction]";
  const viewDetailsSelector = "[class*=viewDetails]";
  const jobVisibilitySelector = "[class*=jobVisibility]";
  const requeneActionRunningSelector = "[class*=requeueAction-Running]";
  const modalBodySelector = "[class*=modal-body]";
  const modalCancelSelector = "[class*=modal-cancel]";
  const modalConfirmSelector = "[class*=modal-confirm]";

  it("ActionMenu Action", () => {
    // Check if ActionMenu opens

    // Arrange
    cy.visit(
      "http://localhost:" +
        localPort +
        "/search?q=" +
        jobID +
        "&sel=" +
        jobID +
        "&exp=&details=false&log=false"
    );
    // Assert
    cy.get(graphDataSelector).rightclick();
  });

  it("Kill Action", () => {
    // Check if ActionMenu opens

    // Arrange
    cy.visit(
      "http://localhost:" +
        localPort +
        "/search?q=" +
        jobID +
        "&sel=" +
        jobID +
        "&exp=&details=false&log=false"
    );
    // Act
    cy.get(graphDataSelector).rightclick();
    cy.get(killActionSelector).click();
    // Assert
    cy.get(modalBodySelector).contains(jobID);
    // Act
    cy.get(modalConfirmSelector).click();
  });

  it("Running Action", () => {
    // Check if ActionMenu opens

    // Arrange
    cy.visit(
      "http://localhost:" +
        localPort +
        "/search?q=" +
        jobID +
        "&sel=" +
        jobID +
        "&exp=&details=false&log=false"
    );
    // Act
    cy.get(graphDataSelector).rightclick();
    cy.get(requeneActionRunningSelector).click();
    // Assert
    cy.get(modalBodySelector).contains(jobID);
    // Act
    cy.get(modalConfirmSelector).click();
  });

  it("View Job Details Action", () => {
    // Check if ActionMenu opens

    // Arrange
    cy.visit(
      "http://localhost:" +
        localPort +
        "/search?q=" +
        jobID +
        "&sel=" +
        jobID +
        "&exp=&details=false&log=false"
    );
    // Act
    cy.get(graphDataSelector).rightclick();
    cy.get(viewDetailsSelector).click();
    // Assert
    cy.get(".object-details-content").contains("Select job to view");
    cy.get(".panel-default").should("not.exist");
    cy.get(".detail-form").should("not.exist");
  });

  it("Hide Action", () => {
    // Check if ActionMenu opens

    // Arrange
    cy.visit(
      "http://localhost:" +
        localPort +
        "/search?q=" +
        jobID +
        "&sel=" +
        jobID +
        "&exp=&details=false&log=false"
    );
    // Act
    cy.get(graphDataSelector).rightclick();
    cy.get(jobVisibilitySelector).click();
  });
});
