## ADDED Requirements

### Requirement: NavBar contains MissHoney entry

The NavBar now includes a MissHoney dropdown button in addition to the existing 首頁, 內容, and 文法 buttons.

#### Scenario: MissHoney button is present between 內容 and 文法

- **WHEN** the user views any page
- **THEN** the NavBar displays buttons in this order: 首頁 | 內容 ▾ | MissHoney ▾ | 文法

#### Scenario: all existing NavBar buttons remain functional

- **WHEN** the user clicks 首頁
- **THEN** the app navigates to `/`

- **WHEN** the user clicks 文法
- **THEN** the app navigates to `/grammar`

- **WHEN** the user clicks 內容 ▾
- **THEN** the chapter dropdown opens as before, showing ch1–ch4
