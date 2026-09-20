#let resume = json("../src/data/resume.json")
#let basics = resume.basics

// LaTeX sets 10pt type on a 12pt baseline. Typst measures leading from the baseline to the next
// line's cap height, so the gap is 12pt minus the 6.83pt cap height of 10pt Computer Modern.
#let gap = 12pt - 6.83pt

#set document(title: basics.name + " Résumé", author: basics.name)
#set page(paper: "us-letter", margin: (left: 0.35in, right: 0.35in, top: 0.25in, bottom: 0.22in))
#set text(font: "New Computer Modern", size: 10pt, lang: "en", region: "US", hyphenate: false)
#set par(justify: true, leading: gap, spacing: gap)
#set list(indent: 0pt, body-indent: 5pt)

#show link: set text(fill: rgb(0, 0, 255))
#show title: set text(size: 14.4pt)
#show title: set block(below: gap + 3pt)
#show heading: set text(size: 10pt)
// Section spacing is what holds the résumé to a single page; at gap + 8pt the last two bullets spill.
#show heading: set block(
  above: gap + 5pt,
  below: 3.6pt,
  width: 100%,
  inset: (bottom: 3.4pt),
  stroke: (bottom: 0.4pt),
)

#let months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

#let month-year(date) = {
  let (year, ..rest) = date.split("-")
  if rest.len() == 0 { year } else { months.at(int(rest.first()) - 1) + " " + year }
}

#let dates(item) = {
  let end = item.at("endDate", default: none)
  month-year(item.startDate) + " – " + if end == none { "Present" } else { month-year(end) }
}

#let bare(url) = url.replace(regex("^https?://(www\.)?"), "")

// Text between backticks is code, like \texttt in the LaTeX version. JSON strings skip Typst's
// smart quotes, so apostrophes are curled here.
#let rich(value) = value.split("`").enumerate().map(((i, part)) => {
  if calc.odd(i) { raw(part) } else { part.replace("'", "’") }
}).join()

#let entry(title, place, subtitle, when) = [
  #strong(title) #h(1fr) #strong(place) \
  #emph(subtitle) #h(1fr) #emph(when)
]

#align(center)[
  #title(upper(basics.name))
  #(
    link("mailto:" + basics.email, basics.email),
    link(basics.url, bare(basics.url)),
    ..basics.profiles.map(profile => link(profile.url, bare(profile.url))),
    basics.location.city + ", " + basics.location.region,
  ).join(" | ")
]

// LaTeX sets the first section closer to the header than the ones after it.
#v(-2.4pt)

= Education
#for school in resume.education {
  entry(school.institution, none, school.studyType + " in " + school.area, month-year(school.endDate))
}

= Experience
#for (i, job) in resume.work.enumerate() {
  if i > 0 { v(0.2em) }
  entry(job.name, job.location, job.position, dates(job))
  list(..job.highlights.map(rich))
}

= Skills
#resume.skills.map(skill => [#strong(skill.name + ":") #skill.keywords.join(", ")]).join(linebreak())

= Projects
#for (i, project) in resume.projects.enumerate() {
  if i > 0 { v(0.2em) }
  [#strong(project.name + " — " + project.description) | #link(project.url, emph[Repo])]
  // The LaTeX project lists use a wider 14pt left margin.
  list(indent: 4pt, ..project.highlights.map(rich))
}

= Publications & Presentations
#list(..resume.publications.map(publication => [
  #rich(publication.summary.trim(".", at: end)) (#link(publication.url, emph[Link]))
]))
