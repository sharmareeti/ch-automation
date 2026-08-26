@wizard @accounts
Feature: Choosing an account type when filing company accounts

  The "File your company annual accounts" journey opens by asking which type of
  accounts have been prepared. The answer branches five ways, and three of those
  branches land on a different part of the service.

  Background:
    Given I am on the "Select account type" page

  @smoke
  Scenario: The account type question is asked first
    Then I should see the heading "Which type of accounts have you prepared?"
    And I should not see an error summary

  @smoke
  Scenario Outline: Each account type leads to its own guidance
    When I set "account type" to "<account type>"
    And I continue
    Then I should be on the "<destination>" page
    And I should see the heading "<heading>"

    Examples: Types that share the guidance page
      | account type             | destination           | heading                                         |
      | Micro-entity accounts    | Accounts filing guide | File micro-entity accounts with Companies House |
      | Abridged accounts        | Accounts filing guide | File abridged accounts with Companies House     |
      | Dormant company accounts | Accounts filing guide | File dormant accounts with Companies House      |

    Examples: Types routed elsewhere in the service
      | account type     | destination             | heading                                     |
      | Full accounts    | Full accounts criteria  | File full accounts with Companies House     |
      | Package accounts | Package accounts filing | File package accounts with Companies House  |

  Scenario: The question cannot be skipped
    When I continue without answering
    Then I should see the error summary:
      | Select the type of accounts you have prepared |
    And I should be on the "Select account type" page

  Scenario: An answer can be revised by going back
    When I set "account type" to "Full accounts"
    And I continue
    Then I should be on the "Full accounts criteria" page
    When I go back
    Then I should be on the "Select account type" page
