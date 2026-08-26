@search @advanced-search
Feature: Advanced company search

  Advanced search is the widest form on the service: free text, day/month/year
  date inputs and two large checkbox groups on a single page. The same steps
  drive all of them because the page definition says what each field is.

  Background:
    Given I am on the "Advanced company search" page

  @smoke
  Scenario: Searching on a company name
    When I fill in:
      | company name contains | tesco |
    And I continue
    Then I should be on the "Advanced search results" page
    And there should be at least 1 "results"
    And the list of "results" should include "TESCO"

  Scenario: Combining a name, a status and an incorporation date range
    When I fill in:
      | company name contains | tesco             |
      | company status        | Active            |
      | incorporated from     | 01/01/1900        |
      | incorporated to       | 31/12/2020        |
    And I continue
    Then I should be on the "Advanced search results" page
    And there should be at least 1 "results"

  Scenario: Filtering by more than one company type
    When I fill in:
      | company name contains | tesco                                       |
      | company type          | Private limited company, Public limited company |
    And I continue
    Then I should be on the "Advanced search results" page
    And there should be at least 1 "results"

  Scenario: Excluding names
    When I fill in:
      | company name contains | tesco  |
      | company name excludes | stores |
    And I continue
    Then I should be on the "Advanced search results" page
    And there should be at least 1 "results"
