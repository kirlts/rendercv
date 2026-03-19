{% macro image() %}
#pad(left: {{ design.header.photo_space_left }}, right: {{ design.header.photo_space_right }}, image("{{ cv.photo.name }}", width: {{ design.header.photo_width }}))
{% endmacro %}

{% if cv.photo %}
{% set photo = "image(\"" + cv.photo|string + "\", width: "+ design.header.photo_width + ")" %}
#grid(
{% if design.header.photo_position == "left" %}
  columns: (auto, 1fr),
{% else %}
  columns: (1fr, auto),
{% endif %}
  column-gutter: 0cm,
  align: horizon + left,
{% if design.header.photo_position == "left" %}
  [{{ image() }}],
  [
{% else %}
  [
{% endif %}
{% endif %}
{% if cv.name %}
#let parts = "{{ cv.name }}".split(" ")
#let (first, last) = if parts.len() == 2 {
  (parts.at(0) + " ", parts.at(1))
} else {
  let half = int(calc.floor(parts.len() / 2))
  (parts.slice(0, half).join(" ") + " ", parts.slice(half).join(" "))
}
#align({{ design.header.alignment }})[
  #text(size: {{ design.typography.font_size.name }})[
    #text(weight: {{ [100, design.typography.font_weight.name - 200]|max }}, fill: rgb("999999"))[#first]#text(weight: {{ design.typography.font_weight.name }}, fill: rgb("333333"))[#last]
  ]
]
#v({{ design.header.space_below_name }})
{% endif %}

{% if cv.headline %}
#align({{ design.header.alignment }})[
  #text(fill: {{ design.colors.headline.as_rgb() }}, tracking: 0.3pt, size: {{ design.typography.font_size.headline }}, weight: {{ design.typography.font_weight.headline }})[
    {% if design.typography.small_caps.headline %}
    #smallcaps("{{ cv.headline }}")
    {% else %}
    "{{ cv.headline }}"
    {% endif %}
  ]
]
#v({{ design.header.space_below_headline }})
{% endif %}
#align({{ design.header.alignment }})[
  #connections(
  {% for connection in cv._connections %}
    [{{ connection }}],
  {% endfor %}
  )
]
#v({{ design.header.space_below_connections }})
{% if cv.photo %}
{% if design.header.photo_position == "left" %}
  ]
)
{% else %}
  ],
  [{{ image() }}],
)
{% endif %}
{% endif %}
