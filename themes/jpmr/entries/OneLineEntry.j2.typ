#v(0.3em)
#grid(
  columns: (5cm, 1fr),
  column-gutter: 0.4cm,
  row-gutter: 0.4em,
  align(right)[#set par(justify: false); #text(weight: {{ design.typography.font_weight.entry_title }}, size: {{ design.typography.font_size.entry_title }})[{{ entry.label }}\u{202f}:]],
  text(weight: {{ design.typography.font_weight.entry_detail }}, size: {{ design.typography.font_size.entry_detail }})[{{ entry.details }}]
)
