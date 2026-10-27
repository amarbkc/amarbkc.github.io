---
title: About
description: Background, research interests, education, and experience of Amar KC.
permalink: /about/
lead: Computer science graduate interested in machine learning, optimization, and the mathematics that makes learning algorithms work.
---

{%- comment -%}
  Edit the prose below directly. Education, experience, and skills are pulled
  from _data/profile.yml (shared with the CV page) — edit them there.
{%- endcomment -%}

## Background

I am Amar KC. I graduated from Howard University in May 2026 with a B.S. in
Computer Science and a minor in Mathematics.

I learn best by building things from the ground up. When I study an algorithm,
I try to derive it, prove why it is correct, implement it without high-level
libraries, and then compare my implementation against the established one.
This website is a record of that process: the projects are implementations,
and the blog posts are the explanations I wish I had when I started.

## Research interests

My interests sit where machine learning meets mathematics:

{% for item in site.data.profile.research_interests -%}
- {{ item }}
{% endfor %}

I am particularly interested in the *theoretical foundations of learning*: why
optimization methods such as gradient descent work on the objectives we give
them, what guarantees statistical learning theory can and cannot provide, and
how geometric structure in data can be exploited by algorithms.

## Technical interests

- **AI and machine learning** — neural networks, optimization for training, and
  understanding models through their mathematics rather than only their APIs.
- **Mathematical optimization** — convexity, gradient-based methods, and
  convergence.
- **Algorithms** — correctness proofs, complexity analysis, and clean
  implementations of classical algorithms and data structures.
- **Computational geometry** — geometric algorithms and their use in
  graphics and simulation, an interest that grew out of my summer research.

{% include profile-sections.html %}

## CV / résumé

A summary of my education and experience is on the [CV page]({{ '/cv/' | relative_url }}){% if site.cv_pdf != "" %}, and you can [download my CV as a PDF]({{ site.cv_pdf | relative_url }}){% endif %}.

## Contact

{% include contact-links.html %}
