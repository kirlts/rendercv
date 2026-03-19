#let title = "{{ section_title }}"
#let first-three = if title.len() >= 3 { title.slice(0, 3) } else { title }
#let rest = if title.len() >= 3 { title.slice(3) } else { "" }

#block(
  above: {{ design.section_titles.space_above }},
  below: {{ design.section_titles.space_below }},
  [
    #grid(
      columns: (auto, 1fr),
      align: (left, horizon),
      column-gutter: 0.3em,
      text(size: {{ design.typography.font_size.section_titles }}, weight: {{ design.typography.font_weight.section_titles }}, fill: {{ design.colors.section_titles.as_rgb() }})[#first-three] + text(size: {{ design.typography.font_size.section_titles }}, weight: {{ design.typography.font_weight.section_titles }}, fill: rgb("333333"))[#rest],
      box(width: 1fr, move(dy: 0.15em, line(length: 100%, stroke: {{ design.section_titles.line_thickness }} + black)))
    )
  ]
)

{% if entry_type in ["ReversedNumberedEntry"] %}
#reversed-numbered-entries(
  [
{% endif %}
