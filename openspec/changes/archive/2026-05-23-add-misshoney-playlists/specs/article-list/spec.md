## ADDED Requirements

### Requirement: ArticleListItem supports optional completion circle

`ArticleListItem` accepts a `showCompletion` prop (boolean, default `true`) that controls whether the completion circle is rendered.

#### Scenario: showCompletion defaults to true — existing behaviour unchanged

- **WHEN** `ArticleListItem` is used without the `showCompletion` prop
- **THEN** the completion circle is displayed as before

- **WHEN** `ArticleListItem` is used with `showCompletion="true"` explicitly
- **THEN** the completion circle is displayed

#### Scenario: showCompletion false hides the circle

- **WHEN** `ArticleListItem` is rendered with `:showCompletion="false"`
- **THEN** no completion circle or completion indicator is rendered for that item; the rest of the card (title, subtitle, click behaviour) is unaffected

#### Scenario: MissHoney homepage cards use showCompletion false

- **WHEN** the homepage MissHoney section renders its A1/A2/B1/B2 cards via `ArticleListItem`
- **THEN** each card is passed `:showCompletion="false"` and renders without a completion circle
