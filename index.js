/**
 * Name: Nikola Bojanic
 * Date: May 4, 2021
 * Section: CSE 154 AF
 * This page provides the interactivity, fetching data from the
 * fiscal data API for the app.
 */
"use strict";
(function () {
  // Debt API with filter for only total debt field
  // Set up to get the most recent one response
  // Split up because linter hates long lines
  const URL1 = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/"
  const URL2 = "v2/accounting/od/debt_outstanding?sort=-record_date&page[size]=1";
  const URL = URL1 + URL2;

  const ONE_TRILLION = 1000000000000;

  let currentDebt;

  window.addEventListener("load", init);

  /**
   * Initialize the button to respond to click.
   */
  async function init() {
    document.querySelector("button").addEventListener("click", onSubmit);
    const today = new Date().toISOString().substring(0, 10);
    currentDebt = await fetchDebt(today);
  }

  /**
   * Submits form and begins fetching and displaying debt data.
   */
  async function onSubmit() {
    let input = document.querySelector("input");
    if(input.value === "") {
      handleError("Incomplete Date");
    } else {
      try {
        let debt = await fetchDebt(input.value);
        displayResponse(debt);
        const errorDisplay = document.getElementById("error");
        errorDisplay.classList.add("hidden");
      } catch (err) {
        handleError(err);
      }
    }
  }

  /**
   * Gets the debt data available closest to given date
   * @param {string} date - user's birthdate
   * @returns {number} debt
   */
  async function fetchDebt(date) {
    let response;
    response = await fetch(URL + `&filter=record_date:lt:${date}`);
    response = await statusCheck(response);
    response = await response.json();
    return response.data[0].debt_outstanding_amt;
  }

  /**
   * Displays a comparison of debt values
   * @param {number} oldDebt - debt to display in comparison to current debt
   */
  function displayResponse(oldDebt) {
    const diff = currentDebt - oldDebt;
    const percent = Math.floor(diff / oldDebt * 100);
    document.getElementById("before").textContent = "The Federal Debt has increased ";
    const beforeSpan = document.createElement("span");
    beforeSpan.id="before";
    beforeSpan.textContent = "The Federal Debt has increased ";
    document.getElementById("before").replaceWith(beforeSpan);
    document.querySelector("strong").textContent = `${percent}%`;
    // Multiply and divide by 100 to get two digits behind decimal
    const trillions = Math.round(diff / ONE_TRILLION * 100) / 100;
    document.querySelector("em").textContent = `(${trillions} trillion dollars)`;
  }

  /**
   * Warns the user of an error
   * @param {string} err - error information to be displayed
   */
  function handleError(err) {
    const errorDisplay = document.getElementById("error");
    errorDisplay.classList.remove("hidden");
    errorDisplay.textContent = `Something went wrong. Make sure the date is valid. [${err}]`;
  }

  /**
   * Throws an error if response status not OK
   * @param {fetch response} response - the response to examine
   * @returns response
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
  }
})();
