@search @company
Feature: Finding a company and reading its record

  The public register journey: search, open a company, then move between the
  tabs of its record.

  @smoke
  Scenario: Searching the register by name
    Given I am on the "Company search results" page for "tesco"
    Then I should see the heading "Search results"
    And there should be at least 1 "results"
    And the list of "results" should include "TESCO PLC"

  @smoke
  Scenario: Reading a company record
    Given I am on the "Company profile" page for "00445790"
    Then I should see the heading "TESCO PLC"
    And the "company number" should be "00445790"
    And the "company status" should be "Active"
    And the "incorporation date" should contain "1947"

  Scenario: Moving from a company record to its filing history
    Given I am on the "Company profile" page for "00445790"
    When I click "Filing history"
    Then I should be on the "Filing history" page
    And there should be at least 1 "filings"
