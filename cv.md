---
title: CV
description: Curriculum vitae of Amar KC — education, research experience, and skills.
permalink: /cv/
---

{%- comment -%}
  Facts come from _data/profile.yml. The PDF link comes from `cv_pdf` in _config.yml.
{%- endcomment -%}

{% if site.cv_pdf != "" %}
<p class="no-print">
  <a class="button button--primary" href="{{ site.cv_pdf | relative_url }}">Download CV (PDF)</a>
</p>
{% else %}
<div class="notice notice--todo no-print" markdown="1">
**CV PDF not added yet.** Copy your PDF into `assets/cv/` (for example
`assets/cv/Amar_KC_CV.pdf`) and set `cv_pdf: "/assets/cv/Amar_KC_CV.pdf"` in
`_config.yml`. A download button will then appear here and on the About page.
</div>
{% endif %}

**{{ site.author.name }}**
{%- if site.email != "" %} · [{{ site.email }}](mailto:{{ site.email }}){% endif %}
{%- if site.github_username != "" %} · [github.com/{{ site.github_username }}](https://github.com/{{ site.github_username }}){% endif %}
{%- if site.linkedin_url != "" %} · [LinkedIn]({{ site.linkedin_url }}){% endif %}

## Research interests

{{ site.data.profile.research_interests | join: " · " }}

{% include profile-sections.html %}

<p class="no-print"><small>This page is formatted for printing — use your browser's Print command to save it as a PDF.</small></p>
