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
= #text(weight: 300, fill: rgb("777777"))[#first]#text(weight: "bold", fill: rgb("333333"))[#last]
{% endif %}

{% if cv.headline %}
  #align(center)[#text(fill: rgb("fc5c45"), tracking: 0.3pt, size: 8pt)[#smallcaps("{{ cv.headline }}")]]

{% endif %}
#connections(
{% for connection in cv._connections %}
  [{{ connection }}],
{% endfor %}
)
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
